/* ============================================================
   华德箱（Wardian case）玻璃植物箱 + 好奇柜（vitrine）：贝壳/水晶/标本
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_D as D, FLOOR_Y, box, cyl, ball, cone, contactShadow, castAll, mulberry } from './kit.js';

export function buildTerrarium(ctx) {
  const { scene, M } = ctx;
  const rnd = mulberry(71);
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xcfe6e8, roughness: 0.05, metalness: 0, transmission: 0.7, thickness: 0.1, transparent: true, opacity: 0.3, envMapIntensity: 1.5 });

  /* 华德箱（玻璃小温室，置于矮架上） */
  (() => {
    const g = new THREE.Group(); g.position.set(8, FLOOR_Y, 8); g.rotation.y = -0.3;
    // 矮架
    const stand = box(2.0, 2.0, 1.6, M.oakDark); stand.position.y = 1.0; g.add(stand);
    const standTop = box(2.2, 0.12, 1.8, M.oakLight); standTop.position.y = 2.05; g.add(standTop);
    for (const [lx, lz] of [[-0.8, 0.6], [0.8, 0.6], [-0.8, -0.6], [0.8, -0.6]]) { const leg = box(0.16, 2.0, 0.16, M.oakDark); leg.position.set(lx, 1.0, lz); g.add(leg); }
    // 玻璃箱体（房屋造型：四壁 + 人字顶）
    const baseY = 2.3;
    const tray = box(2.0, 0.2, 1.4, M.brass); tray.position.y = baseY; g.add(tray);
    const walls = box(1.9, 1.4, 1.3, glass); walls.position.y = baseY + 0.8; g.add(walls);
    // 黄铜骨架边
    for (const [sx, sz] of [[-0.95, 0.65], [0.95, 0.65], [-0.95, -0.65], [0.95, -0.65]]) { const e = box(0.05, 1.4, 0.05, M.brass); e.position.set(sx, baseY + 0.8, sz); g.add(e); }
    const roofA = box(1.1, 0.05, 1.4, glass); roofA.position.set(-0.45, baseY + 1.7, 0); roofA.rotation.z = 0.6; g.add(roofA);
    const roofB = box(1.1, 0.05, 1.4, glass); roofB.position.set(0.45, baseY + 1.7, 0); roofB.rotation.z = -0.6; g.add(roofB);
    const ridge = box(0.06, 0.06, 1.4, M.brass); ridge.position.set(0, baseY + 2.05, 0); g.add(ridge);
    // 内部蕨与苔
    const leaf = new THREE.MeshStandardMaterial({ color: 0x3a7a4a, roughness: 0.7, side: THREE.DoubleSide });
    const soil = box(1.7, 0.2, 1.1, new THREE.MeshStandardMaterial({ color: 0x2a1c10, roughness: 1 })); soil.position.y = baseY + 0.2; g.add(soil);
    for (let i = 0; i < 14; i++) { const bl = cone(0.05, 0.6 + rnd() * 0.5, leaf, 4); bl.position.set((rnd() - 0.5) * 1.3, baseY + 0.5, (rnd() - 0.5) * 0.8); bl.rotation.set((rnd() - 0.5) * 1.2, rnd() * 6, (rnd() - 0.5) * 1.2); bl.scale.set(1, 1, 0.3); g.add(bl); }
    castAll(g, true, true); scene.add(g); contactShadow(scene, 8, 8, 4);
  })();

  /* 好奇柜（玻璃罩下的小标本） */
  (() => {
    const g = new THREE.Group(); g.position.set(-6, FLOOR_Y + 2.5, -D / 2 + 1.2); // 放在后墙边几上
    const domeBase = cyl(0.4, 0.42, 0.1, M.oakDark, 18); g.add(domeBase);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), glass); dome.position.y = 0.1; g.add(dome);
    // 内部：水晶簇
    for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; const cr = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.2 + rnd() * 0.15, 6), new THREE.MeshPhysicalMaterial({ color: 0xc8a0e0, roughness: 0.1, transmission: 0.5, transparent: true, opacity: 0.7, envMapIntensity: 1.3 })); cr.position.set(Math.cos(a) * 0.12, 0.12, Math.sin(a) * 0.12); cr.rotation.set((rnd() - 0.5) * 0.4, 0, (rnd() - 0.5) * 0.4); g.add(cr); }
    castAll(g, false, false); scene.add(g);
  })();

  return scene;
}
