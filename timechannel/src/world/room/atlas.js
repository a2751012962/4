/* ============================================================
   书斋细节：斜面读经台(摊开的大地图册) + 地面叠书堆 + 一只搁脚凳 + 文件筒
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_D as D, FLOOR_Y, box, cyl, ball, turnedLeg, contactShadow, castAll, mulberry } from './kit.js';
import { worldMap, sheetMusic } from './kit2.js';

export function buildAtlas(ctx) {
  const { scene, M } = ctx;
  const rnd = mulberry(909);

  /* 读经台 + 摊开的地图册 */
  const g = new THREE.Group(); g.position.set(3, FLOOR_Y, -5); g.rotation.y = -0.3;
  const post = cyl(0.12, 0.16, 3.0, M.oakDark, 12); post.position.y = 1.5; g.add(post);
  const tripod = new THREE.Group();
  for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; const foot = box(0.16, 0.16, 1.2, M.oakDark); foot.position.set(Math.cos(a) * 0.4, 0.15, Math.sin(a) * 0.4); foot.rotation.y = -a; g.add(foot); }
  // 斜面台板
  const slope = box(2.4, 1.8, 0.12, M.oakMed); slope.position.set(0, 3.0, 0); slope.rotation.x = -0.7; g.add(slope);
  const ledge = box(2.4, 0.12, 0.18, M.oakDark); ledge.position.set(0, 2.4, 0.5); g.add(ledge);
  // 摊开的两页地图册
  for (const side of [-1, 1]) { const page = box(1.05, 1.6, 0.04, new THREE.MeshBasicMaterial({ map: side < 0 ? worldMap() : sheetMusic() })); page.position.set(side * 0.55, 3.05, 0.07); page.rotation.x = -0.7; page.rotation.z = side * 0.02; g.add(page); }
  const spine = box(0.12, 1.6, 0.16, M.leatherOx); spine.position.set(0, 3.0, 0.04); spine.rotation.x = -0.7; g.add(spine);
  castAll(g, true, true); scene.add(g); contactShadow(scene, 3, -5, 3.5);

  /* 地面书堆数处 */
  for (const [sx, sz] of [[5, -6], [-11, -2], [12, 2], [-2, -11], [6, 11]]) {
    const n = 4 + (rnd() * 5 | 0);
    let yy = 0;
    for (let k = 0; k < n; k++) { const wB = 0.9 + rnd() * 0.4, dB = 0.66 + rnd() * 0.2, hB = 0.16 + rnd() * 0.06; const b = box(wB, hB, dB, new THREE.MeshStandardMaterial({ color: ['#5a2a2a', '#2a4a3a', '#3a3a5a', '#5a4a2a', '#4a2a4a', '#2a4a4a'][(rnd() * 6 | 0)], roughness: 0.72, envMapIntensity: 0.3 })); b.position.set(sx + (rnd() - 0.5) * 0.2, FLOOR_Y + yy + hB / 2, sz + (rnd() - 0.5) * 0.2); b.rotation.y = rnd() * 0.5; b.castShadow = true; b.receiveShadow = true; scene.add(b); yy += hB; }
    contactShadow(scene, sx, sz, 2.4);
  }

  /* 文件筒（竖放卷轴） */
  const can = new THREE.Group(); can.position.set(W / 2 - 6, FLOOR_Y, 13);
  const tube = cyl(0.4, 0.42, 2.4, M.brass, 16); tube.position.y = 1.2; can.add(tube);
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; const scroll = cyl(0.07, 0.07, 2.0, new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.8 }), 8); scroll.position.set(Math.cos(a) * 0.18, 2.2, Math.sin(a) * 0.18); scroll.rotation.z = Math.cos(a) * 0.1; can.add(scroll); }
  castAll(can, true, true); scene.add(can);

  return scene;
}
