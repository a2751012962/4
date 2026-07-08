/* ============================================================
   立式烛台(torchère) ×2 + 一排墙面壁烛：全部用 emissive 火苗 sprite，
   不新增实时光源（靠 bloom 发光），均匀点亮房间四周
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_H as H, ROOM_D as D, FLOOR_Y, box, cyl, ball, softSprite, castAll } from './kit.js';

const flameTex = softSprite('rgba(255,236,170,1)', 'rgba(255,110,30,0)', 'flame');

function torchere(M) {
  const g = new THREE.Group();
  const base = cyl(0.5, 0.6, 0.3, M.brass, 18); base.position.y = 0.15; g.add(base);
  const stem = cyl(0.07, 0.1, 4.6, M.brass, 12); stem.position.y = 2.5; g.add(stem);
  // 中部装饰球结
  for (const yy of [1.4, 2.6, 3.8]) { const knot = ball(0.16, M.brass, 12); knot.position.y = yy; g.add(knot); }
  const bowl = cyl(0.5, 0.2, 0.3, M.brass, 18); bowl.position.y = 4.8; g.add(bowl);
  const flames = [];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const candle = cyl(0.05, 0.06, 0.4, new THREE.MeshStandardMaterial({ color: 0xf0e4c8, roughness: 0.6 }), 8); candle.position.set(Math.cos(a) * 0.22, 5.1, Math.sin(a) * 0.22); g.add(candle);
    const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
    fl.scale.set(0.22, 0.4, 1); fl.position.set(Math.cos(a) * 0.22, 5.4, Math.sin(a) * 0.22); g.add(fl); flames.push(fl);
  }
  g.userData.flames = flames;
  return g;
}

function wallSconce(M) {
  const g = new THREE.Group();
  const plate = box(0.3, 0.6, 0.12, M.brass); g.add(plate);
  const arm = cyl(0.04, 0.04, 0.6, M.brass, 8); arm.rotation.x = Math.PI / 2.4; arm.position.set(0, 0.0, 0.3); g.add(arm);
  const cup = cyl(0.12, 0.08, 0.16, M.brass, 12); cup.position.set(0, 0.22, 0.55); g.add(cup);
  const candle = cyl(0.05, 0.06, 0.3, new THREE.MeshStandardMaterial({ color: 0xf0e4c8, roughness: 0.6 }), 8); candle.position.set(0, 0.42, 0.55); g.add(candle);
  const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
  fl.scale.set(0.2, 0.36, 1); fl.position.set(0, 0.66, 0.55); g.add(fl);
  g.userData.flames = [fl];
  return g;
}

export function buildTorcheres(ctx) {
  const { scene, M, anim } = ctx;
  const allFlames = [];

  // 两座落地烛台（壁炉两侧）
  for (const x of [-6, 6]) {
    const t = torchere(M); t.position.set(x, FLOOR_Y, -D / 2 + 3.5);
    castAll(t, true, false); scene.add(t); allFlames.push(...t.userData.flames);
  }

  // 沿长墙的一排壁烛
  const sconceSpots = [
    [-W / 2 + 0.4, 6.5, -3, Math.PI / 2], [-W / 2 + 0.4, 6.5, 5, Math.PI / 2], [-W / 2 + 0.4, 6.5, 12, Math.PI / 2],
    [W / 2 - 0.4, 6.5, -5, -Math.PI / 2], [W / 2 - 0.4, 6.5, 12, -Math.PI / 2],
    [-4, 7.5, -D / 2 + 0.4, 0], [4, 7.5, -D / 2 + 0.4, 0],
    [-6, 7.5, D / 2 - 0.4, Math.PI], [6, 7.5, D / 2 - 0.4, Math.PI],
  ];
  for (const [x, y, z, ry] of sconceSpots) {
    const s = wallSconce(M); s.position.set(x, FLOOR_Y + y, z); s.rotation.y = ry;
    castAll(s, false, false); scene.add(s); allFlames.push(...s.userData.flames);
  }

  anim.push((dt, t) => {
    for (let i = 0; i < allFlames.length; i++) {
      const fl = allFlames[i];
      const cf = 0.8 + Math.sin(t * 12 + i * 1.7) * 0.18 + Math.sin(t * 27 + i) * 0.08;
      fl.material.opacity = 0.65 + cf * 0.3;
      fl.scale.set(0.18 + cf * 0.07, 0.32 + cf * 0.14, 1);
    }
  });
  return scene;
}
