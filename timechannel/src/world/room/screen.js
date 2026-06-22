/* ============================================================
   四扇折叠屏风（room divider）：木框 + 手绘风景绢面，呈微微折角立于角落
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_D as D, FLOOR_Y, box, castAll } from './kit.js';

function panelArt(seed) {
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 320; const c = cv.getContext('2d');
  const g = c.createLinearGradient(0, 0, 0, 320);
  g.addColorStop(0, '#d8c79a'); g.addColorStop(0.5, '#c7b07a'); g.addColorStop(1, '#a8945e');
  c.fillStyle = g; c.fillRect(0, 0, 128, 320);
  // 远山近水（金碧山水感）
  c.fillStyle = 'rgba(90,110,80,0.6)';
  for (let m = 0; m < 4; m++) { c.beginPath(); c.moveTo(0, 120 + m * 30); for (let x = 0; x <= 128; x += 14) c.lineTo(x, 120 + m * 30 + Math.sin(x * 0.1 + seed) * 12); c.lineTo(128, 320); c.lineTo(0, 320); c.fill(); }
  // 一枝梅 / 竹
  c.strokeStyle = '#3a2a18'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(30, 320); c.quadraticCurveTo(40, 200, 70, 120); c.stroke();
  c.fillStyle = '#c24a5a';
  for (let i = 0; i < 8; i++) { c.beginPath(); c.arc(40 + i * 4, 220 - i * 12, 4, 0, 7); c.fill(); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function buildScreen(ctx) {
  const { scene, M } = ctx;
  const g = new THREE.Group();
  g.position.set(W / 2 - 5, FLOOR_Y, -8);
  g.rotation.y = -0.5;

  const angles = [0.3, -0.3, 0.3, -0.3];
  let x = 0, rot = 0;
  for (let i = 0; i < 4; i++) {
    const panel = new THREE.Group();
    const frame = box(1.6, 6.0, 0.14, M.oakDark); panel.add(frame);
    const silk = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 5.4), new THREE.MeshStandardMaterial({ map: panelArt(i), roughness: 0.85, side: THREE.DoubleSide })); silk.position.z = 0.09; panel.add(silk);
    // 顶部装饰横档
    const topbar = box(1.6, 0.4, 0.18, M.oakMed); topbar.position.y = 3.1; panel.add(topbar);
    panel.position.set(x, 3.0, 0);
    panel.rotation.y = rot;
    g.add(panel);
    rot += angles[i];
    x += Math.cos(rot) * 1.55;
  }

  castAll(g, true, true);
  scene.add(g);
  return g;
}
