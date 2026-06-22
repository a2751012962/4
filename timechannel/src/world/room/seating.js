/* ============================================================
   起居区：皮质沙发 + 翼背扶手椅 + 脚凳 + 咖啡桌（叠书/茶杯/花瓶）+ 边几台灯
============================================================ */
import * as THREE from 'three';
import { FLOOR_Y, box, cyl, ball, turnedLeg, contactShadow, castAll } from './kit.js';

function cushion(w, h, d, mat) {
  // 用略放大的盒子模拟软垫的圆润
  const m = box(w, h, d, mat);
  m.scale.set(1, 1, 1);
  return m;
}

export function buildSeating(ctx) {
  const { scene, M } = ctx;

  /* 皮质切斯特菲尔德沙发（移到左侧并斜对壁炉，让出从门口到炉火的中央视线走廊） */
  const sofa = new THREE.Group();
  sofa.position.set(-4.8, FLOOR_Y, 4.2); sofa.rotation.y = 0.5;
  const lea = M.leatherOx;
  sofa.add(pos(box(6.2, 0.7, 2.6, lea), 0, 1.1, 0));        // 座基
  sofa.add(pos(box(6.2, 1.6, 0.6, lea), 0, 2.1, -1.0));      // 靠背
  for (const ax of [-3.1, 3.1]) sofa.add(pos(box(0.6, 1.4, 2.6, lea), ax, 1.6, 0)); // 扶手
  // 座垫 ×3
  for (let i = -1; i <= 1; i++) sofa.add(pos(cushion(1.9, 0.5, 2.2, lea), i * 2.0, 1.6, 0.15));
  // 靠背扣纹（纽扣）
  for (let i = -2; i <= 2; i++) for (let j = 0; j < 2; j++) { const btn = ball(0.06, M.brass, 8); sofa.add(pos(btn, i * 1.1, 1.9 + j * 0.5, -0.72)); }
  // 车削木腿
  for (const [lx, lz] of [[-2.8, 1.1], [2.8, 1.1], [-2.8, -1.1], [2.8, -1.1]]) { const leg = turnedLeg(0.7, 0.12, M.oakDark); sofa.add(pos(leg, lx, 0, lz)); }
  castAll(sofa, true, true); scene.add(sofa); contactShadow(scene, -4.8, 4.2, 8);

  /* 翼背扶手椅（侧对壁炉） */
  const chair = new THREE.Group();
  chair.position.set(5.5, FLOOR_Y, 2.5); chair.rotation.y = -0.7;
  const vel = M.velvetGreen;
  chair.add(pos(box(2.4, 0.7, 2.2, vel), 0, 1.0, 0));
  chair.add(pos(cushion(2.0, 0.45, 1.9, vel), 0, 1.45, 0.1));
  chair.add(pos(box(2.4, 2.6, 0.5, vel), 0, 2.1, -0.85));     // 高靠背
  for (const ax of [-1.25, 1.25]) { chair.add(pos(box(0.45, 1.3, 2.2, vel), ax, 1.45, 0)); chair.add(pos(box(0.45, 1.4, 0.5, vel), ax, 2.2, -0.7)); } // 翼
  for (const [lx, lz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) { const leg = turnedLeg(0.6, 0.13, M.oakDark); chair.add(pos(leg, lx, 0, lz)); }
  castAll(chair, true, true); scene.add(chair); contactShadow(scene, 5.5, 2.5, 4.8);

  /* 脚凳 */
  const ott = new THREE.Group(); ott.position.set(4.3, FLOOR_Y, 4.6);
  ott.add(pos(cushion(1.6, 0.7, 1.2, M.velvetGreen), 0, 0.9, 0));
  for (const [lx, lz] of [[-0.6, 0.4], [0.6, 0.4], [-0.6, -0.4], [0.6, -0.4]]) { const leg = turnedLeg(0.5, 0.1, M.oakDark); ott.add(pos(leg, lx, 0, lz)); }
  castAll(ott, true, true); scene.add(ott); contactShadow(scene, 4.3, 4.6, 3);

  /* 咖啡桌 + 桌上物件（跟随沙发移到左侧） */
  const table = new THREE.Group(); table.position.set(-4.4, FLOOR_Y, 6.4); table.rotation.y = 0.4;
  const top = box(3.2, 0.18, 1.8, M.oakLight); top.position.y = 1.2; top.castShadow = true; top.receiveShadow = true; table.add(top);
  // 下层书架板
  const lower = box(3.0, 0.12, 1.6, M.oakMed); lower.position.y = 0.5; table.add(lower);
  for (const [lx, lz] of [[-1.4, 0.7], [1.4, 0.7], [-1.4, -0.7], [1.4, -0.7]]) { const leg = turnedLeg(1.2, 0.1, M.oakDark); table.add(pos(leg, lx, 0, lz)); }
  // 叠书
  const bookCols = ['#6a2e2a', '#2e4a3a', '#3a3a5a'];
  for (let k = 0; k < 3; k++) { const sb = box(1.1, 0.16, 0.8, new THREE.MeshStandardMaterial({ color: bookCols[k], roughness: 0.7 })); sb.position.set(-0.7, 1.37 + k * 0.17, 0.2); sb.rotation.y = k * 0.06; table.add(sb); }
  // 两只茶杯 + 托（"两个人刚坐过"）
  const cupMat = new THREE.MeshStandardMaterial({ color: 0xf0ece0, roughness: 0.5 });
  for (const [cx, cz] of [[0.8, -0.1], [0.3, 0.35]]) {
    const saucer = cyl(0.28, 0.28, 0.04, M.creamShade, 18); saucer.position.set(cx, 1.31, cz); table.add(saucer);
    const cup = cyl(0.16, 0.13, 0.22, cupMat, 16); cup.position.set(cx, 1.42, cz); table.add(cup);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 6, 12), cupMat); handle.position.set(cx + 0.18, 1.45, cz); handle.rotation.y = Math.PI / 2; table.add(handle);
  }
  // 花瓶 + 几支
  const vase = cyl(0.18, 0.12, 0.5, new THREE.MeshStandardMaterial({ color: 0x4a6a6a, roughness: 0.4, metalness: 0.2 }), 16); vase.position.set(0.9, 1.45, 0.5); table.add(vase);
  for (let i = 0; i < 3; i++) { const stem = cyl(0.02, 0.02, 0.8, new THREE.MeshStandardMaterial({ color: 0x3a5a3a }), 6); stem.position.set(0.9 + (i - 1) * 0.08, 1.9, 0.5); stem.rotation.z = (i - 1) * 0.2; table.add(stem); const bud = ball(0.07, new THREE.MeshStandardMaterial({ color: 0xd86a7a, roughness: 0.6 }), 8); bud.position.set(0.9 + (i - 1) * 0.16, 2.3, 0.5); table.add(bud); }
  castAll(table, true, true); scene.add(table); contactShadow(scene, -4.4, 6.4, 4);

  return scene;
}

function pos(m, x, y, z) { m.position.set(x, y, z); return m; }
