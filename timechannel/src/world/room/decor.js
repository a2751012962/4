/* ============================================================
   装饰：照片画廊墙 + 壁灯 + 落地大摆钟 + 留声机 + 棋桌 + 装饰边几
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_H as H, ROOM_D as D, FLOOR_Y, box, cyl, ball, cone, softSprite, painting, mulberry, castAll } from './kit.js';

const flameTex = softSprite('rgba(255,236,170,1)', 'rgba(255,110,30,0)', 'flame');
const glowTex = softSprite('rgba(255,225,150,0.9)', 'rgba(255,200,120,0)', 'glow');

export function buildDecor(ctx) {
  const { scene, M, anim } = ctx;
  const rnd = mulberry(909);

  /* ---------- 照片画廊墙（后墙左半 + 右墙入口处），相框大小错落 ---------- */
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x8a5a2a, roughness: 0.5, metalness: 0.2 });
  const gold = M.brass;
  const wall = [
    // [x,y,z,ry,scale]
    [-7, 4.5, -D / 2 + 0.2, 0, 1.3], [-9.5, 2.8, -D / 2 + 0.2, 0, 1.0], [-5, 2.6, -D / 2 + 0.2, 0, 0.9],
    [-7, 1.0, -D / 2 + 0.2, 0, 1.0], [-10.5, 5.0, -D / 2 + 0.2, 0, 0.8], [-4.2, 4.8, -D / 2 + 0.2, 0, 0.8],
    [-W / 2 + 0.2, 3.6, -10, Math.PI / 2, 1.1], [-W / 2 + 0.2, 1.6, -11.5, Math.PI / 2, 0.9],
  ];
  let pi = 0;
  for (const [x, y, z, ry, sc] of wall) {
    const grp = new THREE.Group(); grp.position.set(x, y, z); grp.rotation.y = ry; grp.rotation.z = (rnd() - 0.5) * 0.03;
    const fw = 2.4 * sc, fh = 1.9 * sc;
    const useGold = rnd() < 0.4;
    const fr = box(fw, fh, 0.12, useGold ? gold : frameMat); fr.castShadow = true; grp.add(fr);
    const tex = ctx.photoTex ? ctx.photoTex(pi) : painting(pi);
    const ph = new THREE.Mesh(new THREE.PlaneGeometry(fw * 0.84, fh * 0.84), new THREE.MeshBasicMaterial({ map: tex })); ph.position.z = 0.08; grp.add(ph);
    // 小画灯
    if (rnd() < 0.5) { const hood = box(fw * 0.6, 0.16, 0.3, gold); hood.position.set(0, fh / 2 + 0.2, 0.3); grp.add(hood); } // 画灯只留黄铜罩，不占实时光源
    scene.add(grp); pi++;
  }

  /* ---------- 壁灯（长墙上若干，带跳动火苗） ---------- */
  const sconceFlames = [];
  const sconceSpots = [[-W / 2 + 0.3, 4.5, 2, Math.PI / 2], [-W / 2 + 0.3, 4.5, -6, Math.PI / 2], [0, 5.5, -D / 2 + 0.3, 0], [6, 5.5, -D / 2 + 0.3, 0]];
  for (const [x, y, z, ry] of sconceSpots) {
    const s = new THREE.Group(); s.position.set(x, y, z); s.rotation.y = ry;
    s.add(box(0.3, 0.5, 0.2, M.brass));
    const arm = cyl(0.04, 0.04, 0.5, M.brass, 8); arm.rotation.x = Math.PI / 2; arm.position.set(0, 0.1, 0.3); s.add(arm);
    const cupp = cyl(0.14, 0.08, 0.2, M.brass, 12); cupp.position.set(0, 0.2, 0.5); s.add(cupp);
    const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
    fl.scale.set(0.45, 0.8, 1); fl.position.set(0, 0.55, 0.5); s.add(fl);
    scene.add(s); sconceFlames.push({ fl }); // 火苗 emissive+bloom 即可，不开实时点光
  }

  /* ---------- 落地大摆钟（后墙角） ---------- */
  const clock = new THREE.Group(); clock.position.set(W / 2 - 1.2, FLOOR_Y, -D / 2 + 1.4); clock.rotation.y = -0.4;
  clock.add(p(box(1.6, 7.5, 1.0, M.oakDark), 0, 3.75, 0));
  const cface = new THREE.Mesh(new THREE.CircleGeometry(0.55, 28), new THREE.MeshStandardMaterial({ color: 0xf0e6cc, roughness: 0.6 })); cface.position.set(0, 6.2, 0.52); clock.add(cface);
  const ch = box(0.05, 0.32, 0.03, M.iron); ch.position.set(0, 6.32, 0.55); clock.add(ch);
  const cm = box(0.04, 0.46, 0.03, M.iron); cm.position.set(0, 6.35, 0.55); clock.add(cm);
  // 钟摆
  const pendBob = cyl(0.28, 0.28, 0.06, M.brass, 18); const pend = new THREE.Group(); pend.position.set(0, 5.2, 0.45);
  const rod = box(0.04, 2.2, 0.04, M.brass); rod.position.y = -1.1; pend.add(rod); pendBob.position.y = -2.2; pend.add(pendBob); clock.add(pend);
  // 玻璃门
  const gdoor = box(1.0, 4.0, 0.05, new THREE.MeshStandardMaterial({ color: 0x223038, transparent: true, opacity: 0.25, roughness: 0.1, metalness: 0.3 })); gdoor.position.set(0, 4.2, 0.5); clock.add(gdoor);
  castAll(clock, true, true); scene.add(clock);

  /* ---------- 留声机（边几上） ---------- */
  const gtable = new THREE.Group(); gtable.position.set(W / 2 - 2.5, FLOOR_Y, 1);
  const gtop = box(1.6, 0.15, 1.6, M.oakLight); gtop.position.y = 1.5; gtable.add(gtop);
  for (const [lx, lz] of [[-0.6, 0.6], [0.6, 0.6], [-0.6, -0.6], [0.6, -0.6]]) { const leg = cyl(0.06, 0.06, 1.5, M.oakDark, 8); leg.position.set(lx, 0.75, lz); gtable.add(leg); }
  const gramoBase = box(1.0, 0.3, 1.0, M.oakDark); gramoBase.position.set(0, 1.7, 0); gtable.add(gramoBase);
  const platter = cyl(0.4, 0.4, 0.05, M.iron, 24); platter.position.set(0, 1.88, 0); gtable.add(platter);
  // 喇叭（圆锥）
  const horn = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.12, 1.4, 20, 1, true), new THREE.MeshStandardMaterial({ color: 0xb08a3a, roughness: 0.35, metalness: 0.85, side: THREE.DoubleSide }));
  horn.position.set(0.3, 2.6, 0); horn.rotation.z = -0.7; horn.rotation.x = 0.2; gtable.add(horn);
  castAll(gtable, true, true); scene.add(gtable);
  anim.push((dt) => { platter.rotation.y += dt * 2.2; });

  /* ---------- 棋桌（两把小凳） ---------- */
  const chess = new THREE.Group(); chess.position.set(-8, FLOOR_Y, 9);
  const ct = box(1.6, 0.15, 1.6, M.oakLight); ct.position.y = 1.3; chess.add(ct);
  for (const [lx, lz] of [[-0.6, 0.6], [0.6, 0.6], [-0.6, -0.6], [0.6, -0.6]]) { const leg = cyl(0.06, 0.06, 1.3, M.oakDark, 8); leg.position.set(lx, 0.65, lz); chess.add(leg); }
  // 棋盘
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { if ((i + j) % 2) continue; const sq = box(0.16, 0.02, 0.16, new THREE.MeshStandardMaterial({ color: 0x2a1a0e, roughness: 0.6 })); sq.position.set(-0.56 + i * 0.16, 1.39, -0.56 + j * 0.16); chess.add(sq); }
  const board = box(1.4, 0.04, 1.4, new THREE.MeshStandardMaterial({ color: 0xe8d8b0, roughness: 0.5 })); board.position.y = 1.37; chess.add(board);
  // 几枚棋子
  for (let i = 0; i < 10; i++) { const w = i < 5; const pc = cyl(0.05, 0.07, 0.18, new THREE.MeshStandardMaterial({ color: w ? 0xe8dcc0 : 0x2a1a14, roughness: 0.5 }), 12); pc.position.set(-0.56 + (rnd() * 8 | 0) * 0.16, 1.49, -0.56 + (rnd() * 8 | 0) * 0.16); chess.add(pc); }
  // 两个小凳
  for (const sz of [1.4, -1.4]) { const st = new THREE.Group(); st.position.set(0, 0, sz); st.add(p(cyl(0.4, 0.4, 0.2, M.velvetRed, 16), 0, 0.9, 0)); for (let k = 0; k < 3; k++) { const leg = cyl(0.05, 0.05, 0.9, M.oakDark, 6); const a = (k / 3) * Math.PI * 2; leg.position.set(Math.cos(a) * 0.25, 0.45, Math.sin(a) * 0.25); st.add(leg); } chess.add(st); }
  castAll(chess, true, true); scene.add(chess);

  // 动画：壁灯火苗 + 钟摆
  anim.push((dt, t) => {
    for (const { fl } of sconceFlames) {
      const cf = 0.8 + Math.sin(t * 12 + fl.position.z) * 0.18 + Math.sin(t * 26) * 0.08;
      fl.material.opacity = 0.7 + cf * 0.3; fl.scale.set(0.4 + cf * 0.12, 0.7 + cf * 0.2, 1);
    }
    pend.rotation.z = Math.sin(t * 1.6) * 0.16;
    cm.rotation.z = -t * 0.5; ch.rotation.z = -t * 0.04;
  });

  return scene;
}
function p(m, x, y, z) { m.position.set(x, y, z); return m; }
