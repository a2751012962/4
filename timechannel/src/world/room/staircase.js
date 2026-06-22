/* ============================================================
   旋转楼梯（装饰性，通向上层书阁的意象）：中央立柱 + 螺旋踏步 +
   每级栏杆望柱 + 螺旋扶手 + 顶部小平台
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_H as H, ROOM_D as D, FLOOR_Y, box, cyl, ball, castAll } from './kit.js';

export function buildStaircase(ctx) {
  const { scene, M } = ctx;
  const g = new THREE.Group();
  g.position.set(-9, FLOOR_Y, -11);

  const STEPS = 22;
  const radius = 1.7;
  const totalRise = H - 2.2;
  const totalTurn = Math.PI * 2.4;
  const stepRise = totalRise / STEPS;

  // 中央立柱
  const newel = cyl(0.35, 0.4, totalRise + 0.6, M.oakDark, 18); newel.position.y = totalRise / 2; g.add(newel);
  const newelCap = ball(0.42, M.brass, 16); newelCap.position.y = totalRise + 0.4; g.add(newelCap);

  const tread = new THREE.MeshStandardMaterial({ color: 0x6a4626, roughness: 0.6, metalness: 0.05, envMapIntensity: 0.6, map: M.oakMed.map });
  for (let i = 0; i < STEPS; i++) {
    const a = (i / STEPS) * totalTurn;
    const y = i * stepRise + 0.1;
    // 扇形踏步（用细长盒子近似）
    const step = box(radius * 1.7, 0.16, 0.9, tread);
    step.position.set(Math.cos(a) * radius * 0.5, y, Math.sin(a) * radius * 0.5);
    step.rotation.y = -a + Math.PI / 2;
    g.add(step);
    // 望柱 + 栏杆球
    const outX = Math.cos(a) * radius, outZ = Math.sin(a) * radius;
    const bal = cyl(0.05, 0.05, 1.0, M.iron, 8); bal.position.set(outX, y + 0.6, outZ); g.add(bal);
    const knob = ball(0.08, M.brass, 8); knob.position.set(outX, y + 1.1, outZ); g.add(knob);
    // 扶手段（连接相邻望柱顶）
    if (i > 0) {
      const pa = ((i - 1) / STEPS) * totalTurn;
      const px = Math.cos(pa) * radius, pz = Math.sin(pa) * radius, py = (i - 1) * stepRise + 0.1 + 1.1;
      const cy0 = y + 1.1;
      const mid = new THREE.Vector3((px + outX) / 2, (py + cy0) / 2, (pz + outZ) / 2);
      const len = Math.hypot(outX - px, cy0 - py, outZ - pz);
      const rail = cyl(0.05, 0.05, len, M.oakDark, 8);
      rail.position.copy(mid);
      rail.lookAt(new THREE.Vector3(outX, cy0, outZ));
      rail.rotateX(Math.PI / 2);
      g.add(rail);
    }
  }

  // 顶部小平台
  const landing = box(2.6, 0.2, 2.6, tread); landing.position.set(Math.cos(totalTurn) * 0.5, totalRise + 0.2, Math.sin(totalTurn) * 0.5); g.add(landing);
  // 平台护栏
  for (let i = 0; i < 6; i++) { const a = totalTurn + 0.4 + i * 0.3; const bal = cyl(0.05, 0.05, 1.0, M.iron, 8); bal.position.set(Math.cos(a) * 1.4, totalRise + 0.7, Math.sin(a) * 1.4); g.add(bal); }

  castAll(g, true, true);
  scene.add(g);
  return g;
}
