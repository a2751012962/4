/* ============================================================
   杂件：黄铜望远镜 + 瓶中船 + 五枝烛台 + 天平 + 雪球 + 地板叠书 + 卷轴 +
   两张长条边几承载这些小物，让房间显得"有人住过"
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_D as D, FLOOR_Y, box, cyl, ball, cone, turnedLeg, contactShadow, castAll, softSprite, mulberry } from './kit.js';

const flameTex = softSprite('rgba(255,236,170,1)', 'rgba(255,110,30,0)', 'flame');

function consoleTable(M) {
  const g = new THREE.Group();
  const top = box(4.0, 0.16, 1.2, M.oakLight); top.position.y = 2.4; g.add(top);
  const apron = box(3.8, 0.3, 1.0, M.oakMed); apron.position.y = 2.25; g.add(apron);
  for (const [lx, lz] of [[-1.8, 0.45], [1.8, 0.45], [-1.8, -0.45], [1.8, -0.45]]) { const leg = turnedLeg(2.3, 0.1, M.oakDark); leg.position.set(lx, 0, lz); g.add(leg); }
  // 拉档
  const str = box(3.6, 0.08, 0.08, M.oakDark); str.position.set(0, 0.5, 0); g.add(str);
  return g;
}

function telescope(M) {
  const g = new THREE.Group();
  // 三脚架
  for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; const leg = cyl(0.04, 0.05, 2.4, M.oakDark, 8); leg.position.set(Math.cos(a) * 0.5, 1.2, Math.sin(a) * 0.5); leg.rotation.z = Math.cos(a) * 0.22; leg.rotation.x = -Math.sin(a) * 0.22; g.add(leg); }
  const head = ball(0.16, M.brass, 12); head.position.y = 2.4; g.add(head);
  // 镜筒
  const tube = cyl(0.14, 0.18, 2.0, M.brass, 16); tube.position.set(0.3, 2.9, 0); tube.rotation.z = -0.6; g.add(tube);
  const eye = cyl(0.06, 0.06, 0.3, M.brass, 12); eye.position.set(-0.5, 2.5, 0); eye.rotation.z = -0.6; g.add(eye);
  return g;
}

function candelabra(M) {
  const g = new THREE.Group();
  const base = cyl(0.18, 0.24, 0.16, M.brass, 16); base.position.y = 0.08; g.add(base);
  const stem = cyl(0.05, 0.06, 0.9, M.brass, 10); stem.position.y = 0.55; g.add(stem);
  const flames = [];
  for (let i = -2; i <= 2; i++) {
    const arm = cyl(0.03, 0.03, Math.abs(i) * 0.35 + 0.1, M.brass, 6); arm.rotation.z = Math.PI / 2; arm.position.set(i * 0.18, 0.9 + Math.abs(i) * 0.06, 0); g.add(arm);
    const cup = cyl(0.06, 0.04, 0.1, M.brass, 8); cup.position.set(i * 0.36, 1.0 + Math.abs(i) * 0.12, 0); g.add(cup);
    const candle = cyl(0.04, 0.05, 0.3, new THREE.MeshStandardMaterial({ color: 0xf0e4c8, roughness: 0.6 }), 8); candle.position.set(i * 0.36, 1.2 + Math.abs(i) * 0.12, 0); g.add(candle);
    const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
    fl.scale.set(0.18, 0.32, 1); fl.position.set(i * 0.36, 1.42 + Math.abs(i) * 0.12, 0); g.add(fl); flames.push(fl);
  }
  g.userData.flames = flames;
  return g;
}

function shipInBottle(M) {
  const g = new THREE.Group();
  const stand = box(0.7, 0.1, 0.3, M.oakDark); g.add(stand);
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xdfeef2, roughness: 0.08, metalness: 0, transmission: 0.6, thickness: 0.2, transparent: true, opacity: 0.4, envMapIntensity: 1.3 });
  const bottle = cyl(0.16, 0.16, 0.7, glass, 18); bottle.rotation.z = Math.PI / 2; bottle.position.y = 0.22; g.add(bottle);
  const neck = cyl(0.06, 0.1, 0.18, glass, 12); neck.rotation.z = Math.PI / 2; neck.position.set(0.42, 0.22, 0); g.add(neck);
  // 小船
  const hull = box(0.3, 0.08, 0.1, new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 0.7 })); hull.position.y = 0.18; g.add(hull);
  const mast = cyl(0.01, 0.01, 0.3, new THREE.MeshStandardMaterial({ color: 0x4a3018 }), 5); mast.position.set(0, 0.35, 0); g.add(mast);
  const sail = box(0.18, 0.2, 0.005, new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.8, side: THREE.DoubleSide })); sail.position.set(0, 0.38, 0); g.add(sail);
  return g;
}

function brassScales(M) {
  const g = new THREE.Group();
  const base = cyl(0.16, 0.2, 0.1, M.brass, 14); base.position.y = 0.05; g.add(base);
  const post = cyl(0.03, 0.03, 0.7, M.brass, 8); post.position.y = 0.4; g.add(post);
  const beam = box(0.7, 0.03, 0.03, M.brass); beam.position.y = 0.75; g.add(beam);
  for (const sx of [-0.32, 0.32]) { const pan = cyl(0.12, 0.1, 0.04, M.brass, 14); pan.position.set(sx, 0.6, 0); g.add(pan); for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; const ch = cyl(0.004, 0.004, 0.15, M.brass, 4); ch.position.set(sx + Math.cos(a) * 0.08, 0.68, Math.sin(a) * 0.08); g.add(ch); } }
  return g;
}

function snowGlobe(M) {
  const g = new THREE.Group();
  const base = cyl(0.16, 0.18, 0.1, M.oakDark, 16); base.position.y = 0.05; g.add(base);
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xeaf4f8, roughness: 0.05, metalness: 0, transmission: 0.7, thickness: 0.3, transparent: true, opacity: 0.4, envMapIntensity: 1.5 });
  const dome = ball(0.2, glass, 18); dome.position.y = 0.28; g.add(dome);
  const tree = cone(0.08, 0.2, new THREE.MeshStandardMaterial({ color: 0x2e5a3a, roughness: 0.7 }), 8); tree.position.y = 0.22; g.add(tree);
  return g;
}

export function buildClutter(ctx) {
  const { scene, M } = ctx;
  const rnd = mulberry(31);
  const candAnims = [];

  // 后墙长条边几 + 一堆小物
  const c1 = consoleTable(M); c1.position.set(-6, FLOOR_Y, -D / 2 + 1.2); scene.add(c1); contactShadow(scene, -6, -D / 2 + 1.2, 5);
  const tel = telescope(M); tel.position.set(W / 2 - 4, FLOOR_Y, D / 2 - 8); scene.add(tel); contactShadow(scene, W / 2 - 4, D / 2 - 8, 3);

  const cand = candelabra(M); cand.position.set(-7, FLOOR_Y + 2.48, -D / 2 + 1.2); scene.add(cand); candAnims.push(cand);
  const ship = shipInBottle(M); ship.position.set(-5, FLOOR_Y + 2.48, -D / 2 + 1.2); scene.add(ship);
  const scales = brassScales(M); scales.position.set(-6, FLOOR_Y + 2.48, -D / 2 + 1.4); scene.add(scales);
  const globe = snowGlobe(M); globe.position.set(-4.6, FLOOR_Y + 2.48, -D / 2 + 1.2); scene.add(globe);

  // 第二张边几（钢琴旁）
  const c2 = consoleTable(M); c2.position.set(8, FLOOR_Y, D / 2 - 2.5); c2.rotation.y = Math.PI; scene.add(c2); contactShadow(scene, 8, D / 2 - 2.5, 5);
  const cand2 = candelabra(M); cand2.position.set(8, FLOOR_Y + 2.48, D / 2 - 2.5); scene.add(cand2); candAnims.push(cand2);
  // 一摞书
  for (let k = 0; k < 5; k++) { const b = box(1.0, 0.16, 0.7, new THREE.MeshStandardMaterial({ color: ['#5a2a2a', '#2a4a3a', '#3a3a5a', '#5a4a2a', '#4a2a4a'][k], roughness: 0.7 })); b.position.set(7, FLOOR_Y + 2.56 + k * 0.17, D / 2 - 2.5); b.rotation.y = rnd() * 0.1; scene.add(b); }

  // 地板上几摞书 + 卷轴
  for (const [sx, sz] of [[-3, 9], [10, -9], [-10, 4]]) {
    const n = 3 + (rnd() * 4 | 0);
    for (let k = 0; k < n; k++) { const b = box(0.9 + rnd() * 0.3, 0.18, 0.66, new THREE.MeshStandardMaterial({ color: ['#5a2a2a', '#2a4a3a', '#3a3a5a', '#5a4a2a'][(rnd() * 4 | 0)], roughness: 0.7 })); b.position.set(sx, FLOOR_Y + 0.09 + k * 0.19, sz); b.rotation.y = rnd() * 0.5; b.castShadow = true; b.receiveShadow = true; scene.add(b); }
    contactShadow(scene, sx, sz, 2.4);
  }

  castAll(c1, true, true); castAll(c2, true, true); castAll(tel, true, true);
  [cand, cand2, ship, scales, globe].forEach((o) => castAll(o, true, false));

  ctx.anim.push((dt, t) => {
    for (const c of candAnims) {
      for (const fl of c.userData.flames) { const cf = 0.8 + Math.sin(t * 13 + fl.position.x * 3) * 0.2; fl.material.opacity = 0.6 + cf * 0.3; fl.scale.set(0.14 + cf * 0.06, 0.26 + cf * 0.12, 1); }
    }
  });
  return scene;
}
