/* ============================================================
   台球桌：绿呢台面 + 木边库 + 六袋 + 车削粗腿 + 三角码好的球 + 墙上球杆架 +
   低垂的双罩吊灯（发光罩，靠 bloom，无新增实时光）
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_H as H, ROOM_D as D, FLOOR_Y, box, cyl, ball, turnedLeg, contactShadow, castAll, mulberry } from './kit.js';

const BALL_COLORS = [0xf0e8d0, 0xf0d020, 0x2050c0, 0xd03020, 0x602090, 0xe06010, 0x208040, 0x802020, 0x101014];

export function buildBilliards(ctx) {
  const { scene, M } = ctx;
  const rnd = mulberry(88);
  const g = new THREE.Group();
  g.position.set(-3, FLOOR_Y, -9);
  g.rotation.y = 0.2;

  const TW = 6.0, TD = 3.2, TH = 1.7;
  const felt = new THREE.MeshStandardMaterial({ color: 0x1e6a3a, roughness: 0.92, envMapIntensity: 0.15 });
  const rail = M.oakDark;

  // 台面
  const bed = box(TW, 0.4, TD, felt); bed.position.y = TH; g.add(bed);
  // 木边库（四周）
  for (const [x, z, w, d] of [[0, TD / 2 + 0.18, TW + 0.7, 0.36], [0, -TD / 2 - 0.18, TW + 0.7, 0.36], [TW / 2 + 0.18, 0, 0.36, TD + 0.36], [-TW / 2 - 0.18, 0, 0.36, TD + 0.36]]) {
    const r = box(w, 0.5, d, rail); r.position.set(x, TH + 0.15, z); g.add(r);
  }
  // 库内缓冲（毛呢内沿）
  for (const [x, z, w, d] of [[0, TD / 2 - 0.05, TW - 0.4, 0.18], [0, -TD / 2 + 0.05, TW - 0.4, 0.18], [TW / 2 - 0.05, 0, 0.18, TD - 0.4], [-TW / 2 + 0.05, 0, 0.18, TD - 0.4]]) {
    const r = box(w, 0.22, d, felt); r.position.set(x, TH + 0.25, z); g.add(r);
  }
  // 六个袋口
  for (const [px, pz] of [[-TW / 2, TD / 2], [TW / 2, TD / 2], [-TW / 2, -TD / 2], [TW / 2, -TD / 2], [0, TD / 2 + 0.05], [0, -TD / 2 - 0.05]]) {
    const pocket = cyl(0.28, 0.24, 0.4, new THREE.MeshStandardMaterial({ color: 0x140d08, roughness: 1 }), 14); pocket.position.set(px, TH + 0.1, pz); g.add(pocket);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.05, 8, 16), M.brass); ring.rotation.x = Math.PI / 2; ring.position.set(px, TH + 0.35, pz); g.add(ring);
  }
  // 围裙 + 四条粗车削腿
  const apron = box(TW, 0.5, TD, rail); apron.position.y = TH - 0.35; g.add(apron);
  for (const [lx, lz] of [[-TW / 2 + 0.6, TD / 2 - 0.5], [TW / 2 - 0.6, TD / 2 - 0.5], [-TW / 2 + 0.6, -TD / 2 + 0.5], [TW / 2 - 0.6, -TD / 2 + 0.5]]) {
    const leg = turnedLeg(TH - 0.6, 0.3, rail); leg.position.set(lx, 0, lz); g.add(leg);
  }

  // 三角码球（15 彩球 + 1 白球）
  const r = 0.16; let bi = 0;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col <= row; col++) {
      const bx = -1.4 - row * r * 1.74;
      const bz = (col - row / 2) * r * 2.05;
      const bb = ball(r, new THREE.MeshStandardMaterial({ color: BALL_COLORS[bi % BALL_COLORS.length], roughness: 0.18, metalness: 0.0, envMapIntensity: 0.8, clearcoat: 1 }), 16);
      bb.position.set(bx, TH + 0.36, bz); g.add(bb); bi++;
    }
  }
  const cue = ball(r, new THREE.MeshStandardMaterial({ color: 0xf4efe2, roughness: 0.15, envMapIntensity: 0.9 }), 16); cue.position.set(1.8, TH + 0.36, 0); g.add(cue);

  // 墙上球杆架（靠左墙）
  const rackG = new THREE.Group(); rackG.position.set(-W / 2 + 0.6, FLOOR_Y + 4, -9); rackG.rotation.y = Math.PI / 2;
  rackG.add(box(2.4, 0.3, 0.3, rail));
  const lowRack = box(2.4, 0.3, 0.3, rail); lowRack.position.y = -3; rackG.add(lowRack);
  for (let i = 0; i < 4; i++) {
    const stick = cyl(0.04, 0.06, 3.4, M.oakLight, 8); stick.position.set(-0.9 + i * 0.6, -1.5, 0.2); rackG.add(stick);
    const tip = cyl(0.045, 0.045, 0.1, new THREE.MeshStandardMaterial({ color: 0x3a6a8a, roughness: 0.7 }), 8); tip.position.set(-0.9 + i * 0.6, 0.2, 0.2); rackG.add(tip);
  }
  castAll(rackG, true, false); scene.add(rackG);

  // 低垂双罩吊灯（发光罩）
  const lampG = new THREE.Group(); lampG.position.set(0, TH + 3.2, 0);
  const rod = cyl(0.04, 0.04, 2.0, M.brass, 8); rod.position.y = 1.2; lampG.add(rod);
  for (const lx of [-1.4, 1.4]) {
    const shade = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x2a5a3a, emissive: 0x6aa07a, emissiveIntensity: 0.5, side: THREE.DoubleSide, roughness: 0.5 }));
    shade.position.set(lx, 0, 0); shade.rotation.x = Math.PI; lampG.add(shade);
    const bulb = ball(0.18, new THREE.MeshBasicMaterial({ color: 0xfff0d0 }), 10); bulb.position.set(lx, -0.2, 0); lampG.add(bulb);
  }
  g.add(lampG);

  castAll(g, true, true);
  scene.add(g);
  contactShadow(scene, g.position.x, g.position.z, 9);
  return g;
}
