/* ============================================================
   橡木书房（终章）：冲出隧道后置身的 3D 交互房间
   暖光木质的小书房——壁炉/书架/扶手椅/落地窗/相框/地毯/烛光/浮尘，
   壁炉台上那只发光的小橡果是最后一把钥匙：点亮它才能离开。
   自成一个 scene，复用同一 composer/相机（见 stage.setRenderScene）。
============================================================ */
import * as THREE from 'three';
import { camera, setRenderScene, renderer, bloom } from '../core/stage.js';
import { ROOM, isMobile } from '../config.js';
import { photoItems } from '../album/album.js';
import { playRoomMusic, stopRoomMusic } from '../audio.js';
import { flow } from '../flow.js';

const W = 22, H = 10, D = 24;

let scene = null, toy = null, toyGlow = null;
let entered = false, picked = false, onExit = null;
let yaw = 0, pitch = 0;
const raycaster = new THREE.Raycaster();
const _ndc = new THREE.Vector2();
const fireLights = [], flames = [], dustArr = [];
let dust = null, lampBulb = null, emberMat = null;

const clueEl = document.getElementById('roomClue');

/* ---------- 画布材质（零外部资源） ---------- */
function woodTex(base, streak, reps = 1, knots = 0) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 256;
  const c = cv.getContext('2d');
  c.fillStyle = base; c.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 110; i++) {
    c.strokeStyle = streak; c.globalAlpha = 0.04 + Math.random() * 0.07;
    c.lineWidth = 1 + Math.random() * 2;
    const x = Math.random() * 256;
    c.beginPath(); c.moveTo(x, 0);
    c.bezierCurveTo(x + (Math.random() - 0.5) * 26, 85, x + (Math.random() - 0.5) * 26, 170, x, 256);
    c.stroke();
  }
  for (let k = 0; k < knots; k++) {
    const x = 30 + Math.random() * 196, y = 30 + Math.random() * 196;
    const g = c.createRadialGradient(x, y, 1, x, y, 8 + Math.random() * 8);
    g.addColorStop(0, streak); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.globalAlpha = 0.5; c.fillStyle = g; c.beginPath(); c.arc(x, y, 14, 0, 7); c.fill();
  }
  c.globalAlpha = 1;
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(reps, reps); t.anisotropy = 4;
  return t;
}
function plankTex() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 512;
  const c = cv.getContext('2d');
  const tones = ['#6a4626', '#5e3d20', '#6e4a2a', '#593a1e'];
  const ph = 64;
  for (let row = 0; row < 8; row++) {
    const off = (row % 2) * 80;
    for (let x = -80; x < 512; x += 128) {
      c.fillStyle = tones[(row + x) % tones.length] || tones[0];
      c.fillRect(x + off, row * ph, 126, ph - 2);
      for (let i = 0; i < 14; i++) { // 木纹
        c.strokeStyle = 'rgba(40,24,12,0.18)'; c.lineWidth = 1;
        const yy = row * ph + Math.random() * ph;
        c.beginPath(); c.moveTo(x + off, yy); c.lineTo(x + off + 126, yy + (Math.random() - 0.5) * 4); c.stroke();
      }
    }
    c.fillStyle = 'rgba(20,10,4,0.5)'; c.fillRect(0, row * ph + ph - 2, 512, 2); // 缝
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(4, 4); t.anisotropy = 4;
  return t;
}
function rugTex() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 256;
  const c = cv.getContext('2d');
  c.fillStyle = '#5a2230'; c.fillRect(0, 0, 256, 256);
  c.strokeStyle = '#c79a5a'; c.lineWidth = 6; c.strokeRect(16, 16, 224, 224);
  c.strokeStyle = '#9a5a4a'; c.lineWidth = 3; c.strokeRect(34, 34, 188, 188);
  c.fillStyle = '#c79a5a';
  for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) {
    c.save(); c.translate(40 + i * 29, 40 + j * 29); c.rotate(Math.PI / 4);
    c.fillRect(-4, -4, 8, 8); c.restore();
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function softSprite(rgba0, rgba1) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 64;
  const c = cv.getContext('2d');
  const g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, rgba0); g.addColorStop(1, rgba1);
  c.fillStyle = g; c.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const flameTex = softSprite('rgba(255,230,170,1)', 'rgba(255,120,30,0)');
const glowTex = softSprite('rgba(255,225,150,0.9)', 'rgba(255,200,120,0)');
const shadowTex = softSprite('rgba(0,0,0,0.55)', 'rgba(0,0,0,0)');

/* ---------- 小工具 ---------- */
function box(w, h, d, mat) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); }
function contactShadow(x, z, r, parent) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(r, r),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, -H / 2 + 0.02, z);
  (parent || scene).add(m); return m;
}

function build() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x150d06);
  scene.fog = new THREE.FogExp2(0x1a0f06, 0.014);

  const oak = new THREE.MeshStandardMaterial({ map: woodTex('#6e4a28', '#3c2614', 1, 6), roughness: 0.82, metalness: 0.05, side: THREE.BackSide });
  const oakDark = new THREE.MeshStandardMaterial({ map: woodTex('#4e3318', '#2a1808', 1, 4), roughness: 0.85, metalness: 0.05 });
  const oakMed = new THREE.MeshStandardMaterial({ map: woodTex('#6e4a28', '#3c2614', 1, 5), roughness: 0.8, metalness: 0.06 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x4a3018, roughness: 0.7 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xb08a3a, roughness: 0.35, metalness: 0.8, emissive: 0x2a1c06, emissiveIntensity: 0.4 });

  // 房间盒子
  scene.add(box(W, H, D, oak));
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ map: plankTex(), roughness: 0.78, metalness: 0.04 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -H / 2 + 0.01; floor.receiveShadow = true; scene.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ color: 0x2c1d0f, roughness: 0.95 }));
  ceil.rotation.x = Math.PI / 2; ceil.position.y = H / 2 - 0.01; scene.add(ceil);
  // 顶梁
  for (let i = -1; i <= 1; i++) { const beam = box(W - 1, 0.5, 0.6, oakDark); beam.position.set(0, H / 2 - 0.35, i * 6); scene.add(beam); }
  // 护墙板 + 踢脚线 + 顶线（四面）
  const wainH = 3;
  for (const [rx, rz, ww, ry] of [[0, -D / 2 + 0.08, W, 0], [0, D / 2 - 0.08, W, 0], [-W / 2 + 0.08, 0, D, Math.PI / 2], [W / 2 - 0.08, 0, D, Math.PI / 2]]) {
    const wains = box(ww, wainH, 0.12, oakDark); wains.position.set(rx, -H / 2 + wainH / 2, rz); wains.rotation.y = ry; scene.add(wains);
    const base = box(ww, 0.4, 0.2, trimMat); base.position.set(rx, -H / 2 + 0.2, rz); base.rotation.y = ry; scene.add(base);
    const cap = box(ww, 0.18, 0.22, trimMat); cap.position.set(rx, -H / 2 + wainH, rz); cap.rotation.y = ry; scene.add(cap);
    const crown = box(ww, 0.4, 0.4, trimMat); crown.position.set(rx, H / 2 - 0.6, rz); crown.rotation.y = ry; scene.add(crown);
  }

  /* ---------- 灯光：暖色为主 ---------- */
  scene.add(new THREE.AmbientLight(0xffe0bd, 0.5));
  scene.add(new THREE.HemisphereLight(0xffd9a8, 0x140a04, 0.45));
  // 落地窗的暖夕光（投影主光源）
  const sun = new THREE.DirectionalLight(0xffcf94, 1.25);
  sun.position.set(W / 2 - 1, 4, 4); sun.target.position.set(-2, -2, -3); scene.add(sun); scene.add(sun.target);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  sun.castShadow = true; sun.shadow.mapSize.set(isMobile ? 512 : 1024, isMobile ? 512 : 1024);
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 40;
  sun.shadow.camera.left = -16; sun.shadow.camera.right = 16; sun.shadow.camera.top = 12; sun.shadow.camera.bottom = -12;
  sun.shadow.bias = -0.0006;
  // 吊灯
  const pendant = box(0.3, 1.4, 0.3, oakDark); pendant.position.set(0, H / 2 - 1.0, 0); scene.add(pendant);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(1.3, 1.0, 18, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x7a4a22, emissive: 0xffb060, emissiveIntensity: 0.5, side: THREE.DoubleSide, roughness: 0.6 }));
  shade.position.set(0, H / 2 - 1.9, 0); scene.add(shade);
  lampBulb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), new THREE.MeshBasicMaterial({ color: 0xfff0d0 }));
  lampBulb.position.set(0, H / 2 - 2.2, 0); scene.add(lampBulb);
  const ceilLight = new THREE.PointLight(0xffd9a0, 1.1, 30, 1.7); ceilLight.position.set(0, H / 2 - 2.2, 0); scene.add(ceilLight);

  buildFireplace(brass);
  buildBookshelf(oakDark);
  buildWindow();
  buildArmchair();
  buildDesk(oakMed, brass);
  buildRug();
  buildPlant();
  buildPhotos(brass);
  buildDust();
}

/* ---------- 壁炉（暖源 + 壁炉台 + 烛光，钥匙放台上） ---------- */
function buildFireplace(brass) {
  const z = -D / 2 + 0.5, stone = new THREE.MeshStandardMaterial({ color: 0x5a4636, roughness: 0.95 });
  const surround = box(6, 6, 1, stone); surround.position.set(0, -H / 2 + 3, z); scene.add(surround);
  const opening = box(3.4, 3.2, 0.6, new THREE.MeshStandardMaterial({ color: 0x140a06, roughness: 1 }));
  opening.position.set(0, -H / 2 + 2.0, z + 0.3); scene.add(opening);
  // 炉火（发光面 + 火光 + 余烬粒）
  emberMat = new THREE.MeshBasicMaterial({ color: 0xff7a26, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  const fire = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.4), emberMat); fire.position.set(0, -H / 2 + 1.7, z + 0.32); scene.add(fire);
  const fglow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff8a3a, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
  fglow.scale.set(5, 4, 1); fglow.position.set(0, -H / 2 + 1.9, z + 0.5); scene.add(fglow); flames.push(fglow);
  const fl1 = new THREE.PointLight(0xff7a2e, 2.2, 22, 1.8); fl1.position.set(0, -H / 2 + 2, z + 1.5); scene.add(fl1); fireLights.push(fl1);
  const fl2 = new THREE.PointLight(0xff9a4a, 1.0, 14, 2); fl2.position.set(0, -H / 2 + 1.2, z + 2.6); scene.add(fl2); fireLights.push(fl2);
  // 壁炉台（橡木厚板）+ 烛台
  const mantel = box(7, 0.5, 1.6, new THREE.MeshStandardMaterial({ map: woodTex('#6e4a28', '#3c2614', 1, 3), roughness: 0.7 }));
  mantel.position.set(0, -H / 2 + 4.3, z + 0.4); mantel.castShadow = true; scene.add(mantel);
  for (const cx of [-2.5, 2.4]) {
    const candle = box(0.18, 0.6, 0.18, new THREE.MeshStandardMaterial({ color: 0xf0e4c8, roughness: 0.6 }));
    candle.position.set(cx, -H / 2 + 4.85, z + 0.4); scene.add(candle);
    const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
    fl.scale.set(0.4, 0.7, 1); fl.position.set(cx, -H / 2 + 5.3, z + 0.4); scene.add(fl); flames.push(fl);
    const cl = new THREE.PointLight(0xffcf7a, 0.5, 6, 2); cl.position.copy(fl.position); scene.add(cl); fireLights.push(cl);
  }
  buildToy(0, -H / 2 + 4.85, z + 0.4); // 钥匙放壁炉台中央
}

function buildToy(x, y, z) {
  toy = new THREE.Group(); toy.position.set(x, y, z);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 20),
    new THREE.MeshStandardMaterial({ color: 0xd9a24a, emissive: 0xffcf7a, emissiveIntensity: 0.9, roughness: 0.45, metalness: 0.1 }));
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.22, 20),
    new THREE.MeshStandardMaterial({ color: 0x7a4a22, emissive: 0x6a3a18, emissiveIntensity: 0.4, roughness: 0.7 }));
  cap.position.y = 0.28;
  toy.add(body); toy.add(cap);
  toyGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd98a, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
  toyGlow.scale.set(1.8, 1.8, 1); toy.add(toyGlow);
  toy.userData.body = body;
  scene.add(toy);
}

/* ---------- 书架（左墙）：框 + 隔板 + 一排排书脊 ---------- */
function buildBookshelf(oakDark) {
  const x = -W / 2 + 0.55, g = new THREE.Group(); g.position.set(x, -H / 2 + 3.5, -5); g.rotation.y = Math.PI / 2;
  const frameMat = oakDark, bw = 7, bh = 6.5;
  g.add(box(bw, bh, 1.4, frameMat));
  const cavity = box(bw - 0.6, bh - 0.6, 1.0, new THREE.MeshStandardMaterial({ color: 0x2a1c0e, roughness: 1 })); cavity.position.z = 0.3; g.add(cavity);
  const cols = ['#7a3a30', '#3a5a4a', '#6a5a2a', '#46506a', '#7a5a3a', '#5a3a4a', '#3a4a5a', '#8a6a3a'];
  for (let s = 0; s < 4; s++) {
    const shelf = box(bw - 0.6, 0.16, 1.0, frameMat); shelf.position.set(0, bh / 2 - 0.8 - s * 1.5, 0.3); g.add(shelf);
    let bx = -bw / 2 + 0.6;
    while (bx < bw / 2 - 0.6) {
      const h = 0.9 + Math.random() * 0.35, w = 0.16 + Math.random() * 0.16;
      const bk = box(w, h, 0.7 + Math.random() * 0.2, new THREE.MeshStandardMaterial({ color: cols[(Math.random() * cols.length) | 0], roughness: 0.7 }));
      bk.position.set(bx + w / 2, bh / 2 - 0.8 - s * 1.5 + 0.08 + h / 2, 0.4);
      bk.rotation.z = Math.random() < 0.12 ? 0.18 : 0; g.add(bk); bx += w + 0.015;
    }
  }
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  scene.add(g);
}

/* ---------- 落地窗（右墙）：框 + 暖夕光玻璃 + 窗帘 ---------- */
function buildWindow() {
  const x = W / 2 - 0.3, g = new THREE.Group(); g.position.set(x, -H / 2 + 4, 5); g.rotation.y = -Math.PI / 2;
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x3a2614, roughness: 0.7 });
  g.add(box(5.2, 7.2, 0.4, frameMat));
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 6.4),
    new THREE.MeshBasicMaterial({ color: 0xffd9a0 }));
  pane.position.z = 0.18; g.add(pane);
  const paneGlow = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 6.4), new THREE.MeshBasicMaterial({ map: glowTex, color: 0xffe6b0, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
  paneGlow.position.z = 0.2; g.add(paneGlow);
  // 窗棂
  for (const yy of [-2, 0, 2]) { const m = box(4.6, 0.12, 0.3, frameMat); m.position.set(0, yy, 0.22); g.add(m); }
  for (const xx of [-1.5, 0, 1.5]) { const m = box(0.12, 6.6, 0.3, frameMat); m.position.set(xx, 0, 0.22); g.add(m); }
  // 窗帘
  const curtain = new THREE.MeshStandardMaterial({ color: 0x6a2535, roughness: 0.95, side: THREE.DoubleSide });
  for (const sx of [-2.9, 2.9]) { const cu = box(1.1, 7.6, 0.18, curtain); cu.position.set(sx, 0, 0.4); cu.rotation.y = sx < 0 ? 0.12 : -0.12; g.add(cu); }
  // 透进来的暖光
  const wl = new THREE.PointLight(0xffcf94, 0.9, 26, 1.5); wl.position.set(x - 2, -H / 2 + 4, 5); scene.add(wl);
  scene.add(g);
}

/* ---------- 扶手椅（壁炉前） ---------- */
function buildArmchair() {
  const fab = new THREE.MeshStandardMaterial({ color: 0x7a3a2a, roughness: 0.92 });
  const g = new THREE.Group(); g.position.set(-3.5, -H / 2, -3); g.rotation.y = 0.5;
  const seat = box(2.4, 0.7, 2.2, fab); seat.position.y = 1.0; g.add(seat);
  const cush = box(2.0, 0.4, 1.9, fab); cush.position.set(0, 1.45, 0); g.add(cush);
  const back = box(2.4, 2.4, 0.5, fab); back.position.set(0, 2.0, -0.9); g.add(back);
  for (const ax of [-1.25, 1.25]) { const arm = box(0.4, 1.2, 2.2, fab); arm.position.set(ax, 1.4, 0); g.add(arm); }
  const legMat = new THREE.MeshStandardMaterial({ color: 0x3a2410, roughness: 0.6 });
  for (const [lx, lz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) { const leg = box(0.25, 1.0, 0.25, legMat); leg.position.set(lx, 0.5, lz); g.add(leg); }
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  scene.add(g); contactShadow(-3.5, -3, 4.5);
}

/* ---------- 书桌 + 台灯 + 桌上相框 ---------- */
function buildDesk(oakMed, brass) {
  const g = new THREE.Group(); g.position.set(4, -H / 2, -2); g.rotation.y = -0.4;
  const top = box(3.4, 0.25, 1.8, oakMed); top.position.y = 1.6; top.castShadow = true; top.receiveShadow = true; g.add(top);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x3a2410, roughness: 0.6 });
  for (const [lx, lz] of [[-1.5, 0.7], [1.5, 0.7], [-1.5, -0.7], [1.5, -0.7]]) { const leg = box(0.22, 1.6, 0.22, legMat); leg.position.set(lx, 0.8, lz); g.add(leg); }
  // 绿罩台灯
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.15, 16), brass); base.position.set(-1.0, 1.78, 0); g.add(base);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 12), brass); stem.position.set(-1.0, 2.1, 0); g.add(stem);
  const dshade = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x1e5a3a, emissive: 0x2a6a44, emissiveIntensity: 0.5, roughness: 0.5, side: THREE.DoubleSide }));
  dshade.position.set(-1.0, 2.5, 0); dshade.rotation.x = Math.PI; g.add(dshade);
  const dl = new THREE.PointLight(0xffe2a0, 0.8, 9, 2); dl.position.set(-1.0, 2.3, 0); g.add(dl);
  scene.add(g); contactShadow(4, -2, 4.5);
}

function buildRug() {
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(9, 7), new THREE.MeshStandardMaterial({ map: rugTex(), roughness: 0.95 }));
  rug.rotation.x = -Math.PI / 2; rug.position.set(-0.5, -H / 2 + 0.03, -1); rug.receiveShadow = true; scene.add(rug);
}

function buildPlant() {
  const g = new THREE.Group(); g.position.set(W / 2 - 2.5, -H / 2, -8);
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.45, 1.0, 16), new THREE.MeshStandardMaterial({ color: 0x6a3a22, roughness: 0.8 }));
  pot.position.y = 0.5; g.add(pot);
  const leaf = new THREE.MeshStandardMaterial({ color: 0x2e5a30, roughness: 0.8 });
  for (let i = 0; i < 9; i++) {
    const l = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.6 + Math.random() * 0.8, 6), leaf);
    l.position.set((Math.random() - 0.5) * 0.6, 1.4 + Math.random() * 0.4, (Math.random() - 0.5) * 0.6);
    l.rotation.set((Math.random() - 0.5) * 0.7, 0, (Math.random() - 0.5) * 0.7); g.add(l);
  }
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  scene.add(g); contactShadow(W / 2 - 2.5, -8, 2.2);
}

/* ---------- 墙上的相框（用已就绪的纹理）+ 黄铜画灯 ---------- */
function buildPhotos(brass) {
  const spots = [
    [-W / 2 + 0.2, 1.6, 3, Math.PI / 2], [-W / 2 + 0.2, 1.2, 8, Math.PI / 2],
    [0, 2.0, -D / 2 + 0.15, 0], [4.5, 2.2, -D / 2 + 0.15, 0], [-4.5, 1.6, -D / 2 + 0.15, 0],
    [W / 2 - 0.2, 2.0, -8, -Math.PI / 2],
  ];
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x8a5a2a, roughness: 0.5, metalness: 0.2 });
  let pi = 0;
  for (const [x, y, z, ry] of spots) {
    const item = photoItems[(pi * 7 + 3) % Math.max(photoItems.length, 1)]; pi++;
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; g.rotation.z = (Math.random() - 0.5) * 0.03;
    const frame = box(2.7, 2.1, 0.12, frameMat); frame.castShadow = true; g.add(frame);
    const mat = item && item.texture ? new THREE.MeshBasicMaterial({ map: item.texture }) : new THREE.MeshBasicMaterial({ color: 0x2a2030 });
    const photo = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.7), mat); photo.position.z = 0.08; g.add(photo);
    // 画灯
    const arm = box(0.1, 0.1, 0.5, brass); arm.position.set(0, 1.25, 0.25); g.add(arm);
    const hood = box(1.2, 0.18, 0.3, brass); hood.position.set(0, 1.4, 0.45); g.add(hood);
    const pl = new THREE.PointLight(0xffe2ac, 0.35, 5, 2); pl.position.set(0, 1.1, 0.7); g.add(pl);
    scene.add(g);
  }
}

function buildDust() {
  const n = isMobile ? 90 : 200, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - 0.5) * W; pos[i * 3 + 1] = (Math.random() - 0.5) * H; pos[i * 3 + 2] = (Math.random() - 0.5) * D; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  dust = new THREE.Points(geo, new THREE.PointsMaterial({ map: glowTex, color: 0xffdca0, size: 0.12, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
  dustArr.push(geo); scene.add(dust);
}

export function enter(onExitCb) {
  onExit = onExitCb;
  if (!scene) build();
  entered = true; picked = false; yaw = -0.05; pitch = -0.04;
  camera.position.set(0.5, 0.4, 8.5);
  camera.rotation.set(0, 0, 0); camera.rotation.order = 'YXZ';
  camera.fov = 64; camera.updateProjectionMatrix();
  renderer.toneMappingExposure = 1.15; // 从冲出白场的高曝光回到温暖室内
  bloom.strength = 0.42;
  setRenderScene(scene);
  if (clueEl) { clueEl.textContent = ROOM.clue; clueEl.classList.add('show'); }
  playRoomMusic();
}

export function update(dt, t) {
  if (!entered) return;
  camera.rotation.y = yaw; camera.rotation.x = pitch;
  // 炉火 / 烛火 闪烁
  const flick = 0.7 + Math.sin(t * 11) * 0.15 + Math.sin(t * 23.3) * 0.1;
  for (const l of fireLights) {
    if (l.userData.base === undefined) l.userData.base = l.intensity;
    l.intensity = l.userData.base * flick;
  }
  if (emberMat) emberMat.opacity = 0.7 + flick * 0.25;
  for (const f of flames) { f.material.opacity = 0.7 + flick * 0.3; f.scale.y = (f.scale.x > 1 ? 4 : 0.7) * (0.92 + flick * 0.12); }
  // 钥匙脉动
  if (toy) {
    toy.rotation.y += dt * 0.7;
    const pulse = 0.7 + Math.sin(t * 2.2) * 0.3;
    toy.userData.body.material.emissiveIntensity = picked ? 2.6 : 0.7 + pulse * 0.7;
    if (toyGlow) toyGlow.material.opacity = picked ? 0.98 : 0.45 + pulse * 0.3;
  }
  // 浮尘缓缓上飘
  if (dust) {
    const a = dust.geometry.attributes.position.array;
    for (let i = 1; i < a.length; i += 3) { a[i] += dt * 0.15; if (a[i] > H / 2) a[i] = -H / 2; }
    dust.geometry.attributes.position.needsUpdate = true;
    dust.material.opacity = 0.4 + Math.sin(t * 0.7) * 0.12;
  }
}

/* ---------- 环视（拖动）+ 点击拾取 ---------- */
let dragging = false, lx = 0, ly = 0, moved = 0;
function onDown(e) { if (flow.mode !== 'room') return; dragging = true; moved = 0; lx = e.clientX; ly = e.clientY; }
function onMove(e) {
  if (!dragging || flow.mode !== 'room') return;
  const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY;
  moved += Math.abs(dx) + Math.abs(dy);
  yaw -= dx * 0.0026;
  pitch = THREE.MathUtils.clamp(pitch - dy * 0.0026, -0.9, 0.9);
}
function onUp(e) { if (flow.mode !== 'room') { dragging = false; return; } dragging = false; if (moved < 6) tryPick(e); }
function tryPick(e) {
  if (picked || !toy) return;
  raycaster.setFromCamera(_ndc.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1)), camera);
  if (raycaster.intersectObject(toy, true).length) pickToy();
}
function pickToy() {
  if (picked || !toy) return;
  picked = true;
  if (clueEl) clueEl.textContent = ROOM.pickedText;
  stopRoomMusic();
  setTimeout(() => { if (clueEl) clueEl.classList.remove('show'); flow.mode = 'done'; entered = false; if (onExit) onExit(); }, 1500);
}
window.addEventListener('pointerdown', onDown);
window.addEventListener('pointermove', onMove);
window.addEventListener('pointerup', onUp);

export function debugPick() { pickToy(); } // 测试用
