/* ============================================================
   书房骨架：地板 / 镶板墙 / 护墙板 / 踢脚 / 顶线 / 壁柱 / 格状天花 / 顶梁
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_H as H, ROOM_D as D, FLOOR_Y, box, castAll } from './kit.js';

export function buildStructure(ctx) {
  const { scene, M } = ctx;
  const g = new THREE.Group();

  // 外壳
  const shell = box(W, H, D, M.oakWall);
  g.add(shell);

  // 地板
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), M.floor);
  floor.rotation.x = -Math.PI / 2; floor.position.y = FLOOR_Y + 0.01; floor.receiveShadow = true;
  g.add(floor);

  // 天花（灰泥底）
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ color: 0x2c1d0f, roughness: 0.96 }));
  ceil.rotation.x = Math.PI / 2; ceil.position.y = H / 2 - 0.02;
  g.add(ceil);

  // 格状天花：纵横梁分格
  const beamMat = M.oakDark;
  for (let i = -2; i <= 2; i++) {
    const bx = box(0.5, 0.6, D - 1, beamMat); bx.position.set(i * (W / 5), H / 2 - 0.35, 0); g.add(bx);
  }
  for (let j = -3; j <= 3; j++) {
    const bz = box(W - 1, 0.6, 0.5, beamMat); bz.position.set(0, H / 2 - 0.32, j * (D / 7)); g.add(bz);
  }

  // 护墙板 + 踢脚 + 压顶 + 顶线（四面墙）
  const wainH = 3.4;
  const walls = [
    { x: 0, z: -D / 2 + 0.09, len: W, ry: 0 },
    { x: 0, z: D / 2 - 0.09, len: W, ry: 0 },
    { x: -W / 2 + 0.09, z: 0, len: D, ry: Math.PI / 2 },
    { x: W / 2 - 0.09, z: 0, len: D, ry: Math.PI / 2 },
  ];
  for (const w of walls) {
    // 护墙板底板
    const wains = box(w.len, wainH, 0.14, M.oakDark);
    wains.position.set(w.x, FLOOR_Y + wainH / 2, w.z); wains.rotation.y = w.ry; wains.receiveShadow = true;
    g.add(wains);
    // 护墙板上的方格镶板（每隔 ~3.5m 一格）
    const panels = Math.max(3, Math.round(w.len / 3.5));
    for (let p = 0; p < panels; p++) {
      const seg = w.len / panels;
      const px = -w.len / 2 + seg * (p + 0.5);
      const panel = box(seg * 0.78, wainH * 0.62, 0.06, M.oakMed);
      const wx = w.ry ? w.x : w.x + px;
      const wz = w.ry ? w.z + px : w.z;
      panel.position.set(wx, FLOOR_Y + wainH * 0.5, wz);
      panel.rotation.y = w.ry;
      // 凹板效果：稍微往房间里凸一点点
      panel.translateZ(0.06);
      g.add(panel);
    }
    // 踢脚线
    const base = box(w.len, 0.45, 0.22, M.trim);
    base.position.set(w.x, FLOOR_Y + 0.22, w.z); base.rotation.y = w.ry; g.add(base);
    // 护墙压顶（带突出的台面，可摆小物）
    const cap = box(w.len, 0.22, 0.34, M.trim);
    cap.position.set(w.x, FLOOR_Y + wainH, w.z); cap.rotation.y = w.ry; g.add(cap);
    // 顶线
    const crown = box(w.len, 0.5, 0.5, M.trim);
    crown.position.set(w.x, H / 2 - 0.7, w.z); crown.rotation.y = w.ry; g.add(crown);
    // 上部灰泥墙（护墙板与顶线之间）
    const upper = new THREE.Mesh(new THREE.PlaneGeometry(w.len, H - wainH - 1.1), M.plaster);
    const uy = FLOOR_Y + wainH + (H - wainH - 1.1) / 2;
    upper.position.set(w.x, uy, w.z);
    upper.rotation.y = w.ry + (w.ry ? 0 : Math.PI); // 朝向房间内
    if (!w.ry) upper.rotation.y = w.z < 0 ? 0 : Math.PI;
    g.add(upper);
  }

  // 角落壁柱（四角 + 长墙中点）
  const pilMat = M.oakMed;
  const pilPositions = [
    [-W / 2 + 0.3, -D / 2 + 0.3], [W / 2 - 0.3, -D / 2 + 0.3],
    [-W / 2 + 0.3, D / 2 - 0.3], [W / 2 - 0.3, D / 2 - 0.3],
    [-W / 2 + 0.3, 0], [W / 2 - 0.3, 0],
  ];
  for (const [px, pz] of pilPositions) {
    const pil = box(0.7, H - 1.2, 0.4, pilMat);
    pil.position.set(px, 0, pz); g.add(pil);
    // 柱头柱础
    const capi = box(0.95, 0.4, 0.6, M.trim); capi.position.set(px, H / 2 - 1.1, pz); g.add(capi);
    const baseP = box(0.95, 0.5, 0.6, M.trim); baseP.position.set(px, FLOOR_Y + 0.55, pz); g.add(baseP);
  }

  castAll(g, false, true);
  scene.add(g);
  return g;
}
