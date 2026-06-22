/* ============================================================
   双扇镶板门（前墙）：门框 + 两扇雕花镶板门(微微虚掩) + 黄铜把手/铰链 +
   门外透进的暖光 + 一条通向门口的长地毯
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_H as H, ROOM_D as D, FLOOR_Y, box, ball, cyl, persianRug, castAll } from './kit.js';

function panelDoor(M, open) {
  const g = new THREE.Group();
  const leaf = box(2.2, 6.4, 0.16, M.oakMed); g.add(leaf);
  // 四块凹镶板
  for (let r = 0; r < 2; r++) for (let cc = 0; cc < 1; cc++) {
    const panel = box(1.6, 2.6, 0.06, M.oakDark); panel.position.set(0, -1.5 + r * 3.0, 0.09); g.add(panel);
    const bevel = box(1.4, 2.4, 0.04, M.oakLight); bevel.position.set(0, -1.5 + r * 3.0, 0.11); g.add(bevel);
  }
  // 把手 + 锁眼
  const knob = ball(0.14, M.brass, 12); knob.position.set(open ? -0.85 : 0.85, 0, 0.16); g.add(knob);
  const plate = box(0.2, 0.5, 0.04, M.brass); plate.position.set(open ? -0.85 : 0.85, -0.3, 0.13); g.add(plate);
  return g;
}

export function buildDoor(ctx) {
  const { scene, M } = ctx;
  const z = D / 2 - 0.3;
  const g = new THREE.Group(); g.position.set(-1, FLOOR_Y, z); g.rotation.y = Math.PI;

  // 门框 + 门楣
  const frameMat = M.oakDark;
  for (const sx of [-2.6, 2.6]) { const jamb = box(0.5, 7.4, 0.7, frameMat); jamb.position.set(sx, 3.7, 0); g.add(jamb); }
  const head = box(6.0, 0.6, 0.7, frameMat); head.position.set(0, 7.2, 0); g.add(head);
  // 顶部弧形装饰楣
  const ped = box(6.4, 0.5, 0.8, M.trim); ped.position.set(0, 7.6, 0); g.add(ped);
  const ped2 = box(5.2, 0.4, 0.6, M.trim); ped2.position.set(0, 8.0, 0); g.add(ped2);
  // 门内暗龛 + 门外暖光
  const reveal = box(4.6, 6.8, 0.3, new THREE.MeshStandardMaterial({ color: 0x140d08, roughness: 1 })); reveal.position.set(0, 3.6, -0.3); g.add(reveal);
  const beyond = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 6.6), new THREE.MeshBasicMaterial({ color: 0xffcf94, transparent: true, opacity: 0.7 })); beyond.position.set(0, 3.6, -0.45); g.add(beyond);

  // 两扇门（一扇微微虚掩）
  const left = panelDoor(M, true); left.position.set(-1.2, 3.4, 0.1); left.rotation.y = 0.35; g.add(left);
  const right = panelDoor(M, false); right.position.set(1.2, 3.4, 0.1); g.add(right);

  // 门槛
  const sill = box(5.4, 0.2, 0.8, M.stone); sill.position.set(0, 0.1, 0.1); g.add(sill);

  castAll(g, true, true);
  scene.add(g);

  // 通向门口的长地毯（runner）
  const runner = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 10), new THREE.MeshStandardMaterial({ map: persianRug(), roughness: 0.95 }));
  runner.rotation.x = -Math.PI / 2; runner.position.set(-1, FLOOR_Y + 0.04, D / 2 - 6); runner.receiveShadow = true;
  scene.add(runner);
  return g;
}
