/* ============================================================
   绿植：蕨类 / 棕榈 / 垂蔓吊篮 / 高身龙血树，多盆点缀房间各处
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_H as H, ROOM_D as D, FLOOR_Y, box, cyl, ball, cone, castAll, mulberry } from './kit.js';

const POT = () => new THREE.MeshStandardMaterial({ color: 0x7a4a2a, roughness: 0.8, envMapIntensity: 0.4 });
const LEAF = (h) => new THREE.MeshStandardMaterial({ color: h, roughness: 0.7, side: THREE.DoubleSide, envMapIntensity: 0.3 });

function fern(rnd) {
  const g = new THREE.Group();
  const pot = cyl(0.42, 0.32, 0.7, POT(), 16); pot.position.y = 0.35; g.add(pot);
  const rim = cyl(0.46, 0.42, 0.12, POT(), 16); rim.position.y = 0.66; g.add(rim);
  const leaf = LEAF(0x3a6a3a);
  for (let i = 0; i < 22; i++) {
    const frond = new THREE.Group();
    const a = (i / 22) * Math.PI * 2;
    frond.position.set(Math.cos(a) * 0.2, 0.7, Math.sin(a) * 0.2);
    const len = 1.2 + rnd() * 0.8;
    for (let s = 0; s < 7; s++) {
      const blade = box(0.04, 0.02, 0.22 - s * 0.02, leaf);
      blade.position.set(0, s * (len / 7), 0);
      frond.add(blade);
    }
    frond.rotation.z = (rnd() - 0.5) * 1.4;
    frond.rotation.x = (rnd() - 0.5) * 1.0;
    g.add(frond);
  }
  return g;
}

function palm(rnd) {
  const g = new THREE.Group();
  const pot = cyl(0.5, 0.4, 1.0, POT(), 16); pot.position.y = 0.5; g.add(pot);
  const trunk = cyl(0.12, 0.16, 3.2, new THREE.MeshStandardMaterial({ color: 0x6a5028, roughness: 0.8 }), 10); trunk.position.y = 2.4; g.add(trunk);
  const leaf = LEAF(0x2e6a3a);
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const frond = cone(0.18, 2.4, leaf, 4);
    frond.position.set(Math.cos(a) * 0.2, 4.0, Math.sin(a) * 0.2);
    frond.rotation.z = Math.cos(a) * 0.9; frond.rotation.x = Math.sin(a) * 0.9;
    frond.scale.set(1, 1, 0.3);
    g.add(frond);
  }
  return g;
}

function hangingVine(rnd) {
  const g = new THREE.Group();
  const basket = cyl(0.4, 0.3, 0.4, new THREE.MeshStandardMaterial({ color: 0x8a6a3a, roughness: 0.8 }), 14); g.add(basket);
  const leaf = LEAF(0x4a7a4a);
  for (let v = 0; v < 10; v++) {
    const a = (v / 10) * Math.PI * 2;
    const len = 1.5 + rnd() * 1.5;
    const strand = new THREE.Group(); strand.position.set(Math.cos(a) * 0.35, -0.2, Math.sin(a) * 0.35);
    for (let s = 0; s < 10; s++) {
      const lf = box(0.12, 0.02, 0.18, leaf);
      lf.position.set(Math.sin(s * 0.8) * 0.1, -s * (len / 10), 0);
      lf.rotation.z = Math.sin(s) * 0.5;
      strand.add(lf);
    }
    g.add(strand);
  }
  // 吊绳
  for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; const rope = cyl(0.01, 0.01, 1.4, new THREE.MeshStandardMaterial({ color: 0x6a5a3a }), 5); rope.position.set(Math.cos(a) * 0.3, 0.7, Math.sin(a) * 0.3); g.add(rope); }
  return g;
}

function dracaena(rnd) {
  const g = new THREE.Group();
  const pot = cyl(0.55, 0.42, 1.1, POT(), 16); pot.position.y = 0.55; g.add(pot);
  for (let c = 0; c < 3; c++) {
    const trunk = cyl(0.1, 0.13, 2.2 + c * 0.6, new THREE.MeshStandardMaterial({ color: 0x5a4424, roughness: 0.85 }), 8);
    trunk.position.set((c - 1) * 0.2, 1.1 + (2.2 + c * 0.6) / 2 - 0.55, 0); trunk.rotation.z = (c - 1) * 0.12; g.add(trunk);
    const leaf = LEAF(0x3a7a4a);
    const topY = 1.1 + (2.2 + c * 0.6);
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; const bl = cone(0.06, 1.0, leaf, 4); bl.position.set((c - 1) * 0.2 + Math.cos(a) * 0.1, topY, Math.sin(a) * 0.1); bl.rotation.z = Math.cos(a) * 1.1; bl.rotation.x = Math.sin(a) * 1.1; bl.scale.set(1, 1, 0.2); g.add(bl); }
  }
  return g;
}

export function buildPlants(ctx) {
  const { scene } = ctx;
  const rnd = mulberry(7);
  const place = (mk, x, z, s = 1) => { const p = mk(rnd); p.position.set(x, FLOOR_Y, z); p.scale.setScalar(s); castAll(p, true, false); scene.add(p); };

  place(palm, -W / 2 + 2.5, -D / 2 + 3, 1.1);
  place(fern, W / 2 - 2.5, D / 2 - 3, 1.0);
  place(dracaena, W / 2 - 3, -D / 2 + 4, 1.0);
  place(fern, -W / 2 + 3, D / 2 - 6, 0.9);
  place(palm, W / 2 - 4, D / 2 - 5, 0.9);

  // 吊篮（从天花垂下）
  const vine1 = hangingVine(rnd); vine1.position.set(-6, H / 2 - 1.5, -6); castAll(vine1, true, false); scene.add(vine1);
  const vine2 = hangingVine(rnd); vine2.position.set(7, H / 2 - 1.5, 6); castAll(vine2, true, false); scene.add(vine2);

  // 轻轻摆动
  ctx.anim.push((dt, t) => { vine1.rotation.z = Math.sin(t * 0.5) * 0.04; vine2.rotation.z = Math.sin(t * 0.5 + 1) * 0.04; });
  return scene;
}
