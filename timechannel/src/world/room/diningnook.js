/* ============================================================
   小餐桌区：长条橡木餐桌 + 六把高背椅 + 中央烛台 + 餐盘/高脚杯/餐具
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_D as D, FLOOR_Y, box, cyl, ball, turnedLeg, contactShadow, softSprite, castAll } from './kit.js';

const flameTex = softSprite('rgba(255,236,170,1)', 'rgba(255,110,30,0)', 'flame');

function diningChair(M) {
  const g = new THREE.Group();
  g.add(setp(box(1.2, 0.2, 1.2, M.leatherOx), 0, 1.5, 0));
  const back = box(1.2, 2.2, 0.16, M.oakDark); back.position.set(0, 2.6, -0.5); g.add(back);
  // 背部横档
  for (let i = 0; i < 3; i++) { const sl = box(1.0, 0.12, 0.1, M.oakMed); sl.position.set(0, 2.0 + i * 0.5, -0.46); g.add(sl); }
  for (const [lx, lz] of [[-0.5, 0.5], [0.5, 0.5], [-0.5, -0.5], [0.5, -0.5]]) { const leg = turnedLeg(1.5, 0.09, M.oakDark); leg.position.set(lx, 0, lz); g.add(leg); }
  return g;
}

export function buildDiningNook(ctx) {
  const { scene, M, anim } = ctx;
  const g = new THREE.Group();
  g.position.set(-8.5, FLOOR_Y, 4);
  g.rotation.y = 0.1;

  // 长桌
  const top = box(6.5, 0.25, 2.6, M.oakMed); top.position.y = 1.7; top.castShadow = true; top.receiveShadow = true; g.add(top);
  const apron = box(6.2, 0.4, 2.3, M.oakDark); apron.position.y = 1.5; g.add(apron);
  for (const lx of [-2.7, 2.7]) { const trestle = box(0.4, 1.4, 2.0, M.oakDark); trestle.position.set(lx, 0.75, 0); g.add(trestle); const foot = box(0.6, 0.25, 2.4, M.oakDark); foot.position.set(lx, 0.12, 0); g.add(foot); }
  const stretcher = box(5.2, 0.25, 0.25, M.oakDark); stretcher.position.set(0, 0.7, 0); g.add(stretcher);

  // 中央三枝烛台
  const candelabra = new THREE.Group(); candelabra.position.set(0, 1.83, 0);
  const base = cyl(0.2, 0.26, 0.16, M.brass, 16); base.position.y = 0.08; candelabra.add(base);
  const stem = cyl(0.05, 0.06, 0.7, M.brass, 10); stem.position.y = 0.45; candelabra.add(stem);
  const flames = [];
  for (let i = -1; i <= 1; i++) {
    const arm = cyl(0.03, 0.03, Math.abs(i) * 0.5 + 0.1, M.brass, 6); arm.rotation.z = Math.PI / 2; arm.position.set(i * 0.25, 0.7 + Math.abs(i) * 0.1, 0); candelabra.add(arm);
    const candle = cyl(0.05, 0.06, 0.4, new THREE.MeshStandardMaterial({ color: 0xf0e4c8, roughness: 0.6 }), 8); candle.position.set(i * 0.5, 0.95 + Math.abs(i) * 0.2, 0); candelabra.add(candle);
    const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
    fl.scale.set(0.2, 0.36, 1); fl.position.set(i * 0.5, 1.2 + Math.abs(i) * 0.2, 0); candelabra.add(fl); flames.push(fl);
  }
  g.add(candelabra);

  // 餐位：盘 + 高脚杯 + 刀叉
  for (let seat = 0; seat < 6; seat++) {
    const side = seat < 3 ? 1 : -1;
    const sx = (seat % 3 - 1) * 2.0;
    const pz = side * 0.95;
    const plate = cyl(0.32, 0.32, 0.04, M.porcelainMat, 20); plate.position.set(sx, 1.85, pz); g.add(plate);
    const inner = cyl(0.22, 0.22, 0.045, new THREE.MeshStandardMaterial({ color: 0xeae0cc, roughness: 0.4 }), 18); inner.position.set(sx, 1.86, pz); g.add(inner);
    const goblet = cyl(0.1, 0.07, 0.3, new THREE.MeshPhysicalMaterial({ color: 0x9a2a2a, roughness: 0.1, transmission: 0.5, thickness: 0.2, transparent: true, opacity: 0.8, envMapIntensity: 1.3 }), 14); goblet.position.set(sx + 0.4, 2.0, pz - 0.2); g.add(goblet);
    const gstem = cyl(0.02, 0.02, 0.2, M.glass, 8); gstem.position.set(sx + 0.4, 1.85, pz - 0.2); g.add(gstem);
    const knife = box(0.04, 0.01, 0.36, M.silver); knife.position.set(sx + 0.45, 1.84, pz); g.add(knife);
    const fork = box(0.04, 0.01, 0.34, M.silver); fork.position.set(sx - 0.45, 1.84, pz); g.add(fork);
  }

  castAll(g, true, true);
  scene.add(g);
  contactShadow(scene, g.position.x, g.position.z, 9);

  // 六把椅子
  for (let i = 0; i < 6; i++) {
    const side = i < 3 ? 1 : -1;
    const c = diningChair(M);
    c.position.set(g.position.x + ((i % 3) - 1) * 2.0 * Math.cos(0.1), FLOOR_Y, g.position.z + side * 1.9);
    c.rotation.y = side > 0 ? Math.PI : 0;
    castAll(c, true, true); scene.add(c);
  }

  anim.push((dt, t) => { for (const fl of flames) { const cf = 0.8 + Math.sin(t * 13 + fl.position.x * 3) * 0.2; fl.material.opacity = 0.6 + cf * 0.3; fl.scale.set(0.16 + cf * 0.06, 0.3 + cf * 0.12, 1); } });
  return g;
}
function setp(m, x, y, z) { m.position.set(x, y, z); return m; }
