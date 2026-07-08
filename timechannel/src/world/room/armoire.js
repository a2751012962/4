/* ============================================================
   雕花大衣橱(armoire)：镜门(反射环境) + 雕花顶冠 + 黄铜把手 + 抽屉 +
   旁边一座落地穿衣镜
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_D as D, FLOOR_Y, box, cyl, ball, contactShadow, castAll } from './kit.js';

export function buildArmoire(ctx) {
  const { scene, M } = ctx;

  /* 大衣橱 */
  const g = new THREE.Group(); g.position.set(W / 2 - 6, FLOOR_Y, D / 2 - 1); g.rotation.y = Math.PI;
  const body = box(5.0, 8.0, 2.0, M.oakMed); body.position.y = 4.0; g.add(body);
  // 顶冠
  const cornice = box(5.6, 0.8, 2.4, M.oakDark); cornice.position.y = 8.2; g.add(cornice);
  const crest = box(4.0, 0.8, 0.4, M.oakDark); crest.position.set(0, 8.7, 1.0); g.add(crest);
  const crestBall = ball(0.3, M.brass, 12); crestBall.position.set(0, 9.1, 1.0); g.add(crestBall);
  // 两扇镜门
  for (const sx of [-1.2, 1.2]) {
    const door = box(2.3, 6.6, 0.16, M.oakDark); door.position.set(sx, 4.2, 1.0); g.add(door);
    const mirror = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 5.8), new THREE.MeshStandardMaterial({ color: 0xb8c0c4, roughness: 0.05, metalness: 1.0, envMapIntensity: 1.6 }));
    mirror.position.set(sx, 4.4, 1.09); g.add(mirror);
    const handle = cyl(0.04, 0.04, 0.5, M.brass, 8); handle.position.set(sx + (sx < 0 ? 0.9 : -0.9), 4.2, 1.12); g.add(handle);
    const knob = ball(0.08, M.brass, 8); knob.position.set(sx + (sx < 0 ? 0.9 : -0.9), 3.8, 1.12); g.add(knob);
  }
  // 底部抽屉
  for (let i = 0; i < 2; i++) { const dr = box(4.6, 0.8, 0.16, M.oakLight); dr.position.set(0, 0.9 + i * 0.9, 1.05); g.add(dr); for (const kx of [-1.2, 1.2]) { const k = ball(0.09, M.brass, 8); k.position.set(kx, 0.9 + i * 0.9, 1.12); g.add(k); } }
  // 短弯腿
  for (const [lx, lz] of [[-2.0, 0.8], [2.0, 0.8], [-2.0, -0.8], [2.0, -0.8]]) { const leg = box(0.4, 0.6, 0.4, M.oakDark); leg.position.set(lx, 0.3, lz); g.add(leg); }
  castAll(g, true, true); scene.add(g); contactShadow(scene, W / 2 - 6, D / 2 - 1, 6);

  /* 落地穿衣镜（cheval mirror） */
  const ch = new THREE.Group(); ch.position.set(W / 2 - 10, FLOOR_Y, D / 2 - 2); ch.rotation.y = Math.PI - 0.4;
  for (const sx of [-1.0, 1.0]) { const post = cyl(0.08, 0.1, 5.0, M.oakDark, 10); post.position.set(sx, 2.6, 0); ch.add(post); const finial = ball(0.16, M.brass, 10); finial.position.set(sx, 5.2, 0); ch.add(finial); }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.14, 10, 28), M.oakDark); ring.position.set(0, 3.0, 0); ring.scale.set(0.7, 1.0, 1); ch.add(ring);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 4.0), new THREE.MeshStandardMaterial({ color: 0xb8c0c4, roughness: 0.05, metalness: 1.0, envMapIntensity: 1.6 })); glass.position.set(0, 3.0, 0.05); ch.add(glass);
  const feet = box(2.6, 0.3, 1.2, M.oakDark); feet.position.y = 0.15; ch.add(feet);
  castAll(ch, true, true); scene.add(ch); contactShadow(scene, W / 2 - 10, D / 2 - 2, 3);

  return scene;
}
