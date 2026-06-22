/* ============================================================
   壁炉台面陈列：相框群 + 船钟 + 沙漏 + 黄铜书挡夹书 + 烟斗架 + 小铜炮
   （围绕中央那把发光钥匙摆开，让壁炉台像真用过的）
============================================================ */
import * as THREE from 'three';
import { ROOM_D as D, FLOOR_Y, box, cyl, ball, cone, castAll, mulberry } from './kit.js';
import { portrait } from './kit2.js';

export function buildMantel(ctx) {
  const { scene, M } = ctx;
  const rnd = mulberry(626);
  const y = FLOOR_Y + 6.7; // 炉台面之上
  const z = -D / 2 + 0.6;
  const g = new THREE.Group();

  // 相框群（与中央钥匙错开）
  const frames = [[-3.0, 0, 0.9, 1.1], [-2.2, 0.1, 0.8, 1.0], [2.6, 0, 1.0, 1.2], [3.4, -0.05, 0.7, 0.9]];
  let pi = 0;
  for (const [fx, fy, fw, fh] of frames) {
    const fr = new THREE.Group(); fr.position.set(fx, y + fh / 2, z); fr.rotation.y = (rnd() - 0.5) * 0.4;
    fr.add(box(fw, fh, 0.08, M.brass));
    const tex = ctx.photoTex ? ctx.photoTex(pi + 30) : portrait(pi); pi++;
    const pic = new THREE.Mesh(new THREE.PlaneGeometry(fw * 0.78, fh * 0.78), new THREE.MeshBasicMaterial({ map: tex })); pic.position.z = 0.05; fr.add(pic);
    const stand = box(0.04, fh * 0.6, 0.04, M.brass); stand.position.set(0, -fh * 0.3, -0.1); stand.rotation.x = 0.3; fr.add(stand);
    castAll(fr, true, false); g.add(fr);
  }

  // 船钟（黄铜圆钟）
  const ship = new THREE.Group(); ship.position.set(-1.8, y + 0.4, z);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.08, 10, 24), M.brass); ship.add(ring);
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.3, 24), M.porcelainMat); face.position.z = 0.04; ship.add(face);
  const base = box(0.5, 0.16, 0.3, M.oakDark); base.position.y = -0.42; ship.add(base);
  castAll(ship, true, false); g.add(ship);

  // 沙漏
  const hg = new THREE.Group(); hg.position.set(1.6, y + 0.35, z + 0.1);
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xdfeef2, roughness: 0.06, transmission: 0.6, transparent: true, opacity: 0.4, envMapIntensity: 1.4 });
  const topB = cone(0.18, 0.3, glassMat, 14); topB.position.y = 0.2; hg.add(topB);
  const botB = cone(0.18, 0.3, glassMat, 14); botB.position.y = -0.2; botB.rotation.x = Math.PI; hg.add(botB);
  const sand = cone(0.16, 0.22, new THREE.MeshStandardMaterial({ color: 0xd8b86a, roughness: 0.8 }), 12); sand.position.y = -0.16; sand.rotation.x = Math.PI; hg.add(sand);
  for (const yy of [0.36, -0.36]) { const cap = cyl(0.2, 0.2, 0.06, M.oakDark, 14); cap.position.y = yy; hg.add(cap); }
  for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; const post = cyl(0.02, 0.02, 0.72, M.oakDark, 5); post.position.set(Math.cos(a) * 0.18, 0, Math.sin(a) * 0.18); hg.add(post); }
  castAll(hg, true, false); g.add(hg);

  // 黄铜书挡 + 夹着几本书
  for (const sx of [3.6, 4.7]) { const end = box(0.1, 0.6, 0.5, M.brass); end.position.set(sx, y + 0.3, z); g.add(end); }
  let bx = 3.75; while (bx < 4.6) { const wB = 0.12 + rnd() * 0.06; const bk = box(wB, 0.5, 0.42, new THREE.MeshStandardMaterial({ color: ['#5a2a2a', '#2a4a3a', '#3a3a5a'][(rnd() * 3 | 0)], roughness: 0.7 })); bk.position.set(bx + wB / 2, y + 0.3, z); g.add(bk); bx += wB + 0.01; }

  // 烟斗架 + 烟斗
  const pr = new THREE.Group(); pr.position.set(-4.2, y + 0.1, z);
  pr.add(box(0.5, 0.06, 0.3, M.oakDark));
  const standP = box(0.06, 0.3, 0.06, M.oakDark); standP.position.y = 0.18; pr.add(standP);
  const bowl = cyl(0.07, 0.05, 0.14, new THREE.MeshStandardMaterial({ color: 0x4a2a18, roughness: 0.6 }), 10); bowl.position.set(0.12, 0.16, 0); pr.add(bowl);
  const stem = cyl(0.02, 0.02, 0.34, new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 0.5 }), 6); stem.rotation.z = Math.PI / 2; stem.position.set(-0.05, 0.12, 0); pr.add(stem);
  castAll(pr, true, false); g.add(pr);

  // 小铜炮（摆件）
  const cannon = new THREE.Group(); cannon.position.set(4.0, y + 0.18, z - 0.2);
  const barrel = cyl(0.06, 0.09, 0.5, M.brass, 12); barrel.rotation.z = Math.PI / 2; barrel.rotation.y = 0.3; cannon.add(barrel);
  const carriage = box(0.4, 0.16, 0.24, M.oakDark); carriage.position.y = -0.12; cannon.add(carriage);
  for (const [wx, wz] of [[-0.14, 0.12], [0.14, 0.12], [-0.14, -0.12], [0.14, -0.12]]) { const wheel = cyl(0.07, 0.07, 0.04, M.iron, 10); wheel.rotation.x = Math.PI / 2; wheel.position.set(wx, -0.2, wz); cannon.add(wheel); }
  castAll(cannon, true, false); g.add(cannon);

  scene.add(g);
  return g;
}
