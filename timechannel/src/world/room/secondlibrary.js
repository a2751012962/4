/* ============================================================
   第二书墙：一座独立高书柜（InstancedMesh 数百本书）+ 滚梯 + 翼背阅读椅 + 边几
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_H as H, ROOM_D as D, FLOOR_Y, box, cyl, ball, turnedLeg, contactShadow, castAll, mulberry } from './kit.js';

const SPINE = [0x7a3a30, 0x3a5a4a, 0x6a5a2a, 0x46506a, 0x7a5a3a, 0x5a3a4a, 0x3a4a5a, 0x8a6a3a, 0x5a2a2a, 0x2a4a4a, 0x6a4a6a, 0x3a3a2a];

export function buildSecondLibrary(ctx) {
  const { scene, M } = ctx;
  const rnd = mulberry(771);
  const g = new THREE.Group();
  g.position.set(-12.5, FLOOR_Y + (H - 1.6) / 2, 9); // 柜体中心抬到 caseH/2，柜底正好落地（此前沉到地板下）
  g.rotation.y = -Math.PI / 2; // 面朝房间内（沿 z 展开）

  const caseW = 9.0, caseH = H - 1.6, caseD = 1.5;
  g.add(box(caseW, caseH, caseD, M.oakDark));
  const backP = box(caseW - 0.5, caseH - 0.5, 0.1, new THREE.MeshStandardMaterial({ color: 0x2a1c0e, roughness: 1 })); backP.position.z = caseD / 2 - 0.45; g.add(backP);
  // 顶部山花
  const pediment = box(caseW + 0.6, 0.8, caseD + 0.3, M.oakMed); pediment.position.y = caseH / 2 + 0.4; g.add(pediment);
  const dent = box(caseW, 0.4, 0.4, M.trim); dent.position.set(0, caseH / 2 + 0.1, caseD / 2); g.add(dent);

  const bays = 4, bayW = caseW / bays;
  for (let i = 0; i <= bays; i++) { const div = box(0.2, caseH - 0.4, caseD - 0.3, M.oakMed); div.position.set(-caseW / 2 + i * bayW, 0, 0.05); g.add(div); }

  const placements = [];
  const shelves = 6, gapY = (caseH - 1.0) / shelves;
  for (let b = 0; b < bays; b++) {
    const bx = -caseW / 2 + bayW * (b + 0.5);
    for (let s = 0; s < shelves; s++) {
      const sy = caseH / 2 - 0.7 - s * gapY;
      const shelf = box(bayW - 0.25, 0.1, caseD - 0.3, M.oakMed); shelf.position.set(bx, sy, 0.05); g.add(shelf);
      let cur = bx - bayW / 2 + 0.25; const top = bx + bayW / 2 - 0.25;
      while (cur < top) {
        const w = 0.15 + rnd() * 0.17, h = gapY * (0.6 + rnd() * 0.3);
        placements.push({ x: cur + w / 2, y: sy + 0.05 + h / 2, z: 0.1, sx: w, sy: h, sz: 0.8 + rnd() * 0.2, rz: rnd() < 0.08 ? (rnd() - 0.5) * 0.2 : 0, c: SPINE[(rnd() * SPINE.length) | 0] });
        cur += w + 0.02;
      }
    }
  }
  castAll(g, true, true);
  scene.add(g);

  // InstancedMesh 书脊（注意它在 g 的局部空间，需要把 g 的世界变换烘进每个实例）
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.72, envMapIntensity: 0.3 });
  const im = new THREE.InstancedMesh(geo, mat, placements.length);
  im.castShadow = true; im.receiveShadow = true;
  g.updateMatrixWorld(true);
  const dummy = new THREE.Object3D(); const col = new THREE.Color(); const tmp = new THREE.Matrix4();
  for (let i = 0; i < placements.length; i++) {
    const p = placements[i];
    dummy.position.set(p.x, p.y, p.z); dummy.rotation.set(0, 0, p.rz); dummy.scale.set(p.sx, p.sy, p.sz); dummy.updateMatrix();
    tmp.multiplyMatrices(g.matrixWorld, dummy.matrix);
    im.setMatrixAt(i, tmp); im.setColorAt(i, col.setHex(p.c));
  }
  im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
  scene.add(im);

  // 滚梯
  const ladder = new THREE.Group(); ladder.position.set(-11.4, FLOOR_Y, 6); ladder.rotation.y = -Math.PI / 2; ladder.rotation.x = -0.05;
  for (const sx of [-0.4, 0.4]) { const rail = cyl(0.07, 0.07, caseH - 1, M.oakLight, 8); rail.position.set(sx, (caseH - 1) / 2, 0); ladder.add(rail); }
  for (let r = 0; r < 8; r++) { const rung = cyl(0.05, 0.05, 0.9, M.oakLight, 8); rung.rotation.z = Math.PI / 2; rung.position.set(0, 0.6 + r * 1.2, 0); ladder.add(rung); }
  castAll(ladder, true, false); scene.add(ladder);

  // 翼背阅读椅 + 边几
  const chair = new THREE.Group(); chair.position.set(-9, FLOOR_Y, 6); chair.rotation.y = -1.0;
  chair.add(setp(box(2.2, 0.7, 2.0, M.leatherOx), 0, 1.0, 0));
  chair.add(setp(box(2.0, 0.4, 1.8, M.leatherOx), 0, 1.4, 0.1));
  chair.add(setp(box(2.2, 2.6, 0.5, M.leatherOx), 0, 2.1, -0.8));
  for (const ax of [-1.15, 1.15]) { chair.add(setp(box(0.45, 1.3, 2.0, M.leatherOx), ax, 1.4, 0)); chair.add(setp(box(0.45, 1.4, 0.5, M.leatherOx), ax, 2.2, -0.65)); }
  for (const [lx, lz] of [[-0.9, 0.9], [0.9, 0.9], [-0.9, -0.9], [0.9, -0.9]]) { const leg = turnedLeg(0.6, 0.12, M.oakDark); leg.position.set(lx, 0, lz); chair.add(leg); }
  castAll(chair, true, true); scene.add(chair); contactShadow(scene, -9, 6, 5);

  return g;
}
function setp(m, x, y, z) { m.position.set(x, y, z); return m; }
