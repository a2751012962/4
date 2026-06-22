/* ============================================================
   写字凹间：斜面书写柜(secretary desk) + 椅 + 上方玻璃书橱 + 一摞文件/羽毛笔
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_D as D, FLOOR_Y, box, cyl, ball, turnedLeg, contactShadow, castAll } from './kit.js';

export function buildAlcove(ctx) {
  const { scene, M } = ctx;
  const g = new THREE.Group();
  g.position.set(-W / 2 + 5, FLOOR_Y, 13);
  g.rotation.y = 0.4;

  // 下部抽屉柜
  const base = box(3.2, 2.0, 1.6, M.oakMed); base.position.y = 1.0; g.add(base);
  for (let i = 0; i < 3; i++) { const dr = box(2.9, 0.5, 0.06, M.oakLight); dr.position.set(0, 0.5 + i * 0.55, 0.83); g.add(dr); for (const kx of [-0.7, 0.7]) { const k = ball(0.07, M.brass, 8); k.position.set(kx, 0.5 + i * 0.55, 0.88); g.add(k); } }
  // 斜面写字板（放下的状态）
  const flap = box(3.0, 1.6, 0.1, M.oakLight); flap.position.set(0, 2.4, 0.9); flap.rotation.x = -0.9; g.add(flap);
  const writingSurf = box(2.8, 1.4, 0.02, M.leatherOx); writingSurf.position.set(0, 2.4, 0.96); writingSurf.rotation.x = -0.9; g.add(writingSurf);
  // 文件 + 羽毛笔（搭在斜面上）
  const paper = box(0.7, 0.9, 0.02, new THREE.MeshStandardMaterial({ color: 0xf2ead2, roughness: 0.85 })); paper.position.set(-0.3, 2.5, 1.15); paper.rotation.x = -0.9; g.add(paper);
  const quill = cyl(0.01, 0.01, 0.7, new THREE.MeshStandardMaterial({ color: 0xf0ead8 }), 5); quill.position.set(0.5, 2.7, 1.2); quill.rotation.set(-0.9, 0, 0.5); g.add(quill);

  // 上部玻璃书橱（带门）
  const hutch = box(3.2, 3.2, 1.0, M.oakDark); hutch.position.set(0, 4.0, -0.2); g.add(hutch);
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xcfe0e6, roughness: 0.06, metalness: 0, transmission: 0.7, thickness: 0.1, transparent: true, opacity: 0.32, envMapIntensity: 1.6 });
  for (const sx of [-0.75, 0.75]) { const door = box(1.4, 2.9, 0.05, glass); door.position.set(sx, 4.0, 0.32); g.add(door); const muntinV = box(0.05, 2.9, 0.1, M.oakMed); muntinV.position.set(sx, 4.0, 0.34); g.add(muntinV); for (let m = 0; m < 2; m++) { const mh = box(1.3, 0.05, 0.1, M.oakMed); mh.position.set(sx, 3.2 + m * 1.5, 0.34); g.add(mh); } }
  // 橱内书
  const cols = ['#7a3a30', '#3a5a4a', '#46506a', '#6a5a2a', '#5a3a4a'];
  for (let s = 0; s < 2; s++) { let bx = -1.2; while (bx < 1.2) { const wB = 0.16 + Math.random() * 0.14, hB = 0.8 + Math.random() * 0.4; const bk = box(wB, hB, 0.6, new THREE.MeshStandardMaterial({ color: cols[(Math.random() * cols.length) | 0], roughness: 0.7 })); bk.position.set(bx + wB / 2, 3.0 + s * 1.4 + hB / 2, -0.2); g.add(bk); bx += wB + 0.02; } }

  // 椅子
  const chair = new THREE.Group(); chair.position.set(-W / 2 + 5, FLOOR_Y, 11); chair.rotation.y = 0.4 + Math.PI;
  chair.add(setp(box(1.6, 0.5, 1.6, M.velvetGreen), 0, 1.4, 0));
  const cback = box(1.6, 1.8, 0.3, M.velvetGreen); cback.position.set(0, 2.4, -0.65); chair.add(cback);
  for (const [lx, lz] of [[-0.6, 0.6], [0.6, 0.6], [-0.6, -0.6], [0.6, -0.6]]) { const leg = turnedLeg(1.4, 0.1, M.oakDark); leg.position.set(lx, 0, lz); chair.add(leg); }
  castAll(chair, true, true); scene.add(chair);

  castAll(g, true, true);
  scene.add(g);
  contactShadow(scene, g.position.x, g.position.z, 5);
  contactShadow(scene, -W / 2 + 5, 11, 3.5);
  return g;
}
function setp(m, x, y, z) { m.position.set(x, y, z); return m; }
