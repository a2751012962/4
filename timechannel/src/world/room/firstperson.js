/* ============================================================
   房间内第一人称漫步：WASD / 方向键 沿朝向行走，限制在房间内，轻微脚步起伏
============================================================ */
import { ROOM_W as W, ROOM_D as D, FLOOR_Y } from './kit.js';

const keys = {};
let enabled = false;
let bob = 0;
const EYE = FLOOR_Y + 5.0;

window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

export function setEnabled(v) { enabled = v; if (!v) for (const k in keys) keys[k] = false; }

export function update(dt, camera, yaw) {
  if (!enabled) return;
  let f = 0, s = 0;
  if (keys.KeyW || keys.ArrowUp) f += 1;
  if (keys.KeyS || keys.ArrowDown) f -= 1;
  if (keys.KeyA || keys.ArrowLeft) s -= 1;
  if (keys.KeyD || keys.ArrowRight) s += 1;
  if (!f && !s) { // 静止时缓缓回到标准眼高
    camera.position.y += (EYE - camera.position.y) * Math.min(dt * 3, 1);
    return;
  }
  const spd = 7 * dt;
  const fx = -Math.sin(yaw), fz = -Math.cos(yaw);   // 朝向（yaw=0 面向 -z）
  const rx = Math.cos(yaw), rz = -Math.sin(yaw);    // 右侧
  camera.position.x += (fx * f + rx * s) * spd;
  camera.position.z += (fz * f + rz * s) * spd;
  // 限制在房间内（留出墙厚）
  const bx = W / 2 - 2.2, bz = D / 2 - 2.2;
  camera.position.x = Math.max(-bx, Math.min(bx, camera.position.x));
  camera.position.z = Math.max(-bz, Math.min(bz, camera.position.z));
  // 走路起伏
  bob += dt * 9;
  camera.position.y = EYE + Math.sin(bob) * 0.06;
}
