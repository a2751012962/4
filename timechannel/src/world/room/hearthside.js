/* ============================================================
   炉边什物：劈柴篮(满载木柴) + 黄铜柴架(andirons) + 风箱 + 煤斗 + 火炉刷 +
   炉前蜷睡的小狗（与橘猫作伴），呼吸起伏
============================================================ */
import * as THREE from 'three';
import { ROOM_D as D, FLOOR_Y, box, cyl, ball, cone, contactShadow, castAll, mulberry } from './kit.js';

export function buildHearthside(ctx) {
  const { scene, M, anim } = ctx;
  const rnd = mulberry(99);
  const z = -D / 2 + 3.5;

  /* 劈柴篮 */
  (() => {
    const g = new THREE.Group(); g.position.set(-5, FLOOR_Y, z);
    const basket = cyl(0.7, 0.55, 1.0, new THREE.MeshStandardMaterial({ color: 0x6a4a28, roughness: 0.85 }), 18, true); basket.position.y = 0.5; g.add(basket);
    for (let r = 0; r < 3; r++) { const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.62 + r * 0.04, 0.03, 6, 18), new THREE.MeshStandardMaterial({ color: 0x4a3018, roughness: 0.8 })); hoop.rotation.x = Math.PI / 2; hoop.position.y = 0.2 + r * 0.35; g.add(hoop); }
    const logMat = new THREE.MeshStandardMaterial({ color: 0x5a3a1e, roughness: 0.9 });
    const logEnd = new THREE.MeshStandardMaterial({ color: 0xc8a878, roughness: 0.8 });
    for (let i = 0; i < 8; i++) { const lg = cyl(0.12, 0.12, 1.1, [logMat, logEnd, logMat][i % 3], 8); lg.rotation.z = Math.PI / 2; lg.rotation.y = (rnd() - 0.5) * 0.5; lg.position.set((rnd() - 0.5) * 0.5, 0.9 + (rnd() - 0.5) * 0.3, (rnd() - 0.5) * 0.5); g.add(lg); }
    castAll(g, true, true); scene.add(g); contactShadow(scene, -5, z, 2.4);
  })();

  /* 黄铜柴架 andirons（炉膛内两侧） */
  for (const sx of [-1.2, 1.2]) {
    const a = new THREE.Group(); a.position.set(sx, FLOOR_Y, -D / 2 + 1.6);
    const post = cyl(0.08, 0.1, 1.2, M.brass, 12); post.position.y = 0.6; a.add(post);
    const ballTop = ball(0.14, M.brass, 12); ballTop.position.y = 1.25; a.add(ballTop);
    const barH = box(0.1, 0.1, 1.4, M.iron); barH.position.set(0, 0.2, 0.6); a.add(barH);
    castAll(a, true, false); scene.add(a);
  }

  /* 风箱 */
  (() => {
    const g = new THREE.Group(); g.position.set(-6.4, FLOOR_Y + 0.1, z + 1); g.rotation.z = -0.4; g.rotation.y = 0.6;
    const top = box(0.7, 0.06, 1.1, M.oakDark); top.position.y = 0.2; g.add(top);
    const bot = box(0.7, 0.06, 1.1, M.oakDark); bot.position.y = 0.0; g.add(bot);
    const bag = box(0.6, 0.18, 0.9, M.leatherOx); bag.position.y = 0.1; g.add(bag);
    const nozzle = cyl(0.04, 0.06, 0.5, M.brass, 8); nozzle.rotation.z = Math.PI / 2; nozzle.position.set(0.55, 0.1, 0); g.add(nozzle);
    const handle1 = box(0.1, 0.1, 0.7, M.oakDark); handle1.position.set(-0.45, 0.28, 0); g.add(handle1);
    castAll(g, true, true); scene.add(g);
  })();

  /* 煤斗 + 火炉刷/铲（靠侧柱） */
  (() => {
    const g = new THREE.Group(); g.position.set(5.5, FLOOR_Y, z + 0.5);
    const scuttle = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.3, 0.7, 16, 1, false, 0, Math.PI * 1.6), M.brass); scuttle.position.y = 0.5; scuttle.rotation.y = 1; g.add(scuttle);
    const foot = cyl(0.2, 0.3, 0.2, M.brass, 12); foot.position.y = 0.1; g.add(foot);
    // 煤块
    for (let i = 0; i < 6; i++) { const coal = ball(0.08 + rnd() * 0.05, new THREE.MeshStandardMaterial({ color: 0x14140f, roughness: 0.6, metalness: 0.2 }), 8); coal.position.set((rnd() - 0.5) * 0.4, 0.7, (rnd() - 0.5) * 0.4); g.add(coal); }
    castAll(g, true, true); scene.add(g); contactShadow(scene, 5.5, z + 0.5, 2);
  })();

  /* 炉前蜷睡的小狗 */
  (() => {
    const fur = new THREE.MeshStandardMaterial({ color: 0x6a4a2a, roughness: 0.9, envMapIntensity: 0.2 });
    const furL = new THREE.MeshStandardMaterial({ color: 0x9a7a4a, roughness: 0.9 });
    const g = new THREE.Group(); g.position.set(-2.5, FLOOR_Y + 0.05, -D / 2 + 5); g.rotation.y = 0.9;
    const body = ball(0.85, fur, 18); body.scale.set(1.4, 0.6, 0.95); body.position.y = 0.5; g.add(body);
    const head = new THREE.Group(); head.position.set(0.95, 0.45, 0.2);
    const skull = ball(0.4, fur, 16); skull.scale.set(1.1, 0.9, 1); head.add(skull);
    const snout = ball(0.22, furL, 12); snout.scale.set(1.4, 0.8, 0.8); snout.position.set(0.35, -0.1, 0); head.add(snout);
    const nose = ball(0.07, new THREE.MeshStandardMaterial({ color: 0x1a1410 }), 8); nose.position.set(0.56, -0.06, 0); head.add(nose);
    for (const sx of [-0.18, 0.2]) { const ear = ball(0.18, fur, 10); ear.scale.set(0.5, 1.0, 0.3); ear.position.set(-0.1, 0.1, sx); ear.rotation.z = -0.5; head.add(ear); }
    g.add(head);
    const tail = new THREE.Group(); tail.position.set(-1.0, 0.5, 0.2);
    for (let i = 0; i < 6; i++) { const seg = ball(0.14 - i * 0.014, fur, 8); const a = i * 0.55; seg.position.set(Math.cos(a) * 0.4, Math.sin(a) * 0.2, Math.sin(a) * 0.4); tail.add(seg); }
    g.add(tail);
    g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    scene.add(g);
    anim.push((dt, t) => { const breath = 1 + Math.sin(t * 1.3 + 1) * 0.05; body.scale.set(1.4, 0.6 * breath, 0.95); tail.rotation.z = Math.sin(t * 0.9) * 0.12; });
  })();

  return scene;
}
