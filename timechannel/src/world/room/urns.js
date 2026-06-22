/* ============================================================
   落地大花器：双耳陶瓮 + 雕花石瓮(置基座) + 插着的芦苇/孔雀羽，立于角落
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_D as D, FLOOR_Y, box, cyl, ball, cone, contactShadow, castAll, mulberry } from './kit.js';

function amphora(M, col) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.45, metalness: 0.1, envMapIntensity: 0.7 });
  const foot = cyl(0.3, 0.4, 0.4, mat, 18); foot.position.y = 0.2; g.add(foot);
  const belly = ball(0.7, mat, 20); belly.scale.set(1, 1.3, 1); belly.position.y = 1.3; g.add(belly);
  const neck = cyl(0.28, 0.4, 0.9, mat, 16); neck.position.y = 2.4; g.add(neck);
  const lip = cyl(0.4, 0.34, 0.16, mat, 16); lip.position.y = 2.9; g.add(lip);
  // 双耳
  for (const sx of [-1, 1]) { const handle = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.07, 8, 16, Math.PI), mat); handle.position.set(sx * 0.5, 2.2, 0); handle.rotation.z = sx > 0 ? -Math.PI / 2 : Math.PI / 2; g.add(handle); }
  // 描金带纹
  const band = cyl(0.71, 0.71, 0.12, M.brass, 20, true); band.scale.set(1, 1, 1); band.position.y = 1.4; g.add(band);
  return g;
}

export function buildUrns(ctx) {
  const { scene, M } = ctx;
  const rnd = mulberry(404);

  // 角落两只大陶瓮，瓮中插芦苇/羽
  const spots = [
    [-W / 2 + 3, D / 2 - 3, 0x9a5a3a],
    [W / 2 - 3, -D / 2 + 3, 0x3a5a5a],
  ];
  for (const [x, z, col] of spots) {
    const a = amphora(M, col); a.position.set(x, FLOOR_Y, z);
    // 插枝
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x8a7a4a, roughness: 0.8 });
    for (let i = 0; i < 7; i++) { const reed = cyl(0.02, 0.015, 3.0 + rnd() * 1.5, stemMat, 5); reed.position.set((rnd() - 0.5) * 0.5, 4.3, (rnd() - 0.5) * 0.5); reed.rotation.set((rnd() - 0.5) * 0.4, 0, (rnd() - 0.5) * 0.4); a.add(reed); const tip = cone(0.06, 0.4, new THREE.MeshStandardMaterial({ color: 0xb89a5a, roughness: 0.7 }), 5); tip.position.copy(reed.position); tip.position.y += 1.6; tip.rotation.copy(reed.rotation); a.add(tip); }
    castAll(a, true, true); scene.add(a); contactShadow(scene, x, z, 3);
  }

  // 一对基座石瓮（门两侧）
  for (const sx of [-4.5, 2.5]) {
    const g = new THREE.Group(); g.position.set(sx, FLOOR_Y, D / 2 - 2.5);
    const ped = box(1.2, 2.4, 1.2, M.stone); ped.position.y = 1.2; g.add(ped);
    const pedCap = box(1.4, 0.3, 1.4, M.stone); pedCap.position.y = 2.5; g.add(pedCap);
    const urn = new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(0.05, 0), new THREE.Vector2(0.3, 0.1), new THREE.Vector2(0.5, 0.6), new THREE.Vector2(0.36, 1.0), new THREE.Vector2(0.5, 1.3), new THREE.Vector2(0.44, 1.5)], 20), M.stone);
    urn.position.y = 2.65; g.add(urn);
    castAll(g, true, true); scene.add(g); contactShadow(scene, sx, D / 2 - 2.5, 2.2);
  }
  return scene;
}
