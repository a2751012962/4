/* ============================================================
   大型帆船模型（陈列在专属木座上）：船体 + 三桅 + 横桁 + 帆 + 索具 + 底座铭牌
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_D as D, FLOOR_Y, box, cyl, ball, contactShadow, castAll } from './kit.js';

export function buildModelShip(ctx) {
  const { scene, M } = ctx;
  const g = new THREE.Group();
  g.position.set(10, FLOOR_Y, 6);
  g.rotation.y = -0.8;

  // 陈列矮柜
  const stand = box(4.2, 2.2, 1.6, M.oakDark); stand.position.y = 1.1; g.add(stand);
  const standTop = box(4.4, 0.14, 1.8, M.oakLight); standTop.position.y = 2.2; g.add(standTop);
  for (const [lx, lz] of [[-1.8, 0.6], [1.8, 0.6], [-1.8, -0.6], [1.8, -0.6]]) { const leg = box(0.2, 2.2, 0.2, M.oakDark); leg.position.set(lx, 1.1, lz); g.add(leg); }
  const plaque = box(0.8, 0.3, 0.04, M.brass); plaque.position.set(0, 1.5, 0.82); g.add(plaque);

  // 船（在台上）
  const ship = new THREE.Group(); ship.position.set(0, 2.5, 0);
  const hullMat = new THREE.MeshStandardMaterial({ color: 0x5a3418, roughness: 0.6, metalness: 0.05, envMapIntensity: 0.5, map: M.oakMed.map });
  const hullDark = new THREE.MeshStandardMaterial({ color: 0x2a1808, roughness: 0.7 });
  // 船体：用渐窄盒段近似 + 龙骨
  for (let i = 0; i < 6; i++) {
    const seg = box(3.6 - i * 0.1, 0.5 - i * 0.04, 1.0 - i * 0.1, i % 2 ? hullDark : hullMat);
    seg.position.set(0, -i * 0.18, 0); seg.rotation.x = 0; ship.add(seg);
  }
  // 船首斜桅
  const bow = box(1.4, 0.3, 0.3, hullMat); bow.position.set(2.0, 0.4, 0); bow.rotation.z = 0.3; ship.add(bow);
  // 甲板
  const deck = box(3.4, 0.06, 0.9, new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 0.7 })); deck.position.y = 0.28; ship.add(deck);
  // 船尾楼
  const stern = box(0.8, 0.8, 0.9, hullMat); stern.position.set(-1.6, 0.5, 0); ship.add(stern);

  // 三桅 + 横桁 + 帆
  const mastMat = new THREE.MeshStandardMaterial({ color: 0x4a3018, roughness: 0.6 });
  const sailMat = new THREE.MeshStandardMaterial({ color: 0xeee6d2, roughness: 0.85, side: THREE.DoubleSide, envMapIntensity: 0.3 });
  const mastX = [1.1, -0.1, -1.3];
  const mastH = [3.2, 3.6, 2.8];
  for (let m = 0; m < 3; m++) {
    const mast = cyl(0.05, 0.07, mastH[m], mastMat, 8); mast.position.set(mastX[m], 0.3 + mastH[m] / 2, 0); ship.add(mast);
    // 横桁 + 帆（每桅 2 层）
    for (let s = 0; s < 2; s++) {
      const yy = 0.9 + s * (mastH[m] * 0.45);
      const yard = cyl(0.03, 0.03, 1.2 - s * 0.3, mastMat, 6); yard.rotation.z = Math.PI / 2; yard.position.set(mastX[m], yy + 0.4, 0); ship.add(yard);
      const sail = box(1.1 - s * 0.3, mastH[m] * 0.34, 0.02, sailMat); sail.position.set(mastX[m], yy, 0.0); sail.rotation.x = 0; ship.add(sail);
    }
    // 桅顶旗
    const flag = box(0.3, 0.16, 0.01, new THREE.MeshStandardMaterial({ color: 0xc23a3a, roughness: 0.8, side: THREE.DoubleSide })); flag.position.set(mastX[m] + 0.16, 0.3 + mastH[m], 0); ship.add(flag);
  }
  // 索具（多根斜拉线）
  const rope = new THREE.MeshStandardMaterial({ color: 0x6a5a3a, roughness: 0.8 });
  for (let m = 0; m < 3; m++) {
    for (const dir of [-1, 1]) {
      const line = cyl(0.006, 0.006, mastH[m] * 1.05, rope, 4);
      line.position.set(mastX[m] + dir * 0.4, 0.3 + mastH[m] * 0.45, 0);
      line.rotation.z = dir * 0.32; ship.add(line);
    }
  }
  g.add(ship);

  castAll(g, true, true);
  scene.add(g);
  contactShadow(scene, 10, 6, 6);
  return g;
}
