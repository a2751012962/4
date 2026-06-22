/* ============================================================
   地球仪酒柜（大号落地地球仪，掀盖即酒吧）+ 天球仪 + 托勒密式黄铜环架
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_D as D, FLOOR_Y, box, cyl, ball, contactShadow, castAll } from './kit.js';
import { worldMap } from './kit2.js';

export function buildGlobeBar(ctx) {
  const { scene, M, anim } = ctx;

  /* 落地地球仪酒柜 */
  const g = new THREE.Group(); g.position.set(7, FLOOR_Y, -10); g.rotation.y = 0.4;
  // 四足木架
  for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + Math.PI / 4; const leg = cyl(0.06, 0.09, 2.6, M.oakDark, 8); leg.position.set(Math.cos(a) * 0.7, 1.3, Math.sin(a) * 0.7); leg.rotation.z = Math.cos(a) * 0.16; leg.rotation.x = -Math.sin(a) * 0.16; g.add(leg); }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.06, 8, 24), M.brass); ring.rotation.x = Math.PI / 2; ring.position.y = 2.6; g.add(ring);
  // 球体（下半固定，上半掀开露出酒）
  const sphereMat = new THREE.MeshStandardMaterial({ map: worldMap(), roughness: 0.5, metalness: 0.1, envMapIntensity: 0.5 });
  const lower = new THREE.Mesh(new THREE.SphereGeometry(0.95, 24, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), sphereMat); lower.position.y = 3.4; g.add(lower);
  const upper = new THREE.Mesh(new THREE.SphereGeometry(0.95, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), sphereMat); upper.position.set(0, 3.4, 0); upper.rotation.z = 0.9; upper.position.x = -0.6; upper.position.y = 4.0; g.add(upper);
  // 内部酒瓶
  for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2; const bottle = cyl(0.08, 0.1, 0.5, new THREE.MeshPhysicalMaterial({ color: [0x3a5a2a, 0x5a2a1a, 0x2a3a4a, 0x4a2a3a][i], roughness: 0.12, transmission: 0.5, transparent: true, opacity: 0.85, envMapIntensity: 1.2 }), 12); bottle.position.set(Math.cos(a) * 0.4, 3.5, Math.sin(a) * 0.4); g.add(bottle); }
  // 子午环
  const meridian = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.05, 8, 28), M.brass); meridian.position.y = 3.4; g.add(meridian);
  castAll(g, true, true); scene.add(g); contactShadow(scene, 7, -10, 4);

  /* 天球仪（桌面小号，黄铜环架） */
  const cel = new THREE.Group(); cel.position.set(-W / 2 + 9, FLOOR_Y + 2.5, -D / 2 + 1.2);
  const cball = ball(0.4, new THREE.MeshStandardMaterial({ color: 0x1a2a4a, roughness: 0.4, metalness: 0.2, emissive: 0x0a1424, emissiveIntensity: 0.4, envMapIntensity: 0.6 }), 20); cel.add(cball);
  // 星点（小白点贴在球面附近）
  for (let i = 0; i < 30; i++) { const a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1); const r = 0.41; const star = ball(0.012, new THREE.MeshBasicMaterial({ color: 0xfff0d0 }), 5); star.position.set(r * Math.sin(b) * Math.cos(a), r * Math.cos(b), r * Math.sin(b) * Math.sin(a)); cel.add(star); }
  for (const ax of ['x', 'z']) { const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.03, 6, 24), M.brass); if (ax === 'x') hoop.rotation.y = Math.PI / 2; cel.add(hoop); }
  const cstand = cyl(0.06, 0.1, 0.5, M.brass, 8); cstand.position.y = -0.6; cel.add(cstand);
  castAll(cel, false, false); scene.add(cel);
  anim.push((dt) => { cball.rotation.y += dt * 0.1; });

  return scene;
}
