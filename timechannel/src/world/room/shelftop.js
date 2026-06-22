/* ============================================================
   护墙压顶台上的陈列：沿四壁 ledge 等距摆放 花瓶/小胸像/烛台/座钟/叠书/瓷罐
   的循环序列，填满中段墙的台面
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_D as D, FLOOR_Y, box, cyl, ball, cone, castAll, mulberry } from './kit.js';

export function buildShelftop(ctx) {
  const { scene, M } = ctx;
  const rnd = mulberry(515);
  const y = FLOOR_Y + 3.55; // 压顶台面之上

  const vaseMat = [M.porcelainMat, new THREE.MeshStandardMaterial({ color: 0x3a5a6a, roughness: 0.4, metalness: 0.1, envMapIntensity: 0.7 }), new THREE.MeshStandardMaterial({ color: 0x6a3a4a, roughness: 0.4, envMapIntensity: 0.6 })];

  function makeItem(kind) {
    const g = new THREE.Group();
    if (kind === 0) { // 花瓶
      const v = cyl(0.16, 0.1, 0.6, vaseMat[(rnd() * vaseMat.length) | 0], 16); v.position.y = 0.3; g.add(v);
      const neck = cyl(0.1, 0.13, 0.16, v.material, 12); neck.position.y = 0.66; g.add(neck);
    } else if (kind === 1) { // 小胸像
      const marble = new THREE.MeshStandardMaterial({ color: 0xe4ddcf, roughness: 0.55, envMapIntensity: 0.4 });
      g.add(setp(box(0.36, 0.2, 0.3, M.stone), 0, 0.1, 0));
      g.add(setp(ball(0.18, marble, 12), 0, 0.4, 0));
      const head = ball(0.13, marble, 12); head.scale.set(0.9, 1.1, 1); head.position.y = 0.62; g.add(head);
    } else if (kind === 2) { // 烛台
      g.add(setp(cyl(0.1, 0.14, 0.1, M.brass, 12), 0, 0.05, 0));
      g.add(setp(cyl(0.04, 0.05, 0.5, M.brass, 8), 0, 0.3, 0));
      g.add(setp(cyl(0.05, 0.06, 0.3, new THREE.MeshStandardMaterial({ color: 0xf0e4c8, roughness: 0.6 }), 8), 0, 0.65, 0));
    } else if (kind === 3) { // 座钟
      g.add(setp(box(0.5, 0.5, 0.24, M.oakDark), 0, 0.25, 0));
      const face = new THREE.Mesh(new THREE.CircleGeometry(0.16, 18), M.porcelainMat); face.position.set(0, 0.28, 0.13); g.add(face);
      const top = ball(0.1, M.brass, 10); top.scale.set(1, 0.6, 1); top.position.y = 0.5; g.add(top);
    } else if (kind === 4) { // 叠书
      for (let k = 0; k < 3; k++) { const b = box(0.5, 0.1, 0.34, new THREE.MeshStandardMaterial({ color: ['#5a2a2a', '#2a4a3a', '#3a3a5a'][k], roughness: 0.7 })); b.position.set((rnd() - 0.5) * 0.05, 0.05 + k * 0.11, 0); b.rotation.y = (rnd() - 0.5) * 0.2; g.add(b); }
    } else { // 瓷罐(ginger jar)
      const jar = ball(0.22, M.porcelainMat, 16); jar.scale.set(1, 1.2, 1); jar.position.y = 0.26; g.add(jar);
      const lid = cone(0.14, 0.16, M.porcelainMat, 12); lid.position.y = 0.56; g.add(lid);
    }
    return g;
  }

  const walls = [
    { x: 0, z: -D / 2 + 0.45, len: W, ry: 0, n: 1 },
    { x: 0, z: D / 2 - 0.45, len: W, ry: Math.PI, n: -1 },
    { x: -W / 2 + 0.45, z: 0, len: D, ry: Math.PI / 2, n: 1 },
    { x: W / 2 - 0.45, z: 0, len: D, ry: -Math.PI / 2, n: -1 },
  ];
  for (const w of walls) {
    const count = Math.floor(w.len / 2.6);
    for (let i = 0; i < count; i++) {
      const t = -w.len / 2 + 1.3 + i * 2.6;
      const item = makeItem((i + (w.ry > 0 ? 2 : 0)) % 6);
      const ix = (w.ry === 0 || w.ry === Math.PI) ? w.x + t : w.x;
      const iz = (w.ry === 0 || w.ry === Math.PI) ? w.z : w.z + t;
      item.position.set(ix, y, iz); item.rotation.y = w.ry + (rnd() - 0.5) * 0.3;
      castAll(item, true, false);
      scene.add(item);
    }
  }
  return scene;
}
function setp(m, x, y, z) { m.position.set(x, y, z); return m; }
