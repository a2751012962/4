/* ============================================================
   橡木书房 · 工具箱（KIT）
   集中所有零外部资源的画布材质、几何辅助、灯光/阴影工具。
   所有 builder 共用，保证全屋统一的暖色木质质感。
============================================================ */
import * as THREE from 'three';

/* 房间尺寸（米） */
export const ROOM_W = 30;
export const ROOM_H = 13;
export const ROOM_D = 34;
export const FLOOR_Y = -ROOM_H / 2;

/* ------------------------------------------------------------
   画布纹理生成器（带缓存，避免重复生成）
------------------------------------------------------------ */
const _texCache = new Map();
function cached(key, make) {
  if (_texCache.has(key)) return _texCache.get(key);
  const t = make();
  _texCache.set(key, t);
  return t;
}
function finishTex(cv, reps = 1) {
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(reps, reps);
  t.anisotropy = 8;
  return t;
}

/* 橡木木纹：可调底色/纹理色/木节数量 */
export function woodGrain(base, streak, knots = 3, reps = 1, key) {
  return cached(key || `wg:${base}:${streak}:${knots}:${reps}`, () => {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 256;
    const c = cv.getContext('2d');
    // 底色带垂直渐变，模拟受光
    const bg = c.createLinearGradient(0, 0, 256, 0);
    bg.addColorStop(0, shade(base, -10));
    bg.addColorStop(0.5, base);
    bg.addColorStop(1, shade(base, -6));
    c.fillStyle = bg; c.fillRect(0, 0, 256, 256);
    // 长木纹
    for (let i = 0; i < 150; i++) {
      c.strokeStyle = streak;
      c.globalAlpha = 0.03 + Math.random() * 0.07;
      c.lineWidth = 0.6 + Math.random() * 2.2;
      const x = Math.random() * 256;
      c.beginPath();
      c.moveTo(x, -4);
      c.bezierCurveTo(
        x + (Math.random() - 0.5) * 24, 85,
        x + (Math.random() - 0.5) * 24, 170,
        x + (Math.random() - 0.5) * 10, 260
      );
      c.stroke();
    }
    // 木节
    for (let k = 0; k < knots; k++) {
      const x = 25 + Math.random() * 206, y = 25 + Math.random() * 206;
      const rr = 7 + Math.random() * 9;
      for (let ring = 4; ring >= 1; ring--) {
        c.globalAlpha = 0.10 * ring;
        c.strokeStyle = streak; c.lineWidth = 1.4;
        c.beginPath(); c.ellipse(x, y, rr * ring * 0.5, rr * ring * 0.32, Math.random(), 0, 7); c.stroke();
      }
    }
    c.globalAlpha = 1;
    return finishTex(cv, reps);
  });
}

/* 拼花/木地板：交错长木板 + 缝 + 纹 */
export function plankFloor() {
  return cached('plankFloor', () => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 512;
    const c = cv.getContext('2d');
    const tones = ['#6a4626', '#5e3d20', '#6e4a2a', '#593a1e', '#74502c', '#523417'];
    const ph = 56;
    for (let row = 0; row < 10; row++) {
      const off = (row % 2) * 96;
      for (let x = -96; x < 512; x += 160) {
        const tone = tones[(row * 3 + (x / 160 | 0) * 7) % tones.length];
        c.fillStyle = tone;
        c.fillRect(x + off, row * ph, 158, ph - 2);
        // 木纹
        for (let i = 0; i < 18; i++) {
          c.strokeStyle = 'rgba(38,22,10,0.16)'; c.lineWidth = 1;
          const yy = row * ph + Math.random() * ph;
          c.beginPath(); c.moveTo(x + off, yy);
          c.lineTo(x + off + 158, yy + (Math.random() - 0.5) * 5);
          c.stroke();
        }
        // 受光高光
        c.fillStyle = 'rgba(255,210,150,0.05)';
        c.fillRect(x + off, row * ph + 2, 158, 6);
      }
      c.fillStyle = 'rgba(18,9,3,0.55)';
      c.fillRect(0, row * ph + ph - 2, 512, 2);
    }
    return finishTex(cv, 1);
  });
}

/* 波斯地毯：边框 + 菱形纹样 */
export function persianRug() {
  return cached('rug', () => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 256;
    const c = cv.getContext('2d');
    c.fillStyle = '#5a2230'; c.fillRect(0, 0, 256, 256);
    // 多层边框
    const borders = [['#c79a5a', 8, 14], ['#8a3a44', 4, 26], ['#c79a5a', 3, 34]];
    for (const [col, lw, inset] of borders) {
      c.strokeStyle = col; c.lineWidth = lw;
      c.strokeRect(inset, inset, 256 - inset * 2, 256 - inset * 2);
    }
    // 中心菱形大奖章
    c.save(); c.translate(128, 128); c.rotate(Math.PI / 4);
    c.fillStyle = '#3a4a5a'; c.fillRect(-44, -44, 88, 88);
    c.fillStyle = '#c79a5a'; c.fillRect(-30, -30, 60, 60);
    c.fillStyle = '#5a2230'; c.fillRect(-16, -16, 32, 32);
    c.restore();
    // 散点纹样
    c.fillStyle = '#c79a5a';
    for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) {
      if ((i + j) % 2) continue;
      c.save(); c.translate(40 + i * 22, 40 + j * 22); c.rotate(Math.PI / 4);
      c.fillRect(-3, -3, 6, 6); c.restore();
    }
    return finishTex(cv, 1);
  });
}

/* 墙纸/灰泥（护墙板上方）：暖米色细纹 */
export function plaster(base = '#5a4634') {
  return cached(`plaster:${base}`, () => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 128;
    const c = cv.getContext('2d');
    c.fillStyle = base; c.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 2200; i++) {
      c.fillStyle = `rgba(${Math.random() < 0.5 ? '255,235,200' : '20,12,6'},${Math.random() * 0.05})`;
      c.fillRect(Math.random() * 128, Math.random() * 128, 1, 1);
    }
    return finishTex(cv, 3);
  });
}

/* 布料：细噪点 */
export function fabric(base) {
  return cached(`fab:${base}`, () => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 64;
    const c = cv.getContext('2d');
    c.fillStyle = base; c.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 1400; i++) {
      c.fillStyle = `rgba(0,0,0,${Math.random() * 0.08})`;
      c.fillRect(Math.random() * 64, Math.random() * 64, 1, 1);
    }
    return finishTex(cv, 2);
  });
}

/* 皮革：暗纹 + 高光斑 */
export function leather(base = '#5a2e1a') {
  return cached(`leather:${base}`, () => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 128;
    const c = cv.getContext('2d');
    c.fillStyle = base; c.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 60; i++) {
      c.strokeStyle = `rgba(0,0,0,${0.04 + Math.random() * 0.06})`; c.lineWidth = 1;
      c.beginPath();
      const x = Math.random() * 128, y = Math.random() * 128;
      c.moveTo(x, y); c.lineTo(x + (Math.random() - 0.5) * 40, y + (Math.random() - 0.5) * 40);
      c.stroke();
    }
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 128, y = Math.random() * 128;
      const g = c.createRadialGradient(x, y, 0, x, y, 10);
      g.addColorStop(0, 'rgba(255,220,180,0.06)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g; c.fillRect(x - 10, y - 10, 20, 20);
    }
    return finishTex(cv, 2);
  });
}

/* 书脊：底色 + 烫金标题条 */
export function bookSpine(base) {
  return cached(`book:${base}`, () => {
    const cv = document.createElement('canvas'); cv.width = 32; cv.height = 128;
    const c = cv.getContext('2d');
    c.fillStyle = base; c.fillRect(0, 0, 32, 128);
    c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(0, 0, 4, 128); c.fillRect(28, 0, 4, 128);
    // 烫金条与标题块
    c.fillStyle = 'rgba(210,180,110,0.85)';
    c.fillRect(4, 24, 24, 3); c.fillRect(4, 96, 24, 3);
    c.fillStyle = 'rgba(210,180,110,0.55)';
    for (let i = 0; i < 3; i++) c.fillRect(8, 44 + i * 8, 16, 2);
    return finishTex(cv, 1);
  });
}

/* 抽象油画（壁炉上方/画廊墙），暖色调，可指定主色 */
export function painting(seed = 0) {
  return cached(`paint:${seed}`, () => {
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 200;
    const c = cv.getContext('2d');
    const rnd = mulberry(seed * 9973 + 7);
    const palettes = [
      ['#2a3a52', '#6a4a3a', '#c79a5a', '#e8d2a0'],
      ['#3a2a3a', '#6a3a4a', '#c77a5a', '#f0c890'],
      ['#22323a', '#3a5a4a', '#7a9a6a', '#d8d2a0'],
      ['#3a2418', '#7a4a28', '#c78a4a', '#f0d8a8'],
    ];
    const pal = palettes[seed % palettes.length];
    c.fillStyle = pal[0]; c.fillRect(0, 0, 256, 200);
    // 远景色带（风景画感）
    for (let i = 0; i < 5; i++) {
      c.fillStyle = pal[Math.min(i, pal.length - 1)];
      c.globalAlpha = 0.9 - i * 0.1;
      const y = 200 - i * 36 - rnd() * 16;
      c.beginPath(); c.moveTo(0, y);
      for (let x = 0; x <= 256; x += 16) c.lineTo(x, y + Math.sin(x * 0.03 + i) * 8 - rnd() * 6);
      c.lineTo(256, 200); c.lineTo(0, 200); c.fill();
    }
    // 暖色光点
    c.globalAlpha = 0.8;
    const sx = 60 + rnd() * 140, sy = 40 + rnd() * 50;
    const g = c.createRadialGradient(sx, sy, 0, sx, sy, 60);
    g.addColorStop(0, pal[3]); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.fillRect(sx - 60, sy - 60, 120, 120);
    c.globalAlpha = 1;
    return finishTex(cv, 1);
  });
}

/* 大理石（壁炉/桌面镶嵌） */
export function marble(base = '#3a3026') {
  return cached(`marble:${base}`, () => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 256;
    const c = cv.getContext('2d');
    c.fillStyle = base; c.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 40; i++) {
      c.strokeStyle = `rgba(220,200,170,${0.05 + Math.random() * 0.12})`;
      c.lineWidth = 0.6 + Math.random() * 1.6;
      c.beginPath();
      let x = Math.random() * 256, y = 0;
      c.moveTo(x, y);
      while (y < 256) { x += (Math.random() - 0.5) * 30; y += 12 + Math.random() * 18; c.lineTo(x, y); }
      c.stroke();
    }
    return finishTex(cv, 1);
  });
}

/* 暖色径向 sprite（火光/光晕/接触阴影通用） */
export function softSprite(c0, c1, key) {
  return cached(key || `ss:${c0}:${c1}`, () => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 64;
    const c = cv.getContext('2d');
    const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, c0); g.addColorStop(1, c1);
    c.fillStyle = g; c.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
  });
}

/* ------------------------------------------------------------
   颜色工具
------------------------------------------------------------ */
export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt, g = ((n >> 8) & 255) + amt, b = (n & 255) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
// 确定性随机
export function mulberry(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------
   材质库（共享，避免重复编译）
------------------------------------------------------------ */
export function materials() {
  return {
    oakWall: new THREE.MeshStandardMaterial({ map: woodGrain('#6e4a28', '#3c2614', 4, 1, 'oakWall'), roughness: 0.82, metalness: 0.05, side: THREE.BackSide }),
    oakDark: new THREE.MeshStandardMaterial({ map: woodGrain('#4a3016', '#281606', 3, 1, 'oakDark'), roughness: 0.84, metalness: 0.05 }),
    oakMed: new THREE.MeshStandardMaterial({ map: woodGrain('#6e4a28', '#3c2614', 3, 1, 'oakMed'), roughness: 0.8, metalness: 0.06 }),
    oakLight: new THREE.MeshStandardMaterial({ map: woodGrain('#7e5a32', '#4a2e16', 3, 1, 'oakLight'), roughness: 0.78, metalness: 0.05 }),
    trim: new THREE.MeshStandardMaterial({ color: 0x4a3018, roughness: 0.65 }),
    plaster: new THREE.MeshStandardMaterial({ map: plaster('#5a4634'), roughness: 0.95, side: THREE.BackSide }),
    floor: new THREE.MeshStandardMaterial({ map: plankFloor(), roughness: 0.74, metalness: 0.04 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xb08a3a, roughness: 0.32, metalness: 0.85, emissive: 0x2a1c06, emissiveIntensity: 0.35 }),
    iron: new THREE.MeshStandardMaterial({ color: 0x26201a, roughness: 0.5, metalness: 0.7 }),
    stone: new THREE.MeshStandardMaterial({ map: marble('#3a3026'), roughness: 0.6, metalness: 0.08 }),
    glassWarm: new THREE.MeshStandardMaterial({ color: 0xffd9a0, emissive: 0xffcf94, emissiveIntensity: 0.7, roughness: 0.25, metalness: 0, transparent: true, opacity: 0.85 }),
    leatherOx: new THREE.MeshStandardMaterial({ map: leather('#5a2e1a'), roughness: 0.6, metalness: 0.1 }),
    velvetRed: new THREE.MeshStandardMaterial({ map: fabric('#6a2535'), roughness: 0.95 }),
    velvetGreen: new THREE.MeshStandardMaterial({ map: fabric('#274033'), roughness: 0.95 }),
    creamShade: new THREE.MeshStandardMaterial({ color: 0xf0e0c0, emissive: 0xffcf8a, emissiveIntensity: 0.6, roughness: 0.6, side: THREE.DoubleSide }),
  };
}

/* ------------------------------------------------------------
   几何辅助
------------------------------------------------------------ */
export function box(w, h, d, mat) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); }
export function cyl(rt, rb, h, mat, seg = 16) { return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); }
export function ball(r, mat, s = 20) { return new THREE.Mesh(new THREE.SphereGeometry(r, s, s), mat); }
export function cone(r, h, mat, seg = 16) { return new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), mat); }

/* 车削椅腿/柱：用 LatheGeometry 给一个带凹凸的剖面 */
export function turnedLeg(height, radius, mat) {
  const pts = [];
  const segs = 10;
  for (let i = 0; i <= segs; i++) {
    const y = (i / segs) * height;
    const bulge = 1 + Math.sin(i / segs * Math.PI * 3) * 0.28;
    pts.push(new THREE.Vector2(Math.max(0.04, radius * bulge), y));
  }
  const geo = new THREE.LatheGeometry(pts, 14);
  return new THREE.Mesh(geo, mat);
}

/* 接触阴影（落地软影） */
let _shadowTex = null;
export function contactShadow(scene, x, z, r) {
  if (!_shadowTex) _shadowTex = softSprite('rgba(0,0,0,0.5)', 'rgba(0,0,0,0)', 'contactShadow');
  const m = new THREE.Mesh(new THREE.PlaneGeometry(r, r),
    new THREE.MeshBasicMaterial({ map: _shadowTex, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, FLOOR_Y + 0.02, z);
  scene.add(m);
  return m;
}

/* 给 group 内所有 mesh 打开投影 */
export function castAll(obj, cast = true, receive = true) {
  obj.traverse((o) => { if (o.isMesh) { o.castShadow = cast; o.receiveShadow = receive; } });
  return obj;
}
