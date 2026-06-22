/* ============================================================
   TimeChannel 装配与主循环
   数据流：album（唯一真源）→ events → tunnel / timeline / focus / panels
============================================================ */
import * as THREE from 'three';
import './style.css';
import { VERSION, CFG, FLYOUT, curveX, curveY } from './config.js';
import { events } from './events.js';
import { camera, render, renderer } from './core/stage.js';
import { updateGodRays, godRaysPass } from './core/godrays.js';
import { flow } from './flow.js';
import { startPuzzle } from './puzzle.js';
import * as room from './world/room.js';
import { loadDefaultPhotos, attachDemoDates, loadPersistedAlbum } from './album/album.js';
import * as tunnel from './world/tunnel.js';
import * as sky from './world/sky.js';
import * as particles from './world/particles.js';
import * as meteors from './world/meteors.js';
import * as controls from './interact/controls.js';
import * as hover from './interact/hover.js';
import * as focus from './interact/focus.js';
import * as timeline from './ui/timeline.js';
import './ui/story.js';
import './ui/panels.js';
import './ui/hint.js';

console.log(`%cTimeChannel ${VERSION}`, 'color:#ffe4c3');

/* ---------- 相册变更：顺序敏感，集中编排 ---------- */
events.on('album:changed', () => {
  tunnel.onAlbumChanged(); // 先重铺照片（重置游标后的索引）
  focus.forceClose();      // 再收起聚焦（恢复成新铺的纹理）
  timeline.rebuild();      // 最后重建时间轴
});

/* ---------- 调试句柄 ---------- */
window.__tc = { meteors: meteors.meteors, spawnMeteor: meteors.spawnMeteor, camera, flow, room, flyout: startFlyout };
window.__tcFocus = () => focus.debugState();

/* ---------- 主循环：tunnel（找照片）→ flyout（指数冲出+白场）→ room（橡木房间） ---------- */
const clock = new THREE.Clock();
const whiteEl = document.getElementById('tc-white');
let flyStart = 0;

// 确认正确照片 → 退出卡片、进入冲出过场
function startFlyout() {
  if (flow.mode !== 'tunnel') return;
  flow.mode = 'flyout'; flyStart = performance.now();
  focus.closeFocus();
}

// 白场峰值 → 落入橡木房间；房间离开后通知宿主
function enterRoom() {
  flow.mode = 'room';
  godRaysPass.uniforms.uIntensity.value = 0;
  room.enter(() => {
    if (whiteEl) whiteEl.style.opacity = '1';
    setTimeout(() => {
      try { if (window.parent !== window) window.parent.postMessage('tc:done', '*'); } catch (_) {}
    }, 700);
  });
  if (whiteEl) requestAnimationFrame(() => { whiteEl.style.opacity = '0'; }); // 白场退去，露出房间
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  const m = flow.mode;

  if (m === 'room' || m === 'done') { room.update(dt, t); render(t); return; }

  controls.update(dt, t);                                        // 仅 tunnel 模式生效

  let flySpeed = 0;
  const fp = m === 'flyout' ? (performance.now() - flyStart) / 1000 : 0; // 墙钟进度，与帧率无关
  if (m === 'flyout') {                                          // 指数加速冲向尽头
    flySpeed = 30 + fp * fp * 130;
    const cz = camera.position.z - flySpeed * dt;
    camera.position.set(curveX(cz), curveY(cz), cz);
    camera.lookAt(curveX(cz - 26), curveY(cz - 26), cz - 26);
    camera.fov = THREE.MathUtils.lerp(camera.fov, 95, dt * 2);
    camera.updateProjectionMatrix();
  }

  tunnel.update(dt, t, Math.abs(controls.controls.velocity) + flySpeed);
  hover.update();
  tunnel.updateCards(dt, t, m === 'tunnel' ? hover.getHovered() : null);
  focus.update(dt, t);
  sky.update(dt, t);
  particles.update(dt, t);
  meteors.update(dt, t);
  timeline.update();

  if (m === 'flyout') {                                          // 光束拉满 + 白场吞没
    godRaysPass.uniforms.uLightUV.value.set(0.5, 0.5);
    godRaysPass.uniforms.uIntensity.value = Math.min(godRaysPass.uniforms.uIntensity.value + dt * 1.6, 1.7);
    renderer.toneMappingExposure += (2.4 - renderer.toneMappingExposure) * Math.min(dt * 2, 1);
    const wk = Math.max(0, (fp / FLYOUT.dur - FLYOUT.whiteAt) / (1 - FLYOUT.whiteAt));
    if (whiteEl) whiteEl.style.opacity = String(Math.min(wk * wk, 1));
    if (fp >= FLYOUT.dur) enterRoom();
  } else {                                                       // tunnel：出口光束随速度
    const speedNorm = Math.min(Math.abs(controls.controls.velocity) / CFG.maxSpeed, 1);
    updateGodRays(camera, sky.getEndLightPos(), speedNorm, dt);
    renderer.toneMappingExposure += (1.05 + speedNorm * 0.18 - renderer.toneMappingExposure) * Math.min(dt * 3, 1);
  }
  render(t);
}

/* ---------- 启动 ---------- */
loadPersistedAlbum().then(async (hasPersistedAlbum) => {
  if (!hasPersistedAlbum) {
    await loadDefaultPhotos();
    attachDemoDates();
  }
  timeline.rebuild();
  tunnel.buildTunnel();
  startPuzzle(clock.elapsedTime, startFlyout); // 终章谜题：找正确照片 + 持续加速
  animate();
  document.getElementById('loader').classList.add('done');
  // 通知宿主页面（橡子旅馆把隧道作为最后一关嵌入）：通道已开启
  try { if (window.parent !== window) window.parent.postMessage('tc:ready', '*'); } catch (_) {}
});
