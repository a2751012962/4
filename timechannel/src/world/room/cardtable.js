/* ============================================================
   牌桌一角：折叠绿呢牌桌 + 两把弧背椅 + 散落的扑克牌 + 筹码堆 + 烛台 + 一副牌
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_D as D, FLOOR_Y, box, cyl, ball, turnedLeg, contactShadow, castAll, mulberry } from './kit.js';

export function buildCardTable(ctx) {
  const { scene, M } = ctx;
  const rnd = mulberry(52);
  const g = new THREE.Group();
  g.position.set(11, FLOOR_Y, 11);
  g.rotation.y = -0.7;

  // 圆牌桌：木边 + 绿呢面
  const felt = new THREE.MeshStandardMaterial({ color: 0x1e6a3a, roughness: 0.92, envMapIntensity: 0.15 });
  const top = cyl(1.5, 1.5, 0.12, M.oakMed, 28); top.position.y = 1.6; g.add(top);
  const cloth = cyl(1.35, 1.35, 0.02, felt, 28); cloth.position.y = 1.67; g.add(cloth);
  const apron = cyl(1.4, 1.4, 0.3, M.oakDark, 28, true); apron.position.y = 1.45; g.add(apron);
  // 中央独腿 + 三爪
  const post = cyl(0.18, 0.22, 1.4, M.oakDark, 12); post.position.y = 0.8; g.add(post);
  for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; const foot = box(0.2, 0.18, 1.1, M.oakDark); foot.position.set(Math.cos(a) * 0.5, 0.12, Math.sin(a) * 0.5); foot.rotation.y = -a; g.add(foot); }

  // 筹码堆
  const chipCols = [0xc23a3a, 0x3a5ac2, 0x2a8a4a, 0xe8e0c8];
  for (let s = 0; s < 4; s++) { const cx = -0.5 + s * 0.3, cz = 0.3; const h = 3 + (rnd() * 5 | 0); for (let k = 0; k < h; k++) { const chip = cyl(0.12, 0.12, 0.03, new THREE.MeshStandardMaterial({ color: chipCols[s], roughness: 0.5 }), 16); chip.position.set(cx, 1.7 + k * 0.032, cz); g.add(chip); } }

  // 散落的牌 + 一副立着的牌
  const cardMat = new THREE.MeshStandardMaterial({ color: 0xf4efe6, roughness: 0.6 });
  for (let i = 0; i < 7; i++) { const card = box(0.28, 0.01, 0.4, cardMat); card.position.set(0.2 + (rnd() - 0.5) * 0.8, 1.69 + i * 0.002, -0.2 + (rnd() - 0.5) * 0.6); card.rotation.y = rnd() * Math.PI; g.add(card); }
  const deck = box(0.28, 0.18, 0.4, cardMat); deck.position.set(-0.6, 1.78, -0.4); g.add(deck);

  // 烛台
  const cs = cyl(0.1, 0.13, 0.12, M.brass, 12); cs.position.set(0.7, 1.72, -0.6); g.add(cs);
  const candle = cyl(0.05, 0.06, 0.4, new THREE.MeshStandardMaterial({ color: 0xf0e4c8, roughness: 0.6 }), 8); candle.position.set(0.7, 1.95, -0.6); g.add(candle);

  castAll(g, true, true);
  scene.add(g);
  contactShadow(scene, g.position.x, g.position.z, 5);

  // 两把弧背椅
  for (const side of [1, -1]) {
    const chair = new THREE.Group();
    chair.position.set(g.position.x + side * 2.0 * Math.cos(0.7), FLOOR_Y, g.position.z - side * 2.0 * Math.sin(0.7));
    chair.rotation.y = -0.7 + (side > 0 ? Math.PI : 0);
    chair.add(setp(box(1.2, 0.4, 1.2, M.velvetRed), 0, 1.4, 0));
    const back = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.4, 16, 1, true, -Math.PI / 2, Math.PI), M.oakDark); back.position.set(0, 2.2, -0.5); chair.add(back);
    for (const [lx, lz] of [[-0.5, 0.5], [0.5, 0.5], [-0.5, -0.5], [0.5, -0.5]]) { const leg = turnedLeg(1.4, 0.09, M.oakDark); leg.position.set(lx, 0, lz); chair.add(leg); }
    castAll(chair, true, true); scene.add(chair);
  }
  return g;
}
function setp(m, x, y, z) { m.position.set(x, y, z); return m; }
