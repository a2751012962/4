/* ============================================================
   补充陈设：鎏金大镜 + 茶车 + 衣帽架 + 伞架 + 鸟笼 + 壁炉挡屏 + 气压计 +
   一墙小挂钟 + 脚凳 + 杂志架。让房间真正"住满"。
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_H as H, ROOM_D as D, FLOOR_Y, box, cyl, ball, cone, turnedLeg, contactShadow, castAll, mulberry } from './kit.js';

export function buildExtras(ctx) {
  const { scene, M, anim } = ctx;
  const rnd = mulberry(2024);

  /* 鎏金大镜（长墙），用低粗糙金属面反射环境贴图模拟镜面 */
  (() => {
    const g = new THREE.Group(); g.position.set(W / 2 - 0.25, FLOOR_Y + 5.5, -8); g.rotation.y = -Math.PI / 2;
    const ornate = new THREE.MeshStandardMaterial({ color: 0xc7a24a, roughness: 0.3, metalness: 0.9, envMapIntensity: 1.2 });
    const frame = box(3.2, 5.0, 0.3, ornate); g.add(frame);
    // 镜面（反射环境）
    const mirror = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 4.4), new THREE.MeshStandardMaterial({ color: 0xb8c0c4, roughness: 0.04, metalness: 1.0, envMapIntensity: 1.6 }));
    mirror.position.z = 0.16; g.add(mirror);
    // 顶部卷涡
    const crest = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.12, 10, 20, Math.PI), ornate); crest.position.set(0, 2.7, 0.1); g.add(crest);
    castAll(g, true, false); scene.add(g);
  })();

  /* 茶车（三层小推车） */
  (() => {
    const g = new THREE.Group(); g.position.set(2, FLOOR_Y, 9); g.rotation.y = 0.4;
    for (const [lx, lz] of [[-0.9, 0.5], [0.9, 0.5], [-0.9, -0.5], [0.9, -0.5]]) { const post = cyl(0.04, 0.04, 1.8, M.brass, 8); post.position.set(lx, 0.9, lz); g.add(post); const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.035, 8, 12), M.iron); wheel.position.set(lx, 0.1, lz); g.add(wheel); }
    for (const y of [0.5, 1.2, 1.8]) { const shelf = box(2.0, 0.05, 1.2, M.oakLight); shelf.position.y = y; g.add(shelf); }
    // 茶具上层
    const pot = ball(0.22, M.silver, 16); pot.scale.set(1.2, 0.9, 1); pot.position.set(0, 2.05, 0); g.add(pot);
    const spout = cyl(0.04, 0.06, 0.3, M.silver, 8); spout.position.set(0.3, 2.06, 0); spout.rotation.z = -0.7; g.add(spout);
    for (let i = 0; i < 3; i++) { const cupSauce = cyl(0.13, 0.13, 0.03, M.porcelainMat, 14); cupSauce.position.set(-0.6 + i * 0.5, 1.84, 0.3); g.add(cupSauce); const cup = cyl(0.08, 0.07, 0.1, M.porcelainMat, 12); cup.position.set(-0.6 + i * 0.5, 1.9, 0.3); g.add(cup); }
    // 中层蛋糕架
    const tier = cyl(0.04, 0.04, 0.5, M.silver, 8); tier.position.set(0, 1.45, -0.2); g.add(tier);
    for (const [ry, rr] of [[1.25, 0.32], [1.55, 0.22]]) { const plate = cyl(rr, rr, 0.03, M.porcelainMat, 16); plate.position.set(0, ry, -0.2); g.add(plate); }
    castAll(g, true, true); scene.add(g); contactShadow(scene, 2, 9, 4);
  })();

  /* 衣帽架 + 帽子 */
  (() => {
    const g = new THREE.Group(); g.position.set(W / 2 - 2, FLOOR_Y, D / 2 - 2);
    const pole = cyl(0.06, 0.08, 5.2, M.oakDark, 10); pole.position.y = 2.6; g.add(pole);
    const footG = cyl(0.5, 0.6, 0.2, M.oakDark, 14); footG.position.y = 0.1; g.add(footG);
    for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2; const hook = cyl(0.03, 0.03, 0.5, M.brass, 6); hook.position.set(Math.cos(a) * 0.3, 4.8, Math.sin(a) * 0.3); hook.rotation.z = Math.cos(a) * 0.8; hook.rotation.x = -Math.sin(a) * 0.8; g.add(hook); }
    // 礼帽
    const hatBrim = cyl(0.4, 0.4, 0.04, new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 0.8 }), 16); hatBrim.position.set(0.35, 4.6, 0); g.add(hatBrim);
    const hatTop = cyl(0.26, 0.26, 0.4, new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 0.8 }), 16); hatTop.position.set(0.35, 4.8, 0); g.add(hatTop);
    // 围巾
    const scarf = box(0.2, 1.4, 0.06, M.velvetRed); scarf.position.set(-0.3, 4.0, 0); scarf.rotation.z = 0.1; g.add(scarf);
    castAll(g, true, true); scene.add(g); contactShadow(scene, W / 2 - 2, D / 2 - 2, 2);
  })();

  /* 伞架 + 伞 */
  (() => {
    const g = new THREE.Group(); g.position.set(W / 2 - 3.4, FLOOR_Y, D / 2 - 2);
    const stand = cyl(0.35, 0.4, 1.2, M.iron, 14); stand.position.y = 0.6; g.add(stand);
    const colors = [0x3a2a4a, 0x2a3a4a, 0x4a2a2a];
    for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; const umb = cyl(0.04, 0.05, 2.2, new THREE.MeshStandardMaterial({ color: colors[i], roughness: 0.8 }), 8); umb.position.set(Math.cos(a) * 0.12, 1.4, Math.sin(a) * 0.12); umb.rotation.z = Math.cos(a) * 0.15; umb.rotation.x = -Math.sin(a) * 0.15; g.add(umb); const handle = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 6, 10, Math.PI), M.oakDark); handle.position.set(Math.cos(a) * 0.12, 2.5, Math.sin(a) * 0.12); g.add(handle); }
    castAll(g, true, true); scene.add(g);
  })();

  /* 鸟笼（落地架）+ 小鸟 */
  (() => {
    const g = new THREE.Group(); g.position.set(W / 2 - 5, FLOOR_Y, D / 2 - 4);
    const pole = cyl(0.05, 0.07, 4.0, M.brass, 10); pole.position.y = 2.0; g.add(pole);
    const footB = cyl(0.4, 0.5, 0.2, M.brass, 14); footB.position.y = 0.1; g.add(footB);
    const cageY = 4.4;
    const ringTop = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.03, 8, 20), M.brass); ringTop.rotation.x = Math.PI / 2; ringTop.position.y = cageY + 0.8; g.add(ringTop);
    const ringBot = ringTop.clone(); ringBot.position.y = cageY - 0.8; g.add(ringBot);
    const floorB = cyl(0.55, 0.55, 0.1, M.oakDark, 18); floorB.position.y = cageY - 0.8; g.add(floorB);
    for (let i = 0; i < 14; i++) { const a = (i / 14) * Math.PI * 2; const bar = cyl(0.012, 0.012, 1.6, M.brass, 4); bar.position.set(Math.cos(a) * 0.55, cageY, Math.sin(a) * 0.55); g.add(bar); }
    const dome = ball(0.55, M.brass, 12, 0); dome.scale.set(1, 0.5, 1); dome.position.y = cageY + 0.8; // 顶
    const domeMesh = new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xb08a3a, metalness: 0.9, roughness: 0.3, wireframe: true })); domeMesh.position.y = cageY + 0.8; g.add(domeMesh);
    // 小鸟
    const bird = new THREE.Group(); bird.position.set(0, cageY - 0.5, 0);
    const bbody = ball(0.12, new THREE.MeshStandardMaterial({ color: 0xf0c030, roughness: 0.7 }), 12); bbody.scale.set(1, 1.2, 1); bird.add(bbody);
    const bhead = ball(0.07, new THREE.MeshStandardMaterial({ color: 0xf0c030, roughness: 0.7 }), 10); bhead.position.set(0, 0.16, 0.05); bird.add(bhead);
    const beak = cone(0.03, 0.08, new THREE.MeshStandardMaterial({ color: 0xe07020 }), 6); beak.position.set(0, 0.16, 0.12); beak.rotation.x = Math.PI / 2; bird.add(beak);
    g.add(bird);
    castAll(g, true, false); scene.add(g);
    anim.push((dt, t) => { bird.position.y = cageY - 0.5 + Math.abs(Math.sin(t * 1.3)) * 0.08; bird.rotation.y = Math.sin(t * 0.7) * 0.5; });
  })();

  /* 壁炉挡屏（黄铜网） */
  (() => {
    const g = new THREE.Group(); g.position.set(0, FLOOR_Y, -D / 2 + 2.2);
    const mesh = box(3.0, 2.0, 0.05, new THREE.MeshStandardMaterial({ color: 0x8a6a2a, metalness: 0.8, roughness: 0.4, transparent: true, opacity: 0.6, wireframe: true }));
    mesh.position.y = 1.2; g.add(mesh);
    for (const sx of [-1.5, 1.5]) { const ftL = box(0.3, 0.1, 0.5, M.brass); ftL.position.set(sx, 0.05, 0); g.add(ftL); const post = cyl(0.03, 0.03, 2.0, M.brass, 8); post.position.set(sx, 1.0, 0); g.add(post); }
    castAll(g, true, false); scene.add(g);
  })();

  /* 气压计（圆盘挂墙） */
  (() => {
    const g = new THREE.Group(); g.position.set(-W / 2 + 0.3, FLOOR_Y + 6.5, -3); g.rotation.y = Math.PI / 2;
    const wood = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.2, 24), M.oakDark); wood.rotation.x = Math.PI / 2; g.add(wood);
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.5, 28), new THREE.MeshStandardMaterial({ color: 0xf0e6cc, roughness: 0.6 })); face.position.z = 0.11; g.add(face);
    const needle = box(0.03, 0.4, 0.02, M.iron); needle.position.set(0, 0.1, 0.13); needle.rotation.z = 0.6; g.add(needle);
    castAll(g, true, false); scene.add(g);
  })();

  /* 一墙小挂钟（后墙上方一排，指针各异、走动） */
  (() => {
    const clocks = [];
    for (let i = 0; i < 6; i++) {
      const g = new THREE.Group(); g.position.set(-9 + i * 2.2, FLOOR_Y + 10.2, -D / 2 + 0.25);
      const wood = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.18, 20), M.oakDark); wood.rotation.x = Math.PI / 2; g.add(wood);
      const face = new THREE.Mesh(new THREE.CircleGeometry(0.4, 24), new THREE.MeshStandardMaterial({ color: 0xf2e8cc, roughness: 0.6 })); face.position.z = 0.1; g.add(face);
      const hh = box(0.03, 0.18, 0.02, M.iron); hh.position.set(0, 0.05, 0.12); g.add(hh);
      const mh = box(0.022, 0.28, 0.02, M.iron); mh.position.set(0, 0.08, 0.12); g.add(mh);
      castAll(g, true, false); scene.add(g);
      clocks.push({ hh, mh, sp: 0.3 + i * 0.12 });
    }
    anim.push((dt, t) => { for (const c of clocks) { c.mh.rotation.z = -t * c.sp; c.hh.rotation.z = -t * c.sp / 12; } });
  })();

  /* 脚凳 + 杂志架（沙发旁） */
  (() => {
    const stool = new THREE.Group(); stool.position.set(-3.5, FLOOR_Y, 7.5);
    stool.add(setp(cyl(0.5, 0.5, 0.3, M.leatherOx, 18), 0, 0.9, 0));
    for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2; const leg = turnedLeg(0.75, 0.07, M.oakDark); leg.position.set(Math.cos(a) * 0.3, 0, Math.sin(a) * 0.3); stool.add(leg); }
    castAll(stool, true, true); scene.add(stool);

    const rack = new THREE.Group(); rack.position.set(2.5, FLOOR_Y, 7.5);
    for (const sx of [-0.5, 0.5]) { const side = box(0.06, 1.0, 0.8, M.oakDark); side.position.set(sx, 0.6, 0); rack.add(side); }
    const bottom = box(1.0, 0.06, 0.8, M.oakDark); bottom.position.y = 0.2; rack.add(bottom);
    for (let i = 0; i < 5; i++) { const mag = box(0.84, 0.02, 0.6, new THREE.MeshStandardMaterial({ color: ['#8a4a3a', '#3a5a6a', '#6a6a3a', '#5a3a5a', '#3a6a4a'][i], roughness: 0.8 })); mag.position.set(0, 0.26 + i * 0.04, 0); mag.rotation.x = (i - 2) * 0.08; rack.add(mag); }
    castAll(rack, true, true); scene.add(rack);
  })();

  return scene;
}
function setp(m, x, y, z) { m.position.set(x, y, z); return m; }
