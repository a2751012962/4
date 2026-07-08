/* ============================================================
   地毯群：起居区大地毯 + 钢琴区圆毯 + 壁炉前小毯，丰富画布纹样
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_D as D, FLOOR_Y } from './kit.js';

function rugTexture(w, h, base, border, accent, motif) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d');
  c.fillStyle = base; c.fillRect(0, 0, w, h);
  // 多重边框
  const insets = [[border, 10, 18], [accent, 5, 30], [border, 3, 40]];
  for (const [col, lw, inset] of insets) { c.strokeStyle = col; c.lineWidth = lw; c.strokeRect(inset, inset, w - inset * 2, h - inset * 2); }
  // 中心大奖章
  c.save(); c.translate(w / 2, h / 2); c.rotate(Math.PI / 4);
  c.fillStyle = accent; c.fillRect(-w * 0.18, -w * 0.18, w * 0.36, w * 0.36);
  c.fillStyle = border; c.fillRect(-w * 0.12, -w * 0.12, w * 0.24, w * 0.24);
  c.fillStyle = base; c.fillRect(-w * 0.06, -w * 0.06, w * 0.12, w * 0.12);
  c.restore();
  // 散布纹样
  c.fillStyle = accent;
  for (let i = 0; i < 11; i++) for (let j = 0; j < 7; j++) {
    if ((i + j) % 2) continue;
    c.save(); c.translate(40 + i * (w - 80) / 10, 40 + j * (h - 80) / 6); c.rotate(motif + Math.PI / 4);
    c.fillRect(-4, -4, 8, 8); c.restore();
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

export function buildRugs(ctx) {
  const { scene } = ctx;
  const mk = (tx, w, d, x, z, rot = 0) => {
    const r = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: tx, roughness: 0.96, envMapIntensity: 0.2 }));
    r.rotation.x = -Math.PI / 2; r.rotation.z = rot; r.position.set(x, FLOOR_Y + 0.03, z); r.receiveShadow = true; scene.add(r); return r;
  };

  // 起居区大地毯（沙发+咖啡桌下）
  mk(rugTexture(320, 220, '#5a2230', '#c79a5a', '#8a3a44', 0), 12, 8, -1, 4.5);
  // 钢琴/角落区圆形地毯
  const round = new THREE.Mesh(new THREE.CircleGeometry(3.4, 40), new THREE.MeshStandardMaterial({ map: rugTexture(256, 256, '#274033', '#c7a25a', '#3a6a4a', 0.3), roughness: 0.96 }));
  round.rotation.x = -Math.PI / 2; round.position.set(-W / 2 + 6, FLOOR_Y + 0.03, D / 2 - 7); round.receiveShadow = true; scene.add(round);
  // 壁炉前小毯
  mk(rugTexture(256, 160, '#3a2a4a', '#c79a5a', '#6a4a7a', 0.6), 6, 3.6, 0, -D / 2 + 5);
  // 台球桌下地毯
  mk(rugTexture(320, 200, '#402a1a', '#b8924a', '#6a4a2a', 0.2), 9, 5, -3, -9, 0.2);

  return scene;
}
