/* ============================================================
   藏书墙（左墙整面）：到顶书柜 + 数百本书脊 + 滑动梯 + 地球仪 + 叠书
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_H as H, ROOM_D as D, FLOOR_Y, box, cyl, ball, bookSpine, mulberry, castAll } from './kit.js';

const SPINE_COLORS = ['#7a3a30', '#3a5a4a', '#6a5a2a', '#46506a', '#7a5a3a', '#5a3a4a', '#3a4a5a', '#8a6a3a', '#5a2a2a', '#2a4a4a', '#6a4a6a', '#3a3a2a'];

function bookMatFor(hex, cache) {
  if (!cache[hex]) cache[hex] = new THREE.MeshStandardMaterial({ map: bookSpine(hex), roughness: 0.72 });
  return cache[hex];
}

export function buildLibrary(ctx) {
  const { scene, M, anim } = ctx;
  const rnd = mulberry(4242);
  const matCache = {};
  const g = new THREE.Group();
  g.position.set(-W / 2 + 0.7, 0, 0);
  g.rotation.y = Math.PI / 2; // 面朝房间（沿 z 展开）

  const caseW = D - 4;           // 沿墙长度
  const caseH = H - 1.6;         // 到顶
  const caseD = 1.5;
  const frameMat = M.oakDark;

  // 柜体外框
  g.add(box(caseW, caseH, caseD, frameMat));
  // 背板
  const backPanel = box(caseW - 0.6, caseH - 0.6, 0.1, new THREE.MeshStandardMaterial({ color: 0x2a1c0e, roughness: 1 }));
  backPanel.position.z = caseD / 2 - 0.45; g.add(backPanel);

  // 竖向分隔成若干柜格
  const bays = 6;
  const bayW = caseW / bays;
  for (let i = 0; i <= bays; i++) {
    const divider = box(0.18, caseH - 0.5, caseD - 0.4, frameMat);
    divider.position.set(-caseW / 2 + i * bayW, 0, 0.05); g.add(divider);
  }

  // 每格 6 层隔板 + 摆书
  const shelves = 6;
  const shelfGapY = (caseH - 1.0) / shelves;
  for (let b = 0; b < bays; b++) {
    const bx = -caseW / 2 + bayW * (b + 0.5);
    for (let s = 0; s < shelves; s++) {
      const sy = caseH / 2 - 0.7 - s * shelfGapY;
      const shelf = box(bayW - 0.3, 0.12, caseD - 0.4, frameMat);
      shelf.position.set(bx, sy, 0.05); g.add(shelf);
      // 一排书
      let cur = bx - bayW / 2 + 0.3;
      const top = bx + bayW / 2 - 0.3;
      while (cur < top) {
        const lean = rnd() < 0.1;
        const w = 0.14 + rnd() * 0.18;
        const h = shelfGapY * (0.62 + rnd() * 0.28);
        const dpt = 0.85 + rnd() * 0.25;
        const col = SPINE_COLORS[(rnd() * SPINE_COLORS.length) | 0];
        const bk = box(w, h, dpt, bookMatFor(col, matCache));
        bk.position.set(cur + w / 2, sy + 0.06 + h / 2, 0.1);
        if (lean) bk.rotation.z = (rnd() - 0.5) * 0.3;
        g.add(bk);
        cur += w + 0.02;
        if (cur < top && rnd() < 0.12) { // 偶尔横放一摞
          const stackN = 2 + (rnd() * 3 | 0);
          for (let k = 0; k < stackN; k++) {
            const sw = 0.5 + rnd() * 0.3;
            const sb = box(sw, 0.12, dpt, bookMatFor(SPINE_COLORS[(rnd() * SPINE_COLORS.length) | 0], matCache));
            sb.position.set(cur + sw / 2, sy + 0.12 + 0.06 + k * 0.13, 0.1);
            g.add(sb);
          }
          cur += 0.7;
        }
      }
    }
  }

  castAll(g, true, true);
  scene.add(g);

  // 滑动梯（靠在书柜上）
  const ladder = new THREE.Group();
  ladder.position.set(-W / 2 + 1.6, FLOOR_Y, -3);
  const lmat = M.oakLight;
  for (const sx of [-0.4, 0.4]) { const rail = cyl(0.07, 0.07, caseH - 1, lmat, 8); rail.position.set(sx, (caseH - 1) / 2, 0); ladder.add(rail); }
  for (let r = 0; r < 8; r++) { const rung = cyl(0.05, 0.05, 0.9, lmat, 8); rung.rotation.z = Math.PI / 2; rung.position.set(0, 0.6 + r * 1.2, 0); ladder.add(rung); }
  ladder.rotation.x = -0.06;
  castAll(ladder, true, false);
  scene.add(ladder);

  // 地球仪（落地木架）
  const globe = new THREE.Group();
  globe.position.set(-W / 2 + 2.6, FLOOR_Y, 7);
  const tripod = M.oakMed;
  for (let i = 0; i < 3; i++) { const leg = cyl(0.05, 0.07, 2.0, tripod, 8); const a = (i / 3) * Math.PI * 2; leg.position.set(Math.cos(a) * 0.5, 1.0, Math.sin(a) * 0.5); leg.rotation.z = Math.cos(a) * 0.18; leg.rotation.x = -Math.sin(a) * 0.18; globe.add(leg); }
  const sphere = ball(0.7, new THREE.MeshStandardMaterial({ color: 0x3a5a6a, roughness: 0.6, metalness: 0.1, emissive: 0x16242a, emissiveIntensity: 0.3 }), 24);
  sphere.position.y = 2.3; globe.add(sphere);
  const meridian = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.04, 8, 28), M.brass); meridian.position.y = 2.3; globe.add(meridian);
  castAll(globe, true, false);
  scene.add(globe);
  anim.push((dt) => { sphere.rotation.y += dt * 0.15; });

  return g;
}
