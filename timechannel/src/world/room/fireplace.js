/* ============================================================
   壁炉（暖源 + 焦点）：大理石壁炉架 + 燃烧的木柴 + 跳动火焰/余烬 +
   炉档 + 火具 + 炉台上的烛台/座钟/油画 + 那把发光的钥匙（小橡果）
============================================================ */
import * as THREE from 'three';
import { ROOM_H as H, ROOM_D as D, FLOOR_Y, box, cyl, ball, cone, turnedLeg, softSprite, painting, castAll } from './kit.js';

const flameTex = softSprite('rgba(255,236,170,1)', 'rgba(255,110,30,0)', 'flame');
const glowTex = softSprite('rgba(255,225,150,0.9)', 'rgba(255,200,120,0)', 'glow');

export function buildFireplace(ctx) {
  const { scene, M, anim } = ctx;
  const z = -D / 2 + 0.6;
  const g = new THREE.Group(); g.position.set(0, 0, 0);

  // 大理石壁炉架（两根侧柱 + 横楣 + 厚炉台）
  const col = M.stone;
  const left = box(1.0, 6.2, 1.4, col); left.position.set(-3.2, FLOOR_Y + 3.1, z);
  const right = box(1.0, 6.2, 1.4, col); right.position.set(3.2, FLOOR_Y + 3.1, z);
  const lintel = box(7.4, 1.2, 1.5, col); lintel.position.set(0, FLOOR_Y + 5.6, z);
  g.add(left, right, lintel);
  // 炉膛（黑色内壁）
  const fb = new THREE.MeshStandardMaterial({ color: 0x140a06, roughness: 1 });
  const back = box(4.2, 4.4, 0.3, fb); back.position.set(0, FLOOR_Y + 2.6, z - 0.55); g.add(back);
  const sideL = box(0.3, 4.4, 1.2, fb); sideL.position.set(-2.1, FLOOR_Y + 2.6, z); g.add(sideL);
  const sideR = box(0.3, 4.4, 1.2, fb); sideR.position.set(2.1, FLOOR_Y + 2.6, z); g.add(sideR);
  // 厚炉台
  const mantel = box(8.4, 0.6, 1.9, M.oakMed); mantel.position.set(0, FLOOR_Y + 6.4, z + 0.1); mantel.castShadow = true; g.add(mantel);

  // 炉箅 + 木柴堆
  const grate = M.iron;
  for (let i = -1; i <= 1; i++) { const bar = cyl(0.05, 0.05, 2.4, grate, 8); bar.rotation.z = Math.PI / 2; bar.position.set(0, FLOOR_Y + 0.5 + (i + 1) * 0.18, z); g.add(bar); }
  const logMat = new THREE.MeshStandardMaterial({ color: 0x3a2414, roughness: 0.9 });
  const emberLogMat = new THREE.MeshStandardMaterial({ color: 0x6a2e10, emissive: 0xff5a18, emissiveIntensity: 0.8, roughness: 0.8 });
  for (let i = 0; i < 5; i++) {
    const lg = cyl(0.22, 0.22, 2.6, i < 2 ? emberLogMat : logMat, 10);
    lg.rotation.z = Math.PI / 2; lg.rotation.y = (Math.random() - 0.5) * 0.4;
    lg.position.set((Math.random() - 0.5) * 0.8, FLOOR_Y + 0.8 + i * 0.16, z + (Math.random() - 0.5) * 0.4);
    g.add(lg);
  }

  // 火焰（多片加法面 + 光晕）
  const fireMats = [];
  for (let i = 0; i < 4; i++) {
    const fm = new THREE.MeshBasicMaterial({ map: flameTex, color: i < 2 ? 0xffb050 : 0xff7020, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
    const f = new THREE.Mesh(new THREE.PlaneGeometry(1.4 - i * 0.18, 2.2 - i * 0.3), fm);
    f.position.set((i - 1.5) * 0.5, FLOOR_Y + 1.6 + i * 0.1, z + 0.4 + i * 0.05);
    g.add(f); fireMats.push({ mat: fm, mesh: f, base: f.scale.y, ph: i });
  }
  const fglow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff8a3a, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
  fglow.scale.set(6, 5, 1); fglow.position.set(0, FLOOR_Y + 2.0, z + 0.8); g.add(fglow);

  // 余烬上升粒子
  const N = 60, pos = new Float32Array(N * 3), seed = new Float32Array(N);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 2.4; pos[i * 3 + 1] = Math.random() * 3; pos[i * 3 + 2] = z + 0.3 + Math.random() * 0.4; seed[i] = Math.random(); }
  const emberGeo = new THREE.BufferGeometry(); emberGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const embers = new THREE.Points(emberGeo, new THREE.PointsMaterial({ map: glowTex, color: 0xffae5a, size: 0.13, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }));
  g.add(embers);

  // 炉火光源（两盏，闪烁）
  const fl1 = new THREE.PointLight(0xff7a2e, 2.6, 26, 1.8); fl1.position.set(0, FLOOR_Y + 2.2, z + 1.6); g.add(fl1);
  const fl2 = new THREE.PointLight(0xff9a4a, 1.2, 16, 2); fl2.position.set(0, FLOOR_Y + 1.4, z + 3.0); g.add(fl2);
  fl1.userData.base = 2.6; fl2.userData.base = 1.2;

  // 炉档（黄铜矮栏）
  const fender = M.brass;
  const fb1 = box(5.0, 0.5, 0.12, fender); fb1.position.set(0, FLOOR_Y + 0.45, z + 1.2); g.add(fb1);
  const fb2 = box(0.12, 0.5, 2.0, fender); fb2.position.set(-2.5, FLOOR_Y + 0.45, z + 0.4); g.add(fb2);
  const fb3 = box(0.12, 0.5, 2.0, fender); fb3.position.set(2.5, FLOOR_Y + 0.45, z + 0.4); g.add(fb3);
  for (const fx of [-2.5, 2.5]) { const k = ball(0.16, fender, 12); k.position.set(fx, FLOOR_Y + 0.7, z + 1.2); g.add(k); }

  // 火具架（拨火棍/铲/刷）
  const stand = M.iron;
  const post = cyl(0.05, 0.05, 2.2, stand, 8); post.position.set(3.6, FLOOR_Y + 1.1, z + 1.4); g.add(post);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.04, 8, 18), stand); ring.rotation.x = Math.PI / 2; ring.position.set(3.6, FLOOR_Y + 2.1, z + 1.4); g.add(ring);
  for (let i = 0; i < 3; i++) { const tool = cyl(0.03, 0.03, 2.0, stand, 6); tool.position.set(3.6 + (i - 1) * 0.16, FLOOR_Y + 1.2, z + 1.5); tool.rotation.z = (i - 1) * 0.05; g.add(tool); }

  // 炉台上方的大油画 + 画框
  const frameMat = M.brass;
  const pf = new THREE.Group(); pf.position.set(0, FLOOR_Y + 9.0, z - 0.3);
  const pframe = box(5.4, 3.8, 0.2, frameMat); pf.add(pframe);
  const pcanvas = new THREE.Mesh(new THREE.PlaneGeometry(4.9, 3.3), new THREE.MeshBasicMaterial({ map: painting(0) })); pcanvas.position.z = 0.12; pf.add(pcanvas);
  const plight = new THREE.PointLight(0xffe2ac, 0.5, 8, 2); plight.position.set(0, FLOOR_Y + 11.0, z + 1.0); pf.add(plight);
  g.add(pf);

  // 炉台烛台（两座，带跳动烛火）
  const candleAnims = [];
  for (const cx of [-3.3, 3.3]) {
    const stand2 = cyl(0.16, 0.22, 0.2, M.brass, 14); stand2.position.set(cx, FLOOR_Y + 6.8, z + 0.1); g.add(stand2);
    const stem = cyl(0.05, 0.06, 0.5, M.brass, 10); stem.position.set(cx, FLOOR_Y + 7.05, z + 0.1); g.add(stem);
    const candle = cyl(0.1, 0.11, 0.7, new THREE.MeshStandardMaterial({ color: 0xf0e4c8, roughness: 0.6 }), 12); candle.position.set(cx, FLOOR_Y + 7.5, z + 0.1); g.add(candle);
    const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
    fl.scale.set(0.4, 0.7, 1); fl.position.set(cx, FLOOR_Y + 8.0, z + 0.1); g.add(fl);
    const cl = new THREE.PointLight(0xffcf7a, 0.6, 7, 2); cl.position.copy(fl.position); g.add(cl); cl.userData.base = 0.6;
    candleAnims.push({ fl, cl });
  }

  // 炉台座钟
  const clock = new THREE.Group(); clock.position.set(1.6, FLOOR_Y + 7.2, z + 0.1);
  clock.add(box(0.9, 1.0, 0.4, M.oakDark));
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.32, 24), new THREE.MeshStandardMaterial({ color: 0xf0e6cc, roughness: 0.6 })); face.position.z = 0.21; clock.add(face);
  const hourHand = box(0.04, 0.2, 0.02, M.iron); hourHand.position.set(0, 0.08, 0.23); clock.add(hourHand);
  const minHand = box(0.03, 0.3, 0.02, M.iron); minHand.position.set(0, 0.1, 0.23); clock.add(minHand);
  g.add(clock);

  // ★ 钥匙：壁炉台中央的发光小橡果
  const toy = new THREE.Group(); toy.position.set(-1.3, FLOOR_Y + 6.95, z + 0.2);
  const tbody = ball(0.28, new THREE.MeshStandardMaterial({ color: 0xd9a24a, emissive: 0xffcf7a, emissiveIntensity: 0.9, roughness: 0.42, metalness: 0.12 }), 24);
  const tcap = cone(0.24, 0.24, new THREE.MeshStandardMaterial({ color: 0x7a4a22, emissive: 0x6a3a18, emissiveIntensity: 0.4, roughness: 0.7 }), 18); tcap.position.y = 0.3;
  toy.add(tbody, tcap);
  const tglow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd98a, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
  tglow.scale.set(2.0, 2.0, 1); toy.add(tglow);
  toy.userData.body = tbody;
  g.add(toy);
  ctx.toy = toy; ctx.toyGlow = tglow;

  castAll(g, true, false);
  scene.add(g);

  // 动画
  const ePos = emberGeo.attributes.position.array;
  anim.push((dt, t) => {
    const flick = 0.72 + Math.sin(t * 11) * 0.16 + Math.sin(t * 23.7) * 0.1 + Math.sin(t * 41) * 0.05;
    fl1.intensity = fl1.userData.base * flick;
    fl2.intensity = fl2.userData.base * (0.8 + flick * 0.4);
    fglow.material.opacity = 0.6 + flick * 0.3;
    for (const f of fireMats) {
      f.mat.opacity = 0.6 + flick * 0.35;
      f.mesh.scale.y = (0.9 + Math.sin(t * 9 + f.ph) * 0.12) * (0.85 + flick * 0.2);
      f.mesh.scale.x = 0.9 + Math.sin(t * 7 + f.ph * 2) * 0.08;
    }
    for (const { fl, cl } of candleAnims) {
      const cf = 0.8 + Math.sin(t * 13 + fl.position.x) * 0.18 + Math.sin(t * 27) * 0.08;
      fl.material.opacity = 0.7 + cf * 0.3; fl.scale.set(0.32 + cf * 0.12, 0.6 + cf * 0.18, 1);
      cl.intensity = cl.userData.base * cf;
    }
    // 余烬上升
    for (let i = 0; i < N; i++) {
      ePos[i * 3 + 1] += dt * (0.6 + seed[i] * 0.8);
      ePos[i * 3] += Math.sin(t * 2 + i) * dt * 0.1;
      if (ePos[i * 3 + 1] > 3.6) { ePos[i * 3 + 1] = 0.2; ePos[i * 3] = (Math.random() - 0.5) * 2.0; }
    }
    emberGeo.attributes.position.needsUpdate = true;
    // 时钟
    minHand.rotation.z = -t * 0.4; hourHand.rotation.z = -t * 0.033;
  });

  return g;
}
