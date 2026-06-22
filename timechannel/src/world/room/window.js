/* ============================================================
   凸窗（右墙）：飘窗座 + 多格窗棂 + 暖夕光玻璃（带天空渐变）+ 厚重窗帘 + 窗台绿植
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_H as H, FLOOR_Y, box, cyl, ball, cone, softSprite, castAll } from './kit.js';

function skyGlassTex() {
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 256;
  const c = cv.getContext('2d');
  const g = c.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#ffe9bd'); g.addColorStop(0.4, '#ffcf94'); g.addColorStop(0.7, '#f0a070'); g.addColorStop(1, '#9a5a5a');
  c.fillStyle = g; c.fillRect(0, 0, 128, 256);
  // 远山剪影
  c.fillStyle = 'rgba(60,40,50,0.5)';
  c.beginPath(); c.moveTo(0, 200);
  for (let x = 0; x <= 128; x += 12) c.lineTo(x, 200 + Math.sin(x * 0.1) * 14 - 10);
  c.lineTo(128, 256); c.lineTo(0, 256); c.fill();
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function buildWindow(ctx) {
  const { scene, M } = ctx;
  const x = W / 2 - 0.4;
  const g = new THREE.Group(); g.position.set(x, FLOOR_Y, 6); g.rotation.y = -Math.PI / 2;

  // 大窗框
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x3a2614, roughness: 0.7 });
  g.add(box(8.5, 9.5, 0.5, frameMat));
  // 玻璃（暖夕光）
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(7.4, 8.4), new THREE.MeshBasicMaterial({ map: skyGlassTex() }));
  pane.position.set(0, 0.5, 0.2); g.add(pane);
  const paneGlow = new THREE.Mesh(new THREE.PlaneGeometry(7.4, 8.4), new THREE.MeshBasicMaterial({ map: softSprite('rgba(255,228,176,0.7)', 'rgba(255,200,120,0)', 'glow'), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
  paneGlow.position.set(0, 0.5, 0.24); g.add(paneGlow);
  // 窗棂格（3×4）
  for (const yy of [-3, -1, 1, 3]) { const m = box(7.6, 0.14, 0.34, frameMat); m.position.set(0, yy + 0.5, 0.26); g.add(m); }
  for (const xx of [-2.4, 0, 2.4]) { const m = box(0.14, 8.6, 0.34, frameMat); m.position.set(xx, 0.5, 0.26); g.add(m); }
  // 厚重窗帘（两侧 + 上方帘头）
  const cur = M.velvetRed;
  for (const sx of [-4.4, 4.4]) {
    const drape = box(1.6, 9.4, 0.5, cur); drape.position.set(sx, 0.3, 0.6); drape.rotation.y = sx < 0 ? 0.1 : -0.1; g.add(drape);
    // 帘褶
    for (let i = 0; i < 4; i++) { const fold = cyl(0.16, 0.16, 9.0, cur, 8); fold.position.set(sx - 0.5 + i * 0.32, 0.3, 0.85); g.add(fold); }
  }
  const valance = box(9.0, 1.2, 0.6, cur); valance.position.set(0, 4.6, 0.6); g.add(valance);
  // 系带
  for (const sx of [-4.4, 4.4]) { const tie = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.12, 8, 16), M.brass); tie.position.set(sx, 0.5, 0.9); tie.rotation.y = Math.PI / 2; g.add(tie); }

  // 飘窗座（连墙长凳 + 软垫 + 抱枕）
  const seat = box(8.0, 1.2, 2.0, M.oakMed); seat.position.set(0, -H / 2 + 1.2 + 0.6 - FLOOR_Y * 0 - (H / 2) + 0, 1.4);
  // 简化定位：座面在地板上方 ~1.5
  seat.position.set(0, (-H / 2 + 1.5) - FLOOR_Y, 1.4);
  g.add(seat);
  const cushion = box(7.8, 0.4, 1.9, M.velvetGreen); cushion.position.set(0, (-H / 2 + 2.1) - FLOOR_Y, 1.4); g.add(cushion);
  for (let i = -2; i <= 2; i++) { const pil = box(1.2, 1.0, 0.5, i % 2 ? M.velvetRed : M.velvetGreen); pil.position.set(i * 1.6, (-H / 2 + 2.6) - FLOOR_Y, 0.7); pil.rotation.x = -0.5; g.add(pil); }

  // 窗台绿植（两盆）
  for (const px of [-3, 3]) {
    const pot = cyl(0.4, 0.3, 0.6, new THREE.MeshStandardMaterial({ color: 0x7a4a2a, roughness: 0.8 }), 14);
    pot.position.set(px, (-H / 2 + 3.0) - FLOOR_Y, 1.4); g.add(pot);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x3a6a3a, roughness: 0.8 });
    for (let i = 0; i < 7; i++) { const l = cone(0.12, 1.0 + Math.random() * 0.6, leafMat, 6); l.position.set(px + (Math.random() - 0.5) * 0.4, (-H / 2 + 3.7) - FLOOR_Y, 1.4 + (Math.random() - 0.5) * 0.4); l.rotation.set((Math.random() - 0.5) * 0.6, 0, (Math.random() - 0.5) * 0.6); g.add(l); }
  }

  castAll(g, true, true);
  scene.add(g);

  // 透进来的暖光（在窗内侧补一盏，呼应主投影光）
  const wl = new THREE.PointLight(0xffcf94, 1.1, 30, 1.4); wl.position.set(x - 3, 1, 6); scene.add(wl);
  return g;
}
