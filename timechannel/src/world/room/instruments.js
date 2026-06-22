/* ============================================================
   乐器角：竖琴(多根琴弦) + 小提琴(置于谱架旁) + 大提琴靠墙 + 谱台
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_D as D, FLOOR_Y, box, cyl, ball, cone, castAll } from './kit.js';

function harp(M) {
  const g = new THREE.Group();
  const gold = M.brass;
  const wood = new THREE.MeshStandardMaterial({ color: 0x6a4426, roughness: 0.5, metalness: 0.1, envMapIntensity: 0.6 });
  // 共鸣箱（斜三棱柱近似）
  const sound = box(0.5, 4.2, 0.7, wood); sound.position.set(0, 2.6, 0); sound.rotation.z = 0.12; g.add(sound);
  // 立柱（前柱，带卷涡顶）
  const pillar = cyl(0.12, 0.14, 4.4, gold, 12); pillar.position.set(2.0, 2.7, 0); pillar.rotation.z = -0.18; g.add(pillar);
  const scroll = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.08, 10, 18), gold); scroll.position.set(1.6, 4.9, 0); g.add(scroll);
  // 颈（弯梁）连接柱顶与音箱顶
  const neck = box(2.4, 0.22, 0.22, wood); neck.position.set(0.9, 4.7, 0); neck.rotation.z = -0.5; g.add(neck);
  // 琴弦（多根，渐变长度）
  for (let i = 0; i < 30; i++) {
    const tt = i / 29;
    const len = 0.8 + tt * 3.4;
    const x = 0.1 + tt * 1.7;
    const yTop = 4.6 - tt * 0.0;
    const str = cyl(0.006, 0.006, len, new THREE.MeshStandardMaterial({ color: i % 5 === 0 ? 0xd03030 : 0xe8e0c8, roughness: 0.5, metalness: 0.3 }), 4);
    str.position.set(x, yTop - len / 2 + 0.3, 0); str.rotation.z = -0.25; g.add(str);
  }
  // 底座 + 踏板
  const base = cyl(0.5, 0.6, 0.4, wood, 16); base.position.set(0.6, 0.2, 0); g.add(base);
  return g;
}

function violinBody(M, scale) {
  const g = new THREE.Group();
  const wood = new THREE.MeshPhysicalMaterial({ color: 0x7a3a18, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 0.9 });
  const upper = ball(0.32, wood, 14); upper.scale.set(1, 1.2, 0.34); upper.position.y = 0.5; g.add(upper);
  const lower = ball(0.42, wood, 14); lower.scale.set(1, 1.3, 0.34); lower.position.y = -0.4; g.add(lower);
  const waist = box(0.4, 0.5, 0.2, wood); waist.position.y = 0.05; g.add(waist);
  const neck = box(0.12, 1.0, 0.1, new THREE.MeshStandardMaterial({ color: 0x2a1a0e, roughness: 0.5 })); neck.position.y = 1.3; g.add(neck);
  const scroll = ball(0.1, new THREE.MeshStandardMaterial({ color: 0x2a1a0e }), 10); scroll.position.y = 1.85; g.add(scroll);
  for (let i = 0; i < 4; i++) { const s = cyl(0.004, 0.004, 1.6, new THREE.MeshStandardMaterial({ color: 0xe8e0c8, metalness: 0.3 }), 4); s.position.set(-0.045 + i * 0.03, 0.6, 0.16); g.add(s); }
  g.scale.setScalar(scale);
  return g;
}

export function buildInstruments(ctx) {
  const { scene, M } = ctx;

  // 竖琴（左前角）
  const h = harp(M); h.position.set(-W / 2 + 4, FLOOR_Y, D / 2 - 10); h.rotation.y = 0.6;
  castAll(h, true, true); scene.add(h);

  // 大提琴靠墙 + 立架
  const cello = violinBody(M, 2.2); cello.position.set(-W / 2 + 2, FLOOR_Y + 3.2, D / 2 - 13); cello.rotation.set(0.1, 0.5, 0.15);
  castAll(cello, true, false); scene.add(cello);
  const endpin = cyl(0.02, 0.02, 1.2, M.iron, 6); endpin.position.set(-W / 2 + 2, FLOOR_Y + 0.6, D / 2 - 12.6); scene.add(endpin);

  // 谱台 + 小提琴搭在上面
  const stand = new THREE.Group(); stand.position.set(-W / 2 + 6.5, FLOOR_Y, D / 2 - 11);
  const pole = cyl(0.03, 0.03, 3.4, M.iron, 8); pole.position.y = 1.7; stand.add(pole);
  const tri = cone(0.4, 0.3, M.iron, 3); tri.position.y = 0.15; stand.add(tri);
  const desk = box(1.6, 1.0, 0.06, M.iron); desk.position.set(0, 3.3, 0.1); desk.rotation.x = -0.4; stand.add(desk);
  const vio = violinBody(M, 1.0); vio.position.set(0, 3.6, 0.2); vio.rotation.set(-0.4, 0, 1.3); stand.add(vio);
  const bow = cyl(0.012, 0.012, 1.6, new THREE.MeshStandardMaterial({ color: 0x3a2a18 }), 5); bow.position.set(0.3, 3.5, 0.3); bow.rotation.z = 1.2; stand.add(bow);
  castAll(stand, true, false); scene.add(stand);

  return scene;
}
