/* ============================================================
   大理石胸像：四座立柱基座 + 程序化头肩胸像（古典摆设）
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_D as D, FLOOR_Y, box, cyl, ball, contactShadow, castAll } from './kit.js';

function pedestal(M) {
  const g = new THREE.Group();
  g.add(setp(box(1.0, 0.3, 1.0, M.stone), 0, 0.15, 0));     // 础
  g.add(setp(box(0.7, 3.0, 0.7, M.stone), 0, 1.7, 0));       // 柱身
  // 凹槽（柱身四面细线）
  for (const sx of [-0.36, 0.36]) { const flute = box(0.04, 2.8, 0.04, new THREE.MeshStandardMaterial({ color: 0x2a2620, roughness: 0.8 })); flute.position.set(sx, 1.7, 0); g.add(flute); }
  g.add(setp(box(1.1, 0.35, 1.1, M.stone), 0, 3.35, 0));     // 柱头台
  return g;
}

function bust(M) {
  const g = new THREE.Group();
  const marble = new THREE.MeshStandardMaterial({ color: 0xe4ddcf, roughness: 0.55, metalness: 0.02, envMapIntensity: 0.5 });
  // 肩胸
  const torso = ball(0.55, marble, 18); torso.scale.set(1.2, 0.8, 0.7); torso.position.y = 0.2; g.add(torso);
  const chest = box(0.9, 0.5, 0.5, marble); chest.position.y = 0.0; g.add(chest);
  // 颈
  const neck = cyl(0.16, 0.2, 0.4, marble, 12); neck.position.y = 0.55; g.add(neck);
  // 头
  const head = ball(0.32, marble, 18); head.scale.set(0.9, 1.1, 1); head.position.y = 0.95; g.add(head);
  // 鼻
  const nose = cone(0.06, 0.16, marble, 6); nose.position.set(0, 0.92, 0.3); nose.rotation.x = Math.PI / 2; g.add(nose);
  // 发卷（几团）
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI; const curl = ball(0.12, marble, 8); curl.position.set(Math.cos(a) * 0.28, 1.18, -0.1 + Math.sin(a) * 0.2); g.add(curl); }
  // 基座小方
  const plinth = box(0.7, 0.2, 0.5, M.stone); plinth.position.y = -0.3; g.add(plinth);
  return g;
}
function cone(r, h, m, s) { return new THREE.Mesh(new THREE.ConeGeometry(r, h, s), m); }

export function buildBusts(ctx) {
  const { scene, M } = ctx;
  const spots = [
    [-W / 2 + 2, D / 2 - 8, 0.3],
    [W / 2 - 2, -D / 2 + 8, -0.3],
    [-5, -D / 2 + 1.5, 0],
    [W / 2 - 8, D / 2 - 2, Math.PI],
  ];
  for (const [x, z, ry] of spots) {
    const ped = pedestal(M); ped.position.set(x, FLOOR_Y, z); ped.rotation.y = ry;
    const b = bust(M); b.position.set(0, 3.9, 0); ped.add(b);
    castAll(ped, true, true); scene.add(ped);
    contactShadow(scene, x, z, 2.2);
  }
  return scene;
}
function setp(m, x, y, z) { m.position.set(x, y, z); return m; }
