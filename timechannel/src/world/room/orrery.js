/* ============================================================
   黄铜太阳系仪（orrery）：发光太阳 + 多条同心臂上的行星 + 黄铜底座，缓缓公转
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_D as D, FLOOR_Y, box, cyl, ball, contactShadow, castAll } from './kit.js';

const PLANETS = [
  { r: 0.06, d: 0.5, col: 0xb0a090, sp: 1.6 },
  { r: 0.09, d: 0.8, col: 0xd8a060, sp: 1.1 },
  { r: 0.1, d: 1.1, col: 0x4a7ac0, sp: 0.9 },
  { r: 0.08, d: 1.4, col: 0xc05030, sp: 0.7 },
  { r: 0.16, d: 1.9, col: 0xd8b070, sp: 0.45 },
  { r: 0.14, d: 2.4, col: 0xc8b890, sp: 0.32 },
];

export function buildOrrery(ctx) {
  const { scene, M, anim } = ctx;

  // 小圆桌
  const table = new THREE.Group(); table.position.set(8, FLOOR_Y, -2);
  const top = cyl(1.0, 1.0, 0.16, M.oakLight, 28); top.position.y = 1.8; table.add(top);
  const post = cyl(0.16, 0.2, 1.8, M.oakDark, 12); post.position.y = 0.9; table.add(post);
  const foot = cyl(0.7, 0.8, 0.16, M.oakDark, 16); foot.position.y = 0.08; table.add(foot);
  castAll(table, true, true); scene.add(table); contactShadow(scene, 8, -2, 3);

  // 太阳系仪
  const orr = new THREE.Group(); orr.position.set(8, FLOOR_Y + 1.9, -2);
  const base = cyl(0.5, 0.6, 0.2, M.brass, 20); base.position.y = 0.1; orr.add(base);
  const column = cyl(0.06, 0.08, 0.6, M.brass, 10); column.position.y = 0.4; orr.add(column);
  // 太阳（发光）
  const sun = ball(0.22, new THREE.MeshStandardMaterial({ color: 0xffcf6a, emissive: 0xffae3a, emissiveIntensity: 1.4, roughness: 0.4 }), 18); sun.position.y = 0.75; orr.add(sun);
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(glowCanvas()), color: 0xffcf6a, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
  sunGlow.scale.set(1.2, 1.2, 1); sunGlow.position.y = 0.75; orr.add(sunGlow);

  const arms = [];
  for (const p of PLANETS) {
    // 同心轨道环
    const ring = new THREE.Mesh(new THREE.TorusGeometry(p.d, 0.012, 6, 40), M.brass); ring.rotation.x = Math.PI / 2; ring.position.y = 0.75; orr.add(ring);
    // 臂 + 行星
    const arm = new THREE.Group(); arm.position.y = 0.75;
    const rod = cyl(0.01, 0.01, p.d, M.brass, 5); rod.rotation.z = Math.PI / 2; rod.position.x = p.d / 2; arm.add(rod);
    const planet = ball(p.r, new THREE.MeshStandardMaterial({ color: p.col, roughness: 0.5, metalness: 0.1, envMapIntensity: 0.6 }), 14); planet.position.x = p.d; arm.add(planet);
    if (p.d > 1.7) { const r2 = new THREE.Mesh(new THREE.TorusGeometry(p.r * 1.8, p.r * 0.3, 6, 18), M.brass); r2.rotation.x = 1.2; r2.position.x = p.d; arm.add(r2); } // 土星环
    orr.add(arm); arms.push({ arm, sp: p.sp });
  }
  castAll(orr, true, false);
  scene.add(orr);

  anim.push((dt, t) => { for (const a of arms) a.arm.rotation.y = t * a.sp; sun.material.emissiveIntensity = 1.2 + Math.sin(t * 3) * 0.2; });
  return orr;
}

function glowCanvas() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d');
  const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,220,150,0.9)'); g.addColorStop(1, 'rgba(255,180,100,0)');
  c.fillStyle = g; c.fillRect(0, 0, 64, 64); return cv;
}
