/* ============================================================
   右墙 & 剩余墙面的相框群 + 一幅大挂毯，铺满空白上墙
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_H as H, ROOM_D as D, FLOOR_Y, box, castAll, mulberry } from './kit.js';

function frame(M, w, h, tex, gold) {
  const g = new THREE.Group();
  g.add(box(w, h, 0.12, gold ? M.brass : new THREE.MeshStandardMaterial({ color: 0x6a4426, roughness: 0.5, metalness: 0.2, envMapIntensity: 0.6 })));
  const mat = box(w * 0.9, h * 0.9, 0.06, new THREE.MeshStandardMaterial({ color: 0xece2c8, roughness: 0.8 })); mat.position.z = 0.06; g.add(mat);
  const pic = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.78, h * 0.78), new THREE.MeshBasicMaterial({ map: tex })); pic.position.z = 0.1; g.add(pic);
  g.children.forEach((o) => o.castShadow = true);
  return g;
}

export function buildGallery3(ctx) {
  const { scene, M } = ctx;
  const rnd = mulberry(321);
  let pi = 16;

  // 右墙（x = +W/2），窗在 z=5，避开窗：z<2 和 z>9 区段
  const right = [
    [-11, 4.0, 2.2, 1.7], [-8.5, 5.6, 1.8, 1.4], [-8.8, 3.0, 1.6, 2.0], [-6, 4.6, 1.6, 1.3],
    [14, 5.0, 2.0, 1.6], [14.5, 3.0, 1.6, 1.3],
  ];
  for (const [z, y, w, h] of right) {
    const f = frame(M, w, h, ctx.photoTex ? ctx.photoTex(pi++) : M.velvetRed.map, rnd() < 0.5);
    f.position.set(W / 2 - 0.25, FLOOR_Y + y, z); f.rotation.y = -Math.PI / 2; f.rotation.z = (rnd() - 0.5) * 0.03;
    scene.add(f);
  }

  // 左墙顶部窄条（书柜上方）补几幅小相框
  for (let i = 0; i < 4; i++) {
    const f = frame(M, 1.5, 1.2, ctx.photoTex ? ctx.photoTex(pi++) : M.velvetGreen.map, rnd() < 0.4);
    f.position.set(-W / 2 + 0.25, FLOOR_Y + 10.0, -8 + i * 4); f.rotation.y = Math.PI / 2;
    scene.add(f);
  }

  // 后墙大挂毯（壁炉旁空白处）
  const tap = new THREE.Mesh(new THREE.PlaneGeometry(4, 6), new THREE.MeshStandardMaterial({ map: M.velvetGreen.map, color: 0x3a5a4a, roughness: 0.95, side: THREE.DoubleSide }));
  tap.position.set(-12, FLOOR_Y + 6, -D / 2 + 0.3); scene.add(tap);
  const rod = box(4.4, 0.16, 0.16, M.brass); rod.position.set(-12, FLOOR_Y + 9.1, -D / 2 + 0.4); scene.add(rod);
  const finialL = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), M.brass); finialL.position.set(-14.2, FLOOR_Y + 9.1, -D / 2 + 0.4); scene.add(finialL);
  const finialR = finialL.clone(); finialR.position.x = -9.8; scene.add(finialR);

  return scene;
}
