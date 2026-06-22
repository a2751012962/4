/* ============================================================
   照片画廊 2：成片错落的烫金/木相框拼贴 + 大幅世界地图 + 两幅油画肖像 + 挂毯
   （铺满原本空荡的上墙灰泥，照片用相册纹理）
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_H as H, ROOM_D as D, FLOOR_Y, box, castAll, mulberry } from './kit.js';
import { worldMap, portrait } from './kit2.js';

function frame(M, w, h, tex, gold) {
  const g = new THREE.Group();
  const fr = box(w, h, 0.12, gold ? M.brass : new THREE.MeshStandardMaterial({ color: 0x6a4426, roughness: 0.5, metalness: 0.2, envMapIntensity: 0.6 }));
  fr.castShadow = true; g.add(fr);
  // 内衬
  const mat = box(w * 0.9, h * 0.9, 0.06, new THREE.MeshStandardMaterial({ color: 0xece2c8, roughness: 0.8 })); mat.position.z = 0.06; g.add(mat);
  const pic = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.78, h * 0.78), new THREE.MeshBasicMaterial({ map: tex })); pic.position.z = 0.1; g.add(pic);
  return g;
}

export function buildGallery2(ctx) {
  const { scene, M } = ctx;
  const rnd = mulberry(123);

  // 前墙（入口背墙 z = +D/2）密集拼贴
  const frontZ = D / 2 - 0.2;
  const collage = [
    [-8, 6, 2.6, 2.0], [-5, 7, 1.8, 1.4], [-5.4, 4.8, 1.6, 2.0], [-2, 6.5, 2.2, 1.6],
    [1.5, 6.8, 1.6, 2.0], [4.5, 6.4, 2.4, 1.8], [7.5, 6.6, 1.8, 1.4], [-8.4, 3.6, 1.8, 1.4],
    [9.2, 4.4, 1.6, 2.0], [2, 4.2, 1.5, 1.2], [-1.5, 3.8, 1.6, 1.3],
  ];
  let pi = 5;
  for (const [x, y, w, h] of collage) {
    const f = frame(M, w, h, ctx.photoTex ? ctx.photoTex(pi++) : worldMap(), rnd() < 0.45);
    f.position.set(x, FLOOR_Y + y, frontZ); f.rotation.y = Math.PI; f.rotation.z = (rnd() - 0.5) * 0.04;
    scene.add(f);
  }

  // 大幅世界地图（前墙中央偏右）
  const map = frame(M, 4.0, 2.6, worldMap(), false);
  map.position.set(6, FLOOR_Y + 8.6, frontZ); map.rotation.y = Math.PI; scene.add(map);

  // 油画肖像两幅（长墙上）
  const p1 = frame(M, 2.2, 2.8, portrait(0), true); p1.position.set(W / 2 - 0.3, FLOOR_Y + 7.5, -2); p1.rotation.y = -Math.PI / 2; scene.add(p1);
  const p2 = frame(M, 2.2, 2.8, portrait(1), true); p2.position.set(W / 2 - 0.3, FLOOR_Y + 7.5, 2); p2.rotation.y = -Math.PI / 2; scene.add(p2);

  // 挂毯（左墙上方一长条织物，暖红）
  const tapestry = new THREE.Mesh(new THREE.PlaneGeometry(6, 3.4), new THREE.MeshStandardMaterial({ map: M.velvetRed.map, color: 0x8a3a44, roughness: 0.95, side: THREE.DoubleSide }));
  tapestry.position.set(-W / 2 + 0.25, FLOOR_Y + 9.2, 9); tapestry.rotation.y = Math.PI / 2; scene.add(tapestry);
  // 挂杆
  const rod = box(6.4, 0.16, 0.16, M.brass); rod.position.set(-W / 2 + 0.4, FLOOR_Y + 11.0, 9); rod.rotation.y = Math.PI / 2; scene.add(rod);

  return scene; // 相框各自已 castShadow，无需全局处理
}
