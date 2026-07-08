/* ============================================================
   天花精装：石膏天花玫瑰 + 沿四壁的齿状檐口(dentil) + 吊灯水晶垂坠 +
   角落的石膏卷叶
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_H as H, ROOM_D as D, box, cyl, ball, cone, castAll } from './kit.js';

export function buildCeiling(ctx) {
  const { scene, M, anim } = ctx;
  const g = new THREE.Group();
  const cy = H / 2 - 0.05;
  const plasterMat = new THREE.MeshStandardMaterial({ color: 0x6a5236, roughness: 0.9, envMapIntensity: 0.3 });

  /* 天花玫瑰（吊灯根部，同心环 + 放射卷叶） */
  const rose = new THREE.Group(); rose.position.set(-1, cy, 1);
  for (let r = 0; r < 4; r++) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.6 + r * 0.5, 0.12 - r * 0.015, 10, 32), plasterMat); ring.rotation.x = Math.PI / 2; ring.position.y = -0.05 - r * 0.02; rose.add(ring); }
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; const leaf = cone(0.16, 0.7, plasterMat, 5); leaf.position.set(Math.cos(a) * 1.7, -0.1, Math.sin(a) * 1.7); leaf.rotation.z = Math.PI / 2; leaf.rotation.y = -a; leaf.scale.set(1, 1, 0.4); rose.add(leaf); }
  const boss = ball(0.3, plasterMat, 14); boss.position.y = -0.1; rose.add(boss);
  g.add(rose);

  /* 齿状檐口：沿四壁顶部排一圈小方块 */
  const dentilMat = M.trim;
  const walls = [
    { x: 0, z: -D / 2 + 0.5, len: W, horiz: true },
    { x: 0, z: D / 2 - 0.5, len: W, horiz: true },
    { x: -W / 2 + 0.5, z: 0, len: D, horiz: false },
    { x: W / 2 - 0.5, z: 0, len: D, horiz: false },
  ];
  for (const w of walls) {
    const n = Math.floor(w.len / 0.7);
    for (let i = 0; i < n; i++) {
      const t = -w.len / 2 + 0.35 + i * 0.7;
      const d = box(0.4, 0.35, 0.4, dentilMat);
      if (w.horiz) d.position.set(t, H / 2 - 1.0, w.z); else d.position.set(w.x, H / 2 - 1.0, t);
      g.add(d);
    }
  }

  /* 四角石膏卷叶（牛腿） */
  for (const [cx, cz] of [[-W / 2 + 1, -D / 2 + 1], [W / 2 - 1, -D / 2 + 1], [-W / 2 + 1, D / 2 - 1], [W / 2 - 1, D / 2 - 1]]) {
    const corbel = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.16, 8, 16, Math.PI), plasterMat);
    corbel.position.set(cx, H / 2 - 1.4, cz); corbel.rotation.x = Math.PI / 2; g.add(corbel);
  }

  /* 吊灯水晶垂坠（在吊灯环下挂一圈小水晶，随时间轻颤） */
  const crystals = [];
  const crystalMat = new THREE.MeshPhysicalMaterial({ color: 0xeaf2f6, roughness: 0.02, metalness: 0, transmission: 0.7, thickness: 0.2, transparent: true, opacity: 0.6, envMapIntensity: 1.6 });
  const ch = new THREE.Group(); ch.position.set(-1, H / 2 - 2.3, 1);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const drop = new THREE.Mesh(new THREE.OctahedronGeometry(0.12), crystalMat);
    drop.scale.set(1, 1.8, 1);
    drop.position.set(Math.cos(a) * 1.5, -0.4 - (i % 3) * 0.15, Math.sin(a) * 1.5);
    ch.add(drop); crystals.push(drop);
  }
  g.add(ch);

  castAll(g, false, false);
  scene.add(g);
  anim.push((dt, t) => { for (let i = 0; i < crystals.length; i++) crystals[i].rotation.y += dt * (0.3 + (i % 4) * 0.1); });
  return g;
}
