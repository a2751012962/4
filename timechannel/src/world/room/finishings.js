/* ============================================================
   收尾装饰：地面镶花边框 + 中央地花 + 走廊矮栏(balustrade) + 两盏角落小吊灯 +
   桌上方垂吊灯 + 散落抱枕/毛毯。把房间最后填满、点亮、铺暖。
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_H as H, ROOM_D as D, FLOOR_Y, box, cyl, ball, turnedLeg, softSprite, castAll, mulberry } from './kit.js';

const flameTex = softSprite('rgba(255,236,170,1)', 'rgba(255,110,30,0)', 'flame');

export function buildFinishings(ctx) {
  const { scene, M, anim } = ctx;
  const rnd = mulberry(2718);
  const flames = [];

  /* 地面镶花边框（沿房间四周一圈深色木条 + 角花） */
  (() => {
    const inset = 2.0, y = FLOOR_Y + 0.05;
    const borderMat = new THREE.MeshStandardMaterial({ color: 0x3a2412, roughness: 0.6, metalness: 0.05, envMapIntensity: 0.5 });
    const accentMat = M.brass;
    for (const [w, d, x, z] of [[W - inset * 2, 0.3, 0, -D / 2 + inset], [W - inset * 2, 0.3, 0, D / 2 - inset], [0.3, D - inset * 2, -W / 2 + inset, 0], [0.3, D - inset * 2, W / 2 - inset, 0]]) {
      const strip = box(w, 0.04, d, borderMat); strip.position.set(x, y, z); strip.receiveShadow = true; scene.add(strip);
      const strip2 = box(w ? w + 0.6 : 0.12, 0.045, d ? d + 0.6 : 0.12, accentMat); strip2.position.set(x, y - 0.005, z); scene.add(strip2);
    }
    // 角花
    for (const [cx, cz] of [[-W / 2 + inset, -D / 2 + inset], [W / 2 - inset, -D / 2 + inset], [-W / 2 + inset, D / 2 - inset], [W / 2 - inset, D / 2 - inset]]) {
      const rose = new THREE.Mesh(new THREE.CircleGeometry(0.8, 16), accentMat); rose.rotation.x = -Math.PI / 2; rose.position.set(cx, y + 0.001, cz); scene.add(rose);
    }
  })();

  /* 走廊矮栏：在沙发后方做一道装饰性低栏杆分区 */
  (() => {
    const g = new THREE.Group(); g.position.set(-1, FLOOR_Y, -2.5);
    const railLen = 12;
    const topRail = box(railLen, 0.2, 0.3, M.oakDark); topRail.position.y = 2.2; g.add(topRail);
    const botRail = box(railLen, 0.2, 0.3, M.oakDark); botRail.position.y = 0.3; g.add(botRail);
    for (const ex of [-railLen / 2, railLen / 2]) { const post = box(0.4, 2.4, 0.4, M.oakDark); post.position.set(ex, 1.2, 0); g.add(post); const cap = ball(0.26, M.brass, 12); cap.position.set(ex, 2.4, 0); g.add(cap); }
    const n = Math.floor(railLen / 0.5);
    for (let i = 1; i < n; i++) { const bal = turnedLeg(1.8, 0.1, M.oakMed); bal.position.set(-railLen / 2 + i * 0.5, 0.4, 0); g.add(bal); }
    castAll(g, true, true); scene.add(g);
  })();

  /* 两盏角落小吊灯（emissive，无新增实时光） */
  for (const [x, z] of [[-9, 9], [9, -9]]) {
    const ch = new THREE.Group(); ch.position.set(x, H / 2 - 2.0, z);
    const chain = cyl(0.04, 0.04, 1.6, M.brass, 6); chain.position.y = 0.8; ch.add(chain);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.05, 8, 20), M.brass); ring.rotation.x = Math.PI / 2; ch.add(ring);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const candle = cyl(0.05, 0.06, 0.3, new THREE.MeshStandardMaterial({ color: 0xf0e4c8, roughness: 0.6 }), 8); candle.position.set(Math.cos(a) * 0.7, 0.15, Math.sin(a) * 0.7); ch.add(candle);
      const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
      fl.scale.set(0.2, 0.36, 1); fl.position.set(Math.cos(a) * 0.7, 0.4, Math.sin(a) * 0.7); ch.add(fl); flames.push(fl);
    }
    castAll(ch, false, false); scene.add(ch);
  }

  /* 餐桌上方垂吊灯 */
  (() => {
    const ch = new THREE.Group(); ch.position.set(-8.5, H / 2 - 2.6, 4);
    const rod = cyl(0.04, 0.04, 2.2, M.brass, 6); rod.position.y = 1.1; ch.add(rod);
    const shade = new THREE.Mesh(new THREE.SphereGeometry(0.8, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x7a4a22, emissive: 0xffb060, emissiveIntensity: 0.5, side: THREE.DoubleSide, roughness: 0.5 }));
    shade.position.y = 0; shade.rotation.x = Math.PI; ch.add(shade);
    const bulb = ball(0.2, new THREE.MeshBasicMaterial({ color: 0xfff0d0 }), 12); bulb.position.y = -0.2; ch.add(bulb);
    scene.add(ch);
  })();

  /* 散落抱枕/折叠毛毯 */
  const pillows = [[-2.5, 4.0], [0.6, 4.2], [5.3, 2.2]];
  for (const [x, z] of pillows) { const pil = box(1.0, 0.7, 0.4, rnd() < 0.5 ? M.velvetRed : M.velvetGreen); pil.position.set(x, FLOOR_Y + 1.9, z); pil.rotation.set((rnd() - 0.5) * 0.3, rnd() * 6, (rnd() - 0.5) * 0.3); pil.castShadow = true; scene.add(pil); }
  const blanket = box(2.0, 0.16, 1.6, new THREE.MeshStandardMaterial({ color: 0x8a6a3a, roughness: 0.95 })); blanket.position.set(4.4, FLOOR_Y + 1.7, 4.6); blanket.rotation.y = 0.3; blanket.castShadow = true; scene.add(blanket);

  anim.push((dt, t) => { for (let i = 0; i < flames.length; i++) { const fl = flames[i]; const cf = 0.8 + Math.sin(t * 12 + i * 1.5) * 0.18; fl.material.opacity = 0.65 + cf * 0.3; fl.scale.set(0.18 + cf * 0.06, 0.32 + cf * 0.12, 1); } });
  return scene;
}
