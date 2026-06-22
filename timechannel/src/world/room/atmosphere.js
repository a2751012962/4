/* ============================================================
   氛围：空气浮尘 + 从凸窗斜射进来的暖色光柱（加法面，营造体积感）
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_H as H, ROOM_D as D, softSprite } from './kit.js';
import { isMobile } from '../../config.js';

const glowTex = softSprite('rgba(255,225,150,0.9)', 'rgba(255,200,120,0)', 'glow');

export function buildAtmosphere(ctx) {
  const { scene, anim } = ctx;

  // 浮尘
  const N = isMobile ? 120 : 280;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * W; pos[i * 3 + 1] = (Math.random() - 0.5) * H; pos[i * 3 + 2] = (Math.random() - 0.5) * D; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(geo, new THREE.PointsMaterial({ map: glowTex, color: 0xffdca0, size: 0.11, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
  scene.add(dust);

  // 光柱：从右上凸窗向左下斜射的几片加法面
  const shaftMat = new THREE.MeshBasicMaterial({ map: glowTex, color: 0xffd89a, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const shafts = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 16), shaftMat.clone());
    s.position.set(W / 2 - 4 - i * 1.6, 2 - i * 0.4, 5 - i * 0.8);
    s.rotation.z = 0.7; s.rotation.y = -0.5;
    shafts.add(s);
  }
  scene.add(shafts);

  const arr = geo.attributes.position.array;
  anim.push((dt, t) => {
    for (let i = 0; i < N; i++) {
      arr[i * 3 + 1] += dt * 0.16;
      arr[i * 3] += Math.sin(t * 0.5 + i) * dt * 0.05;
      if (arr[i * 3 + 1] > H / 2) arr[i * 3 + 1] = -H / 2;
    }
    geo.attributes.position.needsUpdate = true;
    dust.material.opacity = 0.4 + Math.sin(t * 0.6) * 0.12;
    shafts.children.forEach((s, i) => { s.material.opacity = 0.04 + (0.03 + Math.sin(t * 0.4 + i) * 0.02); });
  });

  return scene;
}
