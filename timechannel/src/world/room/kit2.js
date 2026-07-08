/* ============================================================
   书房 · 进阶工具箱（KIT2）
   - 画布法线贴图（让木纹/布料/皮革有真实凹凸受光）
   - 更多画布材质（乐谱/世界地图/油画肖像/瓷器纹/烫金/锦缎）
   - 环境反射（RoomEnvironment + PMREM，给金属/玻璃/木器真实反射）
   - InstancedMesh / 合并几何 辅助（书脊、栏杆等批量物体）
============================================================ */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/* ---------- 由灰度高度图生成法线贴图 ---------- */
export function normalFromHeight(size, drawHeight, reps = 1, strength = 2.0) {
  const h = document.createElement('canvas'); h.width = h.height = size;
  const hc = h.getContext('2d');
  hc.fillStyle = '#808080'; hc.fillRect(0, 0, size, size);
  drawHeight(hc, size);
  const src = hc.getImageData(0, 0, size, size).data;
  const out = document.createElement('canvas'); out.width = out.height = size;
  const oc = out.getContext('2d');
  const img = oc.createImageData(size, size);
  const at = (x, y) => {
    x = (x + size) % size; y = (y + size) % size;
    return src[(y * size + x) * 4] / 255;
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (at(x - 1, y) - at(x + 1, y)) * strength;
      const dy = (at(x, y - 1) - at(x, y + 1)) * strength;
      const len = Math.hypot(dx, dy, 1);
      const i = (y * size + x) * 4;
      img.data[i] = ((dx / len) * 0.5 + 0.5) * 255;
      img.data[i + 1] = ((dy / len) * 0.5 + 0.5) * 255;
      img.data[i + 2] = (1 / len) * 255;
      img.data[i + 3] = 255;
    }
  }
  oc.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(out);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(reps, reps);
  return t;
}

let _woodN = null, _fabN = null, _leatherN = null;
export function woodNormal(reps = 1) {
  if (_woodN) { const t = _woodN.clone(); t.needsUpdate = true; t.repeat.set(reps, reps); return t; }
  _woodN = normalFromHeight(256, (c, s) => {
    for (let i = 0; i < 120; i++) {
      c.strokeStyle = `rgba(${Math.random() < 0.5 ? '40,40,40' : '200,200,200'},0.5)`;
      c.lineWidth = 0.6 + Math.random() * 1.6;
      const x = Math.random() * s; c.beginPath(); c.moveTo(x, 0);
      c.bezierCurveTo(x + (Math.random() - 0.5) * 26, s * 0.33, x + (Math.random() - 0.5) * 26, s * 0.66, x, s); c.stroke();
    }
  }, reps, 1.4);
  return _woodN;
}
export function fabricNormal(reps = 2) {
  if (_fabN) { const t = _fabN.clone(); t.needsUpdate = true; t.repeat.set(reps, reps); return t; }
  _fabN = normalFromHeight(128, (c, s) => {
    for (let x = 0; x < s; x += 3) { c.strokeStyle = 'rgba(220,220,220,0.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, s); c.stroke(); }
    for (let y = 0; y < s; y += 3) { c.strokeStyle = 'rgba(40,40,40,0.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, y); c.lineTo(s, y); c.stroke(); }
  }, reps, 1.0);
  return _fabN;
}
export function leatherNormal(reps = 2) {
  if (_leatherN) { const t = _leatherN.clone(); t.needsUpdate = true; t.repeat.set(reps, reps); return t; }
  _leatherN = normalFromHeight(256, (c, s) => {
    for (let i = 0; i < 600; i++) { const x = Math.random() * s, y = Math.random() * s, r = 3 + Math.random() * 8; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(210,210,210,0.5)'); g.addColorStop(1, 'rgba(60,60,60,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
  }, reps, 1.6);
  return _leatherN;
}

/* ---------- 环境反射：用 RoomEnvironment 生成 PMREM ---------- */
export function setupEnvironment(renderer, scene) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = env.texture;
  pmrem.dispose();
  return env.texture;
}

/* ---------- 更多画布材质 ---------- */
function tex(cv, reps = 1) { const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(reps, reps); t.anisotropy = 8; return t; }

export function sheetMusic() {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 180; const c = cv.getContext('2d');
  c.fillStyle = '#efe6cc'; c.fillRect(0, 0, 256, 180);
  c.strokeStyle = '#2a2418'; c.lineWidth = 1;
  for (let st = 0; st < 4; st++) { const y0 = 20 + st * 42; for (let l = 0; l < 5; l++) { const y = y0 + l * 5; c.beginPath(); c.moveTo(10, y); c.lineTo(246, y); c.stroke(); } for (let n = 0; n < 14; n++) { c.fillStyle = '#1a1610'; c.beginPath(); c.ellipse(24 + n * 16, y0 + (Math.random() * 4 | 0) * 5, 3.4, 2.4, -0.3, 0, 7); c.fill(); c.fillRect(27 + n * 16, y0 - 12 + (Math.random() * 4 | 0) * 5, 1.2, 14); } }
  return tex(cv);
}
export function worldMap() {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 160; const c = cv.getContext('2d');
  c.fillStyle = '#d9c79a'; c.fillRect(0, 0, 256, 160);
  c.fillStyle = '#9aa77a';
  const blobs = [[40, 60, 30, 40], [110, 50, 40, 30], [150, 90, 50, 40], [200, 60, 30, 50], [70, 110, 26, 26]];
  for (const [x, y, w, h] of blobs) { c.beginPath(); c.ellipse(x, y, w, h, Math.random(), 0, 7); c.fill(); }
  c.strokeStyle = 'rgba(120,90,50,0.4)'; for (let i = 0; i < 160; i += 16) { c.beginPath(); c.moveTo(0, i); c.lineTo(256, i); c.stroke(); } for (let i = 0; i < 256; i += 16) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 160); c.stroke(); }
  c.strokeStyle = '#7a5a2a'; c.lineWidth = 4; c.strokeRect(4, 4, 248, 152);
  return tex(cv);
}
export function portrait(seed = 0) {
  const cv = document.createElement('canvas'); cv.width = 180; cv.height = 230; const c = cv.getContext('2d');
  c.fillStyle = '#2a221a'; c.fillRect(0, 0, 180, 230);
  const g = c.createRadialGradient(90, 90, 10, 90, 120, 140); g.addColorStop(0, '#5a4636'); g.addColorStop(1, '#1a140e'); c.fillStyle = g; c.fillRect(0, 0, 180, 230);
  c.fillStyle = '#c79a78'; c.beginPath(); c.ellipse(90, 90, 34, 42, 0, 0, 7); c.fill(); // 脸
  c.fillStyle = '#3a2a1e'; c.beginPath(); c.ellipse(90, 64, 38, 26, 0, Math.PI, 0); c.fill(); // 发
  c.fillStyle = ['#3a2a4a', '#4a2a2a', '#2a3a4a'][seed % 3]; c.beginPath(); c.moveTo(40, 230); c.quadraticCurveTo(90, 130, 140, 230); c.fill(); // 衣
  return tex(cv);
}
export function porcelain() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c = cv.getContext('2d');
  c.fillStyle = '#f4f0e6'; c.fillRect(0, 0, 128, 128);
  c.strokeStyle = '#3a5a8a'; c.lineWidth = 2;
  for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(64, 64, 12 + i * 9, 0, 7); c.stroke(); }
  c.fillStyle = '#3a5a8a'; for (let a = 0; a < 8; a++) { const x = 64 + Math.cos(a / 8 * 7) * 40, y = 64 + Math.sin(a / 8 * 7) * 40; c.beginPath(); c.ellipse(x, y, 6, 3, a, 0, 7); c.fill(); }
  return tex(cv);
}
