/* ============================================================
   光尘 + 星空粒子（沿弯道分布，随相机回收）
============================================================ */
import * as THREE from 'three';
import { CFG, TUNNEL_LEN, isMobile, curveX, curveY } from '../config.js';
import { scene, camera } from '../core/stage.js';
import { dustTex, sparkTex } from '../core/assets.js';

function makeParticles(count, tex, size, opacity, spread, inner = 0, color = null) {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const rr = inner + Math.random() * (spread - inner);
    const z = -Math.random() * TUNNEL_LEN;
    pos[i * 3] = Math.cos(a) * rr + curveX(z);
    pos[i * 3 + 1] = Math.sin(a) * rr + curveY(z);
    pos[i * 3 + 2] = z;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    map: tex, size, transparent: true, opacity,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
    ...(color ? { color } : {}),
  });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  return pts;
}

const dust = makeParticles(isMobile ? 200 : 380, dustTex, 0.85, 0.9, CFG.radius * 0.85);
// 卡片环附近的密集亮火花（环半径 14，环带 12–16.5）
const spark = makeParticles(
  isMobile ? 160 : 320, sparkTex, 0.5, 0.95,
  CFG.radius + 2.5,        // outer ≈ 16.5
  CFG.radius - 2,          // inner ≈ 12
  new THREE.Color(1.0, 0.92, 0.78)
);

function driftParticles(pts, dt, t, wobble, spread) {
  const arr = pts.geometry.attributes.position.array;
  const cz = camera.position.z;
  for (let i = 0; i < arr.length; i += 3) {
    arr[i] += Math.sin(t * 0.6 + i) * wobble * dt;
    arr[i + 1] += Math.cos(t * 0.5 + i * 1.3) * wobble * dt + dt * 0.25; // 缓缓上浮
    // 沿 z 回收，并围绕弯道中心重新散布
    let wrapped = false;
    if (arr[i + 2] > cz + 6) { arr[i + 2] -= TUNNEL_LEN; wrapped = true; }
    if (arr[i + 2] < cz - TUNNEL_LEN + 6) { arr[i + 2] += TUNNEL_LEN; wrapped = true; }
    if (wrapped) {
      const a = Math.random() * Math.PI * 2, rr = Math.random() * spread;
      arr[i] = curveX(arr[i + 2]) + Math.cos(a) * rr;
      arr[i + 1] = curveY(arr[i + 2]) + Math.sin(a) * rr;
    }
    if (arr[i + 1] > curveY(arr[i + 2]) + CFG.radius) arr[i + 1] = curveY(arr[i + 2]) - CFG.radius * 0.6;
  }
  pts.geometry.attributes.position.needsUpdate = true;
}

// 火花漂移：回收时保持在卡片环附近的环带内（不可复用 driftParticles——它从半径 0 重撒会把火花拉向中心）
function driftSpark(pts, dt, t) {
  const arr = pts.geometry.attributes.position.array;
  const cz = camera.position.z;
  const inner = CFG.radius - 2, band = 4.5;
  for (let i = 0; i < arr.length; i += 3) {
    arr[i] += Math.sin(t * 0.8 + i) * 0.22 * dt;
    arr[i + 1] += Math.cos(t * 0.7 + i * 1.3) * 0.22 * dt; // 有界振荡，不做累积上漂（否则会缓慢爬出环带）
    let wrapped = false;
    if (arr[i + 2] > cz + 6) { arr[i + 2] -= TUNNEL_LEN; wrapped = true; }
    if (arr[i + 2] < cz - TUNNEL_LEN + 6) { arr[i + 2] += TUNNEL_LEN; wrapped = true; }
    if (wrapped) {
      const a = Math.random() * Math.PI * 2, rr = inner + Math.random() * band;
      arr[i] = curveX(arr[i + 2]) + Math.cos(a) * rr;
      arr[i + 1] = curveY(arr[i + 2]) + Math.sin(a) * rr;
    }
  }
  pts.geometry.attributes.position.needsUpdate = true;
}

/* ---------- 星空：照片墙之外、星云之内，不受雾影响 ---------- */
const stars = (() => {
  const count = isMobile ? 280 : 650;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const rr = 20 + Math.random() * 34;
    const z = -Math.random() * TUNNEL_LEN;
    pos[i * 3] = Math.cos(a) * rr + curveX(z);
    pos[i * 3 + 1] = Math.sin(a) * rr + curveY(z);
    pos[i * 3 + 2] = z;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    map: dustTex, size: 0.42, transparent: true, opacity: 0.9,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
    color: new THREE.Color(0.85, 0.88, 1.0),
    fog: false, // 星星不受隧道雾影响，尽头也是星空
  });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  return pts;
})();

function recycleStars(pts) {
  const arr = pts.geometry.attributes.position.array;
  const cz = camera.position.z;
  let dirty = false;
  for (let i = 2; i < arr.length; i += 3) {
    if (arr[i] > cz + 6) { arr[i] -= TUNNEL_LEN; dirty = true; }
    else if (arr[i] < cz - TUNNEL_LEN + 6) { arr[i] += TUNNEL_LEN; dirty = true; }
  }
  if (dirty) pts.geometry.attributes.position.needsUpdate = true;
}

export function update(dt, t) {
  driftParticles(dust, dt, t, 0.35, CFG.radius * 0.85);
  driftSpark(spark, dt, t);
  recycleStars(stars);
  stars.material.opacity = 0.75 + Math.sin(t * 0.6) * 0.18;
  spark.material.opacity = 0.82 + Math.sin(t * 0.9 + 1.3) * 0.13; // 闪烁
}
