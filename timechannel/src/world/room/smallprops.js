/* ============================================================
   小道具：唱片柜+一摞黑胶 + 打字机 + 黄铜文具组 + 棋钟 + 放大镜 +
   系丝带的信札 + 黄铜铃 + 烛台。散落各处的生活痕迹。
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_D as D, FLOOR_Y, box, cyl, ball, contactShadow, castAll, mulberry } from './kit.js';

export function buildSmallprops(ctx) {
  const { scene, M } = ctx;
  const rnd = mulberry(417);

  /* 唱片柜 + 黑胶（留声机旁） */
  (() => {
    const g = new THREE.Group(); g.position.set(W / 2 - 4.5, FLOOR_Y, 1.5);
    const cab = box(1.8, 1.6, 1.6, M.oakDark); cab.position.y = 0.8; g.add(cab);
    const top = box(2.0, 0.1, 1.8, M.oakLight); top.position.y = 1.65; g.add(top);
    // 立着的一排黑胶封套
    const sleeves = ['#8a3a3a', '#3a5a8a', '#6a6a3a', '#3a7a5a', '#7a4a6a', '#5a4a3a'];
    for (let i = 0; i < 10; i++) { const s = box(0.04, 1.2, 1.2, new THREE.MeshStandardMaterial({ color: sleeves[i % sleeves.length], roughness: 0.7 })); s.position.set(-0.7 + i * 0.14, 0.85, 0); s.rotation.z = (rnd() - 0.5) * 0.08; g.add(s); }
    // 唱片本体露出一角
    const disc = cyl(0.55, 0.55, 0.02, new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 0.3, metalness: 0.2 }), 24); disc.position.set(0.85, 1.71, 0); disc.rotation.x = -0.1; g.add(disc);
    const lbl = cyl(0.18, 0.18, 0.021, new THREE.MeshStandardMaterial({ color: 0xc24a3a, roughness: 0.6 }), 16); lbl.position.set(0.85, 1.72, 0); lbl.rotation.x = -0.1; g.add(lbl);
    castAll(g, true, true); scene.add(g); contactShadow(scene, W / 2 - 4.5, 1.5, 3);
  })();

  /* 打字机（小几上） */
  (() => {
    const g = new THREE.Group(); g.position.set(-W / 2 + 9, FLOOR_Y, 13.5); g.rotation.y = 0.5;
    const stand = box(1.6, 1.5, 1.2, M.oakMed); stand.position.y = 0.75; g.add(stand);
    const standTop = box(1.8, 0.1, 1.4, M.oakLight); standTop.position.y = 1.55; g.add(standTop);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1e, roughness: 0.4, metalness: 0.3, envMapIntensity: 0.6 });
    const body = box(1.2, 0.5, 1.0, bodyMat); body.position.y = 1.85; g.add(body);
    const carriage = box(1.4, 0.2, 0.3, bodyMat); carriage.position.set(0, 2.15, -0.3); g.add(carriage);
    const paper = box(0.9, 0.6, 0.02, new THREE.MeshStandardMaterial({ color: 0xf4ecd6, roughness: 0.85 })); paper.position.set(0, 2.4, -0.3); paper.rotation.x = -0.2; g.add(paper);
    // 键盘圆键
    for (let r = 0; r < 3; r++) for (let cc = 0; cc < 9; cc++) { const key = cyl(0.05, 0.05, 0.05, M.silver, 10); key.position.set(-0.5 + cc * 0.12, 1.95 + r * 0.04, 0.2 - r * 0.12); g.add(key); }
    castAll(g, true, true); scene.add(g); contactShadow(scene, -W / 2 + 9, 13.5, 3);
  })();

  /* 一组小物放在沙发咖啡桌附近的地面/矮处（独立小托盘） */
  (() => {
    const tray = new THREE.Group(); tray.position.set(-1, FLOOR_Y + 1.32, 5.4); // 咖啡桌面附近
    // 黄铜文具组：墨水瓶 + 拆信刀 + 印章
    const ink = cyl(0.1, 0.12, 0.16, new THREE.MeshStandardMaterial({ color: 0x14202a, roughness: 0.3, metalness: 0.3 }), 12); ink.position.set(-0.4, 0.08, 0); tray.add(ink);
    const opener = box(0.5, 0.02, 0.06, M.brass); opener.position.set(0.1, 0.02, 0.1); opener.rotation.y = 0.4; tray.add(opener);
    const stamp = cyl(0.06, 0.06, 0.14, M.brass, 10); stamp.position.set(0.3, 0.07, -0.1); tray.add(stamp);
    // 棋钟
    const clk = box(0.5, 0.3, 0.2, M.oakDark); clk.position.set(-0.6, 0.15, -0.3); tray.add(clk);
    for (const dx of [-0.12, 0.12]) { const f = cyl(0.08, 0.08, 0.02, M.porcelainMat, 14); f.position.set(-0.6 + dx, 0.15, -0.2); f.rotation.x = Math.PI / 2; tray.add(f); }
    // 放大镜
    const mag = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 8, 18), M.brass); mag.position.set(0.5, 0.02, 0.3); mag.rotation.x = Math.PI / 2; tray.add(mag);
    const lens = cyl(0.11, 0.11, 0.01, new THREE.MeshPhysicalMaterial({ color: 0xdfeef2, roughness: 0.05, transmission: 0.7, transparent: true, opacity: 0.4 }), 16); lens.position.set(0.5, 0.02, 0.3); lens.rotation.x = Math.PI / 2; tray.add(lens);
    const handle = box(0.02, 0.3, 0.02, M.oakDark); handle.position.set(0.5, 0.02, 0.48); tray.add(handle);
    // 系丝带的信札
    for (let k = 0; k < 4; k++) { const ltr = box(0.5, 0.02, 0.34, new THREE.MeshStandardMaterial({ color: 0xeee2c6, roughness: 0.85 })); ltr.position.set(-0.1, 0.02 + k * 0.022, -0.4); ltr.rotation.y = (rnd() - 0.5) * 0.1; tray.add(ltr); }
    const ribbon = box(0.08, 0.12, 0.36, M.velvetRed); ribbon.position.set(-0.1, 0.07, -0.4); tray.add(ribbon);
    castAll(tray, true, false); scene.add(tray);
  })();

  /* 黄铜铃 + 烛台（沙发边几一角，独立小桌） */
  (() => {
    const t = new THREE.Group(); t.position.set(-4.6, FLOOR_Y, 4.6);
    const top = cyl(0.5, 0.5, 0.1, M.oakLight, 18); top.position.y = 1.6; t.add(top);
    const post = cyl(0.08, 0.1, 1.6, M.oakDark, 10); post.position.y = 0.8; t.add(post);
    const foot = cyl(0.4, 0.4, 0.1, M.oakDark, 14); foot.position.y = 0.05; t.add(foot);
    const bell = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), M.brass); bell.position.set(0.15, 1.8, 0); bell.rotation.x = Math.PI; t.add(bell);
    const bhandle = cyl(0.02, 0.02, 0.2, M.oakDark, 6); bhandle.position.set(0.15, 1.95, 0); t.add(bhandle);
    const cs = cyl(0.1, 0.14, 0.12, M.brass, 12); cs.position.set(-0.15, 1.72, 0); t.add(cs);
    const candle = cyl(0.05, 0.06, 0.4, new THREE.MeshStandardMaterial({ color: 0xf0e4c8, roughness: 0.6 }), 8); candle.position.set(-0.15, 1.95, 0); t.add(candle);
    castAll(t, true, true); scene.add(t); contactShadow(scene, -4.6, 4.6, 2.2);
  })();

  return scene;
}
