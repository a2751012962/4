/* ============================================================
   帷幔：沿四壁顶部的连续帘头(valance)swag + 门上方华盖 + 角落落地长帘，
   用波浪状几何近似垂坠的厚绒，统一暖红/墨绿调
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_H as H, ROOM_D as D, FLOOR_Y, box, cyl, ball, castAll } from './kit.js';

function swagBand(len, color, depth) {
  // 用一排略微下垂的小拱（半圆柱）拼出帘头波浪
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.95, side: THREE.DoubleSide, envMapIntensity: 0.2 });
  const n = Math.max(3, Math.floor(len / 2.0));
  const w = len / n;
  for (let i = 0; i < n; i++) {
    const x = -len / 2 + w * (i + 0.5);
    const swag = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.6, w * 0.6, depth, 12, 1, true, 0, Math.PI), mat);
    swag.rotation.z = Math.PI / 2; swag.rotation.y = Math.PI / 2;
    swag.scale.set(1, 1, 0.5);
    swag.position.set(x, -w * 0.3, 0);
    g.add(swag);
    // 流苏垂坠
    const tail = cyl(0.05, 0.03, w * 0.8, mat, 6); tail.position.set(x - w / 2, -w * 0.6, 0); g.add(tail);
    const tassel = ball(0.1, new THREE.MeshStandardMaterial({ color: 0xc7a24a, roughness: 0.5, metalness: 0.3 }), 8); tassel.position.set(x - w / 2, -w * 1.0, 0); g.add(tassel);
  }
  return g;
}

export function buildDrapery(ctx) {
  const { scene } = ctx;
  const topY = H / 2 - 1.3;
  const red = 0x6a2535, green = 0x274033;

  // 四壁顶帘头
  const bands = [
    { len: W - 2, x: 0, z: -D / 2 + 0.4, ry: 0, col: red },
    { len: W - 2, x: 0, z: D / 2 - 0.4, ry: Math.PI, col: green },
    { len: D - 2, x: -W / 2 + 0.4, z: 0, ry: Math.PI / 2, col: green },
    { len: D - 2, x: W / 2 - 0.4, z: 0, ry: -Math.PI / 2, col: red },
  ];
  for (const b of bands) {
    const band = swagBand(b.len, b.col, 1.2);
    band.position.set(b.x, topY, b.z); band.rotation.y = b.ry;
    castAll(band, false, false); scene.add(band);
  }

  // 门上方华盖（更厚重，墨绿带金边）
  const canopy = swagBand(6.5, green, 1.6);
  canopy.position.set(-1, FLOOR_Y + 9.0, D / 2 - 0.5); canopy.rotation.y = Math.PI; canopy.scale.setScalar(1.2);
  castAll(canopy, false, false); scene.add(canopy);

  return scene;
}
