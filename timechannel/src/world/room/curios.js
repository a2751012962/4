/* ============================================================
   博物好奇柜（vitrine）：玻璃高柜，层层陈列贝壳/珊瑚/水晶簇/菊石化石/
   蝴蝶标本框/六分仪/罗盘/鸟蛋巢——维多利亚书房的收藏癖
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_D as D, FLOOR_Y, box, cyl, ball, cone, contactShadow, castAll, mulberry } from './kit.js';

export function buildCurios(ctx) {
  const { scene, M } = ctx;
  const rnd = mulberry(1337);
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xcfe0e6, roughness: 0.05, metalness: 0, transmission: 0.7, thickness: 0.1, transparent: true, opacity: 0.3, envMapIntensity: 1.6 });

  const g = new THREE.Group();
  g.position.set(W / 2 - 0.9, FLOOR_Y, -12);
  g.rotation.y = -Math.PI / 2;

  // 柜体
  const body = box(5.0, 9.0, 1.6, M.oakDark); body.position.y = 4.5; g.add(body);
  const cavity = box(4.4, 8.2, 1.1, new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.9 })); cavity.position.set(0, 4.6, 0.2); g.add(cavity);
  // 玻璃门
  for (const sx of [-1.1, 1.1]) { const door = box(2.1, 8.0, 0.05, glass); door.position.set(sx, 4.6, 0.75); g.add(door); const muntinV = box(0.05, 7.8, 0.1, M.oakMed); muntinV.position.set(sx, 4.6, 0.78); g.add(muntinV); const knob = ball(0.09, M.brass, 10); knob.position.set(sx + (sx < 0 ? 0.9 : -0.9), 4.6, 0.82); g.add(knob); }
  const cornice = box(5.4, 0.6, 1.9, M.oakLight); cornice.position.y = 9.2; g.add(cornice);

  const shells = M.porcelainMat;
  const coral = new THREE.MeshStandardMaterial({ color: 0xd86a5a, roughness: 0.7 });
  const crystalMat = new THREE.MeshPhysicalMaterial({ color: 0xb89ad8, roughness: 0.08, transmission: 0.5, transparent: true, opacity: 0.7, envMapIntensity: 1.3 });

  for (let s = 0; s < 5; s++) {
    const sy = 1.4 + s * 1.6;
    const shelf = box(4.2, 0.08, 1.0, glass); shelf.position.set(0, sy, 0.1); g.add(shelf);
    const n = 3 + (rnd() * 3 | 0);
    for (let i = 0; i < n; i++) {
      const x = -1.7 + (i / Math.max(1, n - 1)) * 3.4;
      const pick = (s + i) % 6;
      if (pick === 0) { // 贝壳（螺旋近似）
        const sh = new THREE.Mesh(new THREE.TorusKnotGeometry(0.14, 0.06, 40, 6, 2, 3), shells); sh.position.set(x, sy + 0.2, 0.1); g.add(sh);
      } else if (pick === 1) { // 珊瑚
        const cr = new THREE.Group(); for (let b = 0; b < 5; b++) { const br = cone(0.03, 0.4, coral, 5); const a = (b / 5) * Math.PI * 2; br.position.set(Math.cos(a) * 0.1, 0.2, Math.sin(a) * 0.1); br.rotation.z = Math.cos(a) * 0.5; br.rotation.x = -Math.sin(a) * 0.5; cr.add(br); } cr.position.set(x, sy, 0.1); g.add(cr);
      } else if (pick === 2) { // 水晶簇
        for (let c = 0; c < 5; c++) { const a = (c / 5) * Math.PI * 2; const cr = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.22 + rnd() * 0.14, 6), crystalMat); cr.position.set(x + Math.cos(a) * 0.08, sy + 0.12, 0.1 + Math.sin(a) * 0.08); cr.rotation.set((rnd() - 0.5) * 0.5, 0, (rnd() - 0.5) * 0.5); g.add(cr); }
      } else if (pick === 3) { // 菊石化石（盘旋）
        const am = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.07, 8, 24), new THREE.MeshStandardMaterial({ color: 0x8a7a5a, roughness: 0.8 })); am.scale.set(1, 1, 0.4); am.position.set(x, sy + 0.2, 0); g.add(am);
      } else if (pick === 4) { // 蝴蝶标本框
        const fr = box(0.5, 0.5, 0.05, M.oakDark); fr.position.set(x, sy + 0.3, 0); g.add(fr);
        const wing = box(0.12, 0.2, 0.01, new THREE.MeshStandardMaterial({ color: [0x4a6ac0, 0xd0a030, 0xc04060][(rnd() * 3 | 0)], roughness: 0.6 }));
        const w1 = wing.clone(); w1.position.set(x - 0.06, sy + 0.3, 0.04); w1.rotation.y = 0.3; g.add(w1);
        const w2 = wing.clone(); w2.position.set(x + 0.06, sy + 0.3, 0.04); w2.rotation.y = -0.3; g.add(w2);
      } else { // 黄铜六分仪 / 罗盘
        const sext = new THREE.Mesh(new THREE.RingGeometry(0.14, 0.2, 16, 1, 0, Math.PI / 2), M.brass); sext.position.set(x, sy + 0.16, 0.1); g.add(sext);
        const arm = box(0.02, 0.24, 0.02, M.brass); arm.position.set(x, sy + 0.16, 0.1); arm.rotation.z = 0.6; g.add(arm);
      }
    }
  }
  castAll(g, true, true);
  scene.add(g);
  contactShadow(scene, W / 2 - 2, -12, 4);
  return g;
}
