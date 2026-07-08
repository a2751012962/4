/* ============================================================
   阅读角：贵妃榻 + 落地灯(发光灯罩) + 小圆几(茶壶/茶杯/眼镜/叠书) + 抱枕/毛毯
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_D as D, FLOOR_Y, box, cyl, ball, turnedLeg, contactShadow, castAll } from './kit.js';

export function buildNook(ctx) {
  const { scene, M } = ctx;
  const g = new THREE.Group();
  g.position.set(-W / 2 + 5, FLOOR_Y, -D / 2 + 6);
  g.rotation.y = 0.7;

  const vel = M.velvetRed;
  // 贵妃榻：长座 + 一端高背 + 卷枕
  const seat = box(5.0, 0.7, 2.0, vel); seat.position.set(0, 1.0, 0); g.add(seat);
  const cushion = box(4.8, 0.4, 1.9, vel); cushion.position.set(0, 1.45, 0); g.add(cushion);
  const backRest = box(0.5, 1.8, 2.0, vel); backRest.position.set(-2.25, 2.0, 0); backRest.rotation.z = 0.15; g.add(backRest);
  const roll = cyl(0.5, 0.5, 2.0, vel, 18); roll.rotation.x = Math.PI / 2; roll.position.set(2.2, 1.7, 0); g.add(roll);
  // 抱枕
  for (let i = 0; i < 3; i++) { const pil = box(1.0, 0.9, 0.4, i % 2 ? M.velvetGreen : M.leatherOx); pil.position.set(-1.2 + i * 1.0, 1.9, -0.5); pil.rotation.set(-0.4, i * 0.2, 0.1); g.add(pil); }
  // 毛毯（搭在一端）
  const throwB = box(2.2, 0.12, 2.0, new THREE.MeshStandardMaterial({ color: 0x8a6a3a, roughness: 0.95 })); throwB.position.set(1.2, 1.66, 0); throwB.rotation.z = -0.05; g.add(throwB);
  // 车削榻腿
  for (const [lx, lz] of [[-2.2, 0.8], [2.2, 0.8], [-2.2, -0.8], [2.2, -0.8]]) { const leg = turnedLeg(1.0, 0.12, M.oakDark); leg.position.set(lx, 0, lz); g.add(leg); }

  castAll(g, true, true);
  scene.add(g);
  contactShadow(scene, g.position.x, g.position.z, 8);

  // 落地灯（发光灯罩，靠 bloom）
  const lamp = new THREE.Group(); lamp.position.set(-W / 2 + 3, FLOOR_Y, -D / 2 + 3.5);
  const lbase = cyl(0.4, 0.45, 0.12, M.brass, 18); lbase.position.y = 0.06; lamp.add(lbase);
  const lpole = cyl(0.05, 0.05, 4.4, M.brass, 10); lpole.position.y = 2.2; lamp.add(lpole);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.1, 22, 1, true), new THREE.MeshStandardMaterial({ color: 0xe8d0a0, emissive: 0xffcf8a, emissiveIntensity: 0.85, side: THREE.DoubleSide, roughness: 0.6 }));
  shade.position.y = 4.2; lamp.add(shade);
  const bulb = ball(0.18, new THREE.MeshBasicMaterial({ color: 0xfff0d0 }), 12); bulb.position.y = 4.1; lamp.add(bulb);
  const lampGlow = new THREE.PointLight(0xffd9a0, 0.9, 16, 1.8); lampGlow.position.y = 4.0; lamp.add(lampGlow); lampGlow.userData.base = 0.9;
  castAll(lamp, true, false);
  scene.add(lamp);

  // 小圆几 + 茶具
  const tbl = new THREE.Group(); tbl.position.set(-W / 2 + 8.5, FLOOR_Y, -D / 2 + 5);
  const ttop = cyl(0.7, 0.7, 0.12, M.oakLight, 24); ttop.position.y = 1.5; tbl.add(ttop);
  const tpost = cyl(0.1, 0.1, 1.5, M.oakDark, 10); tpost.position.y = 0.75; tbl.add(tpost);
  const tfoot = cyl(0.5, 0.5, 0.1, M.oakDark, 16); tfoot.position.y = 0.05; tbl.add(tfoot);
  // 茶壶
  const pot = ball(0.24, M.porcelainMat, 16); pot.scale.set(1, 0.8, 1); pot.position.set(0.1, 1.75, 0); tbl.add(pot);
  const spout = cyl(0.04, 0.06, 0.3, M.porcelainMat, 8); spout.position.set(0.32, 1.78, 0); spout.rotation.z = -0.8; tbl.add(spout);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 8, 14), M.porcelainMat); handle.position.set(-0.2, 1.8, 0); tbl.add(handle);
  const lid = ball(0.08, M.porcelainMat, 10); lid.position.set(0.1, 1.95, 0); tbl.add(lid);
  // 茶杯
  const saucer = cyl(0.16, 0.16, 0.03, M.porcelainMat, 16); saucer.position.set(-0.3, 1.57, 0.2); tbl.add(saucer);
  const cup = cyl(0.1, 0.08, 0.12, M.porcelainMat, 14); cup.position.set(-0.3, 1.64, 0.2); tbl.add(cup);
  // 叠书 + 眼镜
  for (let k = 0; k < 2; k++) { const b = box(0.7, 0.12, 0.5, new THREE.MeshStandardMaterial({ color: ['#3a3a5a', '#5a2a2a'][k], roughness: 0.7 })); b.position.set(0.2, 1.62 + k * 0.13, -0.3); tbl.add(b); }
  const glasses = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 8, 16), M.brass); glasses.position.set(0.1, 1.76, -0.3); glasses.rotation.x = Math.PI / 2; tbl.add(glasses);
  const glasses2 = glasses.clone(); glasses2.position.x = 0.24; tbl.add(glasses2);
  castAll(tbl, true, true);
  scene.add(tbl);

  ctx.anim.push((dt, t) => { lampGlow.intensity = lampGlow.userData.base * (0.95 + Math.sin(t * 5) * 0.05); });
  return g;
}
