/* ============================================================
   橡木房间（终章）：冲出隧道后置身的 3D 交互房间
   - 棕色橡木风格家具/墙面 + 暖光，墙上挂着照片
   - 找到那只发光的小玩具（最后一把钥匙），点亮它才能离开
   - 自成一个 scene，复用同一 composer/相机（见 stage.setRenderScene）
============================================================ */
import * as THREE from 'three';
import { camera, setRenderScene } from '../core/stage.js';
import { ROOM } from '../config.js';
import { photoItems } from '../album/album.js';
import { playRoomMusic, stopRoomMusic } from '../audio.js';
import { flow } from '../flow.js';

let scene = null, toy = null, toyGlow = null;
let entered = false, picked = false, onExit = null;
let yaw = 0, pitch = 0;
const raycaster = new THREE.Raycaster();
const _ndc = new THREE.Vector2();

const clueEl = document.getElementById('roomClue');

/* ---------- 橡木木纹贴图（画布生成，零外部资源） ---------- */
function woodTexture(base, streak) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 256;
  const c = cv.getContext('2d');
  c.fillStyle = base; c.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 90; i++) {
    c.strokeStyle = streak; c.globalAlpha = 0.04 + Math.random() * 0.06;
    c.lineWidth = 1 + Math.random() * 2;
    const x = Math.random() * 256;
    c.beginPath();
    c.moveTo(x, 0);
    c.bezierCurveTo(x + (Math.random() - 0.5) * 30, 85, x + (Math.random() - 0.5) * 30, 170, x, 256);
    c.stroke();
  }
  c.globalAlpha = 1;
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function build() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x140d07);
  scene.fog = new THREE.FogExp2(0x140d07, 0.018);

  const W = 18, H = 9, D = 18;
  const oakWall = new THREE.MeshStandardMaterial({ map: woodTexture('#6e4a28', '#3c2614'), roughness: 0.82, metalness: 0.04, side: THREE.BackSide });
  const oakFloor = new THREE.MeshStandardMaterial({ map: woodTexture('#5a3a20', '#2c1a0c'), roughness: 0.9, metalness: 0.03 });
  oakFloor.map.repeat.set(4, 4);
  const oakCeil = new THREE.MeshStandardMaterial({ color: 0x4a3320, roughness: 0.95 });

  // 盒子房间（BackSide 让我们看到内壁）
  const box = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), oakWall);
  scene.add(box);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), oakFloor);
  floor.rotation.x = -Math.PI / 2; floor.position.y = -H / 2 + 0.01; scene.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), oakCeil);
  ceil.rotation.x = Math.PI / 2; ceil.position.y = H / 2 - 0.01; scene.add(ceil);

  // 暖光：环境 + 暖黄点光（像台灯）+ 顶部柔光
  scene.add(new THREE.AmbientLight(0xffe6c0, 0.55));
  const lamp = new THREE.PointLight(0xffcaa0, 1.5, 40, 1.6); lamp.position.set(-3, 2.2, -2); scene.add(lamp);
  const fill = new THREE.PointLight(0xffe0b8, 0.6, 50, 1.8); fill.position.set(4, 3, 4); scene.add(fill);

  // 墙上的照片（用已就绪的纹理；没有就用暖色占位）
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xd8b27a, roughness: 0.6, metalness: 0.1 });
  const spots = [
    [-W / 2 + 0.2, 1.4, -3, Math.PI / 2], [-W / 2 + 0.2, 0.2, 2.5, Math.PI / 2],
    [W / 2 - 0.2, 1.2, -2, -Math.PI / 2], [W / 2 - 0.2, 0.0, 3, -Math.PI / 2],
    [0, 1.6, -D / 2 + 0.2, 0], [3.5, 0.2, -D / 2 + 0.2, 0], [-3.5, 0.4, -D / 2 + 0.2, 0],
  ];
  let pi = 0;
  for (const [x, y, z, ry] of spots) {
    const item = photoItems[(pi * 5 + 2) % Math.max(photoItems.length, 1)];
    pi++;
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry;
    const frame = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.9), frameMat);
    g.add(frame);
    const photoMat = (item && item.texture)
      ? new THREE.MeshBasicMaterial({ map: item.texture })
      : new THREE.MeshBasicMaterial({ color: 0x2a2030 });
    const photo = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.6), photoMat);
    photo.position.z = 0.03; g.add(photo);
    scene.add(g);
  }

  // 小桌 + 玩具钥匙（发光的小橡果，呼应同伴笃笃/突突）
  const table = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 1.2),
    new THREE.MeshStandardMaterial({ map: woodTexture('#6e4a28', '#3c2614'), roughness: 0.8 }));
  table.position.set(-5, -H / 2 + 0.5, -4); scene.add(table);

  toy = new THREE.Group(); toy.position.set(-5, -H / 2 + 1.25, -4);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 20),
    new THREE.MeshStandardMaterial({ color: 0xd9a24a, emissive: 0xffcf7a, emissiveIntensity: 0.9, roughness: 0.5 }));
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.22, 20),
    new THREE.MeshStandardMaterial({ color: 0x7a4a22, emissive: 0x6a3a18, emissiveIntensity: 0.4, roughness: 0.7 }));
  cap.position.y = 0.28;
  toy.add(body); toy.add(cap);
  // 柔光晕，便于在房间里被一眼找到
  toyGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    color: 0xffd98a, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  toyGlow.scale.set(1.6, 1.6, 1); toy.add(toyGlow);
  toy.userData.pickTarget = body; // raycast 命中体
  scene.add(toy);
}

export function enter(onExitCb) {
  onExit = onExitCb;
  if (!scene) build();
  entered = true; picked = false;
  yaw = 0; pitch = 0;
  camera.position.set(0, 0.4, 6);
  camera.rotation.set(0, 0, 0);
  camera.fov = 70; camera.updateProjectionMatrix();
  setRenderScene(scene);
  if (clueEl) { clueEl.textContent = ROOM.clue; clueEl.classList.add('show'); }
  playRoomMusic();
}

export function update(dt, t) {
  if (!entered) return;
  camera.rotation.order = 'YXZ';
  camera.rotation.y = yaw; camera.rotation.x = pitch;
  if (toy) {
    toy.rotation.y += dt * 0.6;
    const pulse = 0.7 + Math.sin(t * 2.2) * 0.3;
    toy.children[0].material.emissiveIntensity = picked ? 2.4 : 0.6 + pulse * 0.6;
    if (toyGlow) toyGlow.material.opacity = picked ? 0.95 : 0.4 + pulse * 0.25;
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
function onUp(e) {
  if (flow.mode !== 'room') { dragging = false; return; }
  dragging = false;
  if (moved < 6) tryPick(e);
}
function tryPick(e) {
  if (picked || !toy) return;
  raycaster.setFromCamera(_ndc.set(
    (e.clientX / window.innerWidth) * 2 - 1,
    -((e.clientY / window.innerHeight) * 2 - 1)
  ), camera);
  const hit = raycaster.intersectObject(toy, true);
  if (hit.length) pickToy();
}
function pickToy() {
  if (picked) return;
  picked = true;
  if (clueEl) { clueEl.textContent = ROOM.pickedText; }
  stopRoomMusic();
  setTimeout(() => {
    if (clueEl) clueEl.classList.remove('show');
    flow.mode = 'done';
    entered = false;
    if (onExit) onExit();
  }, 1500);
}

window.addEventListener('pointerdown', onDown);
window.addEventListener('pointermove', onMove);
window.addEventListener('pointerup', onUp);

export function debugPick() { pickToy(); } // 测试用：直接拾取玩具
