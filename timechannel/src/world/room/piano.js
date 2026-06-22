/* ============================================================
   立式大钢琴：琴身 + 掀起的琴盖 + 支棍 + 88 键 + 三踏板 + 谱架(乐谱) + 琴凳
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_D as D, FLOOR_Y, box, cyl, turnedLeg, contactShadow, castAll } from './kit.js';
import { sheetMusic } from './kit2.js';

export function buildPiano(ctx) {
  const { scene, M } = ctx;
  const g = new THREE.Group();
  g.position.set(-W / 2 + 5, FLOOR_Y, D / 2 - 5);
  g.rotation.y = -Math.PI / 2 + 0.5;

  const black = new THREE.MeshPhysicalMaterial({ color: 0x0a0a0c, roughness: 0.18, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.2 });

  // 琴身（梯形大箱体 + 弧边近似：主箱 + 斜切角块）
  const bodyH = 1.0, bodyY = 2.4;
  const body = box(4.6, bodyH, 5.4, black); body.position.set(0, bodyY, 0); g.add(body);
  const tail = box(2.0, bodyH, 2.0, black); tail.position.set(-1.0, bodyY, -2.6); tail.rotation.y = 0.5; g.add(tail);
  // 键盘箱
  const kbBox = box(4.6, 0.7, 1.1, black); kbBox.position.set(0, 1.9, 2.9); g.add(kbBox);

  // 掀起的琴盖 + 支棍
  const lid = box(4.5, 0.1, 5.2, black); lid.position.set(0.2, bodyY + bodyH / 2 + 0.05, -0.1);
  lid.rotation.z = -0.32; lid.position.y += 0.4; g.add(lid);
  const prop = cyl(0.04, 0.04, 1.6, M.brass, 8); prop.position.set(1.8, bodyY + 1.0, -0.5); prop.rotation.z = 0.3; g.add(prop);

  // 88 键（白键 + 黑键）
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf4efe2, roughness: 0.35, metalness: 0.02, envMapIntensity: 0.6 });
  const blackKeyMat = new THREE.MeshStandardMaterial({ color: 0x101012, roughness: 0.3, metalness: 0.05 });
  const keyboard = new THREE.Group(); keyboard.position.set(0, 2.26, 3.25);
  const whiteW = 4.2 / 52, kx0 = -2.1;
  const blackPattern = [1, 1, 0, 1, 1, 1, 0]; // 每七白键中的黑键位置（简化）
  for (let i = 0; i < 52; i++) {
    const k = box(whiteW * 0.92, 0.08, 0.9, whiteMat);
    k.position.set(kx0 + i * whiteW + whiteW / 2, 0, 0); keyboard.add(k);
    if (blackPattern[i % 7] && i < 51) {
      const bk = box(whiteW * 0.6, 0.12, 0.56, blackKeyMat);
      bk.position.set(kx0 + (i + 1) * whiteW, 0.06, -0.16); keyboard.add(bk);
    }
  }
  g.add(keyboard);

  // 三踏板
  const pedalBox = box(0.7, 0.5, 0.4, black); pedalBox.position.set(0, 0.5, 3.0); g.add(pedalBox);
  for (let i = -1; i <= 1; i++) { const pd = box(0.14, 0.05, 0.4, M.brass); pd.position.set(i * 0.22, 0.35, 3.2); pd.rotation.x = 0.2; g.add(pd); }

  // 三条车削琴腿
  for (const [lx, lz] of [[-1.9, 2.6], [1.9, 2.6], [0, -2.4]]) { const leg = turnedLeg(1.9, 0.18, black); leg.position.set(lx, 0, lz); g.add(leg); }

  // 谱架 + 乐谱
  const stand = box(2.4, 1.2, 0.08, black); stand.position.set(0, 3.4, 2.6); stand.rotation.x = -0.3; g.add(stand);
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.0), new THREE.MeshBasicMaterial({ map: sheetMusic() })); sheet.position.set(0, 3.45, 2.55); sheet.rotation.x = -0.3; g.add(sheet);

  // 琴凳
  const bench = new THREE.Group(); bench.position.set(0, 0, 4.6);
  const seat = box(2.4, 0.2, 1.0, M.leatherOx); seat.position.y = 1.3; bench.add(seat);
  for (const [lx, lz] of [[-1.0, 0.4], [1.0, 0.4], [-1.0, -0.4], [1.0, -0.4]]) { const leg = turnedLeg(1.3, 0.09, M.oakDark); leg.position.set(lx, 0, lz); bench.add(leg); }
  g.add(bench);

  castAll(g, true, true);
  scene.add(g);
  contactShadow(scene, g.position.x, g.position.z, 9);
  contactShadow(scene, g.position.x, g.position.z + 4, 4);
  return g;
}
