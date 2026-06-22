/* ============================================================
   橡木书房（终章）：冲出隧道后置身的 3D 交互房间
   一间暖光木质的大书房——壁炉/整墙藏书/沙发起居区/书桌/凸窗飘窗/
   照片画廊/落地摆钟/留声机/棋桌/枝形吊灯/浮尘光柱……
   壁炉台上那只发光的小橡果是最后一把钥匙：点亮它才能离开。
   由 world/room/*.js 各模块拼装，自成一个 scene，复用同一 composer/相机。
============================================================ */
import * as THREE from 'three';
import { camera, setRenderScene, renderer, bloom } from '../core/stage.js';
import { ROOM } from '../config.js';
import { photoItems } from '../album/album.js';
import { playRoomMusic, stopRoomMusic } from '../audio.js';
import { flow } from '../flow.js';
import { materials, painting, ROOM_H, FLOOR_Y } from './room/kit.js';
import { buildStructure } from './room/structure.js';
import { buildLibrary } from './room/library.js';
import { buildFireplace } from './room/fireplace.js';
import { buildSeating } from './room/seating.js';
import { buildDesk } from './room/desk.js';
import { buildWindow } from './room/window.js';
import { buildDecor } from './room/decor.js';
import { buildLighting } from './room/lighting.js';
import { buildAtmosphere } from './room/atmosphere.js';

let ctx = null, scene = null, toy = null, toyGlow = null;
let entered = false, picked = false, onExit = null;
let yaw = 0, pitch = 0;
const raycaster = new THREE.Raycaster();
const _ndc = new THREE.Vector2();
const clueEl = document.getElementById('roomClue');

function photoTex(i) {
  const list = photoItems.filter((p) => p && p.texture);
  if (list.length) return list[i % list.length].texture;
  return painting(i);
}

function build() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x150d06);
  scene.fog = new THREE.FogExp2(0x1a0f06, 0.012);
  ctx = { scene, M: materials(), anim: [], toy: null, toyGlow: null, photoTex };

  buildStructure(ctx);
  buildFireplace(ctx);   // 设置 ctx.toy / ctx.toyGlow
  buildLibrary(ctx);
  buildSeating(ctx);
  buildDesk(ctx);
  buildWindow(ctx);
  buildDecor(ctx);
  buildLighting(ctx);
  buildAtmosphere(ctx);

  toy = ctx.toy; toyGlow = ctx.toyGlow;
}

export function enter(onExitCb) {
  onExit = onExitCb;
  if (!scene) build();
  entered = true; picked = false; yaw = -0.04; pitch = -0.05;
  camera.position.set(0.5, FLOOR_Y + 5.0, 12.5); // 站在房间入口附近，望向壁炉
  camera.rotation.set(0, 0, 0); camera.rotation.order = 'YXZ';
  camera.fov = 62; camera.updateProjectionMatrix();
  renderer.toneMappingExposure = 1.15; // 从冲出白场的高曝光回到温暖室内
  bloom.strength = 0.42;
  setRenderScene(scene);
  if (clueEl) { clueEl.textContent = ROOM.clue; clueEl.classList.add('show'); }
  playRoomMusic();
}

export function update(dt, t) {
  if (!entered) return;
  camera.rotation.y = yaw; camera.rotation.x = pitch;
  for (const fn of ctx.anim) fn(dt, t);
  if (toy) {
    toy.rotation.y += dt * 0.7;
    const pulse = 0.7 + Math.sin(t * 2.2) * 0.3;
    toy.userData.body.material.emissiveIntensity = picked ? 2.6 : 0.7 + pulse * 0.7;
    if (toyGlow) toyGlow.material.opacity = picked ? 0.98 : 0.45 + pulse * 0.3;
    if (picked) toy.position.y += dt * 0.6; // 拾起后缓缓上浮
  }
}

/* ---------- 环视（拖动）+ 点击拾取 ---------- */
let dragging = false, lx = 0, ly = 0, moved = 0;
function onDown(e) { if (flow.mode !== 'room') return; dragging = true; moved = 0; lx = e.clientX; ly = e.clientY; }
function onMove(e) {
  if (!dragging || flow.mode !== 'room') return;
  const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY;
  moved += Math.abs(dx) + Math.abs(dy);
  yaw -= dx * 0.0026;
  pitch = THREE.MathUtils.clamp(pitch - dy * 0.0026, -0.95, 0.85);
}
function onUp(e) { if (flow.mode !== 'room') { dragging = false; return; } dragging = false; if (moved < 6) tryPick(e); }
function tryPick(e) {
  if (picked || !toy) return;
  raycaster.setFromCamera(_ndc.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1)), camera);
  if (raycaster.intersectObject(toy, true).length) pickToy();
}
function pickToy() {
  if (picked || !toy) return;
  picked = true;
  if (clueEl) clueEl.textContent = ROOM.pickedText;
  stopRoomMusic();
  setTimeout(() => { if (clueEl) clueEl.classList.remove('show'); flow.mode = 'done'; entered = false; if (onExit) onExit(); }, 1800);
}
window.addEventListener('pointerdown', onDown);
window.addEventListener('pointermove', onMove);
window.addEventListener('pointerup', onUp);

export function debugPick() { pickToy(); } // 测试用
