/* ============================================================
   前墙书墙：门两侧的矮书柜 + 用 InstancedMesh 一次性渲染数百本书脊
   （借鉴 three.js 性能实践：重复物体合批，单 draw call）
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_D as D, FLOOR_Y, box, castAll, mulberry } from './kit.js';

const SPINE = [0x7a3a30, 0x3a5a4a, 0x6a5a2a, 0x46506a, 0x7a5a3a, 0x5a3a4a, 0x3a4a5a, 0x8a6a3a, 0x5a2a2a, 0x2a4a4a, 0x6a4a6a, 0x3a3a2a, 0x8a4a2a, 0x2a5a5a];

export function buildInstancedBooks(ctx) {
  const { scene, M } = ctx;
  const rnd = mulberry(606);
  const z = D / 2 - 0.7;

  // 两段矮书柜柜体（门两侧）
  const caseH = 4.4, caseD = 1.3;
  const runs = [
    { x: -7.2, len: 7.0 },
    { x: 7.2, len: 7.0 },
  ];
  const placements = []; // {pos, scale, color}
  for (const run of runs) {
    const g = new THREE.Group(); g.position.set(run.x, FLOOR_Y, z); g.rotation.y = Math.PI;
    g.add(box(run.len, caseH, caseD, M.oakDark));
    const backP = box(run.len - 0.4, caseH - 0.4, 0.1, new THREE.MeshStandardMaterial({ color: 0x2a1c0e, roughness: 1 })); backP.position.z = caseD / 2 - 0.4; g.add(backP);
    castAll(g, true, true); scene.add(g);
    // 顶面台（可摆物）
    const cap = box(run.len + 0.3, 0.2, caseD + 0.2, M.oakLight); cap.position.set(run.x, FLOOR_Y + caseH / 2 + 0.1, z); cap.rotation.y = Math.PI; castAll(cap, true, true); scene.add(cap);

    // 三层书
    const shelves = 3, gapY = (caseH - 0.8) / shelves;
    for (let s = 0; s < shelves; s++) {
      const sy = FLOOR_Y + caseH / 2 - 0.5 - s * gapY;
      const shelf = box(run.len - 0.3, 0.1, caseD - 0.3, M.oakMed); shelf.position.set(run.x, sy - 0.05, z); shelf.rotation.y = Math.PI; castAll(shelf, true, true); scene.add(shelf);
      let cur = run.x - run.len / 2 + 0.3;
      const top = run.x + run.len / 2 - 0.3;
      while (cur < top) {
        const wB = 0.16 + rnd() * 0.18;
        const hB = gapY * (0.6 + rnd() * 0.3);
        placements.push({
          x: cur + wB / 2, y: sy + hB / 2, z: z - 0.2,
          sx: wB, sy: hB, sz: 0.8 + rnd() * 0.2,
          rz: rnd() < 0.08 ? (rnd() - 0.5) * 0.2 : 0,
          color: SPINE[(rnd() * SPINE.length) | 0],
        });
        cur += wB + 0.02;
      }
    }
  }

  // 单个 InstancedMesh 承载全部书脊
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.72, envMapIntensity: 0.3 });
  const im = new THREE.InstancedMesh(geo, mat, placements.length);
  im.castShadow = true; im.receiveShadow = true;
  const dummy = new THREE.Object3D();
  const col = new THREE.Color();
  for (let i = 0; i < placements.length; i++) {
    const p = placements[i];
    dummy.position.set(p.x, p.y, p.z);
    dummy.rotation.set(0, 0, p.rz);
    dummy.scale.set(p.sx, p.sy, p.sz);
    dummy.updateMatrix();
    im.setMatrixAt(i, dummy.matrix);
    im.setColorAt(i, col.setHex(p.color));
  }
  im.instanceMatrix.needsUpdate = true;
  if (im.instanceColor) im.instanceColor.needsUpdate = true;
  scene.add(im);
  return im;
}
