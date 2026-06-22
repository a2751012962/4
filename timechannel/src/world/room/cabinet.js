/* ============================================================
   玻璃门陈列柜 + 餐边柜：柜内瓷器/银器/醒酒器，玻璃门透出环境反射
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_H as H, ROOM_D as D, FLOOR_Y, box, cyl, ball, castAll, mulberry } from './kit.js';

export function buildCabinet(ctx) {
  const { scene, M } = ctx;
  const rnd = mulberry(55);

  /* 玻璃门陈列柜（靠后墙右侧） */
  const cab = new THREE.Group();
  cab.position.set(W / 2 - 6, FLOOR_Y, -D / 2 + 0.9);
  const body = box(5.0, 8.5, 1.6, M.oakDark); body.position.y = 4.25; cab.add(body);
  const cavity = box(4.4, 7.6, 1.2, new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.9 })); cavity.position.set(0, 4.5, 0.2); cab.add(cavity);
  // 玻璃门（双扇）
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xcfe0e6, roughness: 0.06, metalness: 0, transmission: 0.7, thickness: 0.1, transparent: true, opacity: 0.32, envMapIntensity: 1.6 });
  for (const sx of [-1.1, 1.1]) { const door = box(2.1, 7.4, 0.06, glass); door.position.set(sx, 4.5, 0.75); cab.add(door); const stile = box(2.2, 7.5, 0.1, M.oakMed); stile.position.set(sx, 4.5, 0.7); /* keep frame behind */ const muntinV = box(0.06, 7.2, 0.12, M.oakMed); muntinV.position.set(sx, 4.5, 0.78); cab.add(muntinV); for (let m = 0; m < 3; m++) { const mh = box(2.0, 0.06, 0.12, M.oakMed); mh.position.set(sx, 1.8 + m * 2.2, 0.78); cab.add(mh); } const knob = ball(0.1, M.brass, 10); knob.position.set(sx + (sx < 0 ? 0.9 : -0.9), 4.5, 0.82); cab.add(knob); }
  // 玻璃隔板 + 陈列品
  const porc = M.porcelainMat, silver = M.silver;
  for (let s = 0; s < 4; s++) {
    const sy = 1.4 + s * 1.9;
    const shelf = box(4.2, 0.08, 1.0, glass); shelf.position.set(0, sy, 0.1); cab.add(shelf);
    // 摆件
    const n = 3 + (rnd() * 3 | 0);
    for (let i = 0; i < n; i++) {
      const x = -1.8 + (i / Math.max(1, n - 1)) * 3.6;
      const pick = rnd();
      if (pick < 0.4) { // 茶壶
        const t = ball(0.22, porc, 14); t.scale.set(1, 0.8, 1); t.position.set(x, sy + 0.25, 0.1); cab.add(t);
        const lid = ball(0.07, porc, 8); lid.position.set(x, sy + 0.45, 0.1); cab.add(lid);
      } else if (pick < 0.7) { // 高脚杯/银壶
        const c = cyl(0.12, 0.1, 0.5, pick < 0.55 ? silver : porc, 14); c.position.set(x, sy + 0.3, 0.1); cab.add(c);
      } else { // 盘子立着
        const plate = cyl(0.34, 0.34, 0.04, porc, 22); plate.rotation.x = Math.PI / 2; plate.position.set(x, sy + 0.4, 0); cab.add(plate);
      }
    }
  }
  castAll(cab, true, true);
  scene.add(cab);

  /* 餐边柜（长墙下，承醒酒器与银烛台） */
  const side = new THREE.Group();
  side.position.set(W / 2 - 0.9, FLOOR_Y, 11);
  side.rotation.y = -Math.PI / 2;
  const sbody = box(6.0, 3.2, 1.8, M.oakMed); sbody.position.y = 1.6; side.add(sbody);
  // 抽屉 + 柜门
  for (let i = 0; i < 3; i++) { const dr = box(1.7, 0.7, 0.06, M.oakLight); dr.position.set(-2 + i * 2, 2.5, 0.92); side.add(dr); const k1 = ball(0.07, M.brass, 8); k1.position.set(-2 + i * 2 - 0.4, 2.5, 0.96); side.add(k1); const k2 = k1.clone(); k2.position.x = -2 + i * 2 + 0.4; side.add(k2); const door = box(1.7, 1.6, 0.06, M.oakLight); door.position.set(-2 + i * 2, 1.3, 0.92); side.add(door); }
  const sTop = box(6.2, 0.16, 2.0, M.stone); sTop.position.y = 3.25; side.add(sTop);
  // 顶上摆件：银烛台 + 醒酒器 + 一摞折好的布巾
  const sg = new THREE.MeshPhysicalMaterial({ color: 0xc9a86a, roughness: 0.06, transmission: 0.6, thickness: 0.3, transparent: true, opacity: 0.8, envMapIntensity: 1.4 });
  const decanter = ball(0.3, sg, 16); decanter.scale.y = 0.9; decanter.position.set(-2, 3.6, 0); side.add(decanter);
  const decNeck = cyl(0.07, 0.11, 0.36, sg, 12); decNeck.position.set(-2, 3.95, 0); side.add(decNeck);
  for (const sx of [1.5, 2.2]) { const cstk = cyl(0.1, 0.14, 0.14, M.silver, 12); cstk.position.set(sx, 3.4, 0); side.add(cstk); const cstem = cyl(0.04, 0.05, 0.6, M.silver, 8); cstem.position.set(sx, 3.7, 0); side.add(cstem); }
  castAll(side, true, true);
  scene.add(side);

  return scene;
}
