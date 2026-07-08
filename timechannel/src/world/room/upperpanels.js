/* ============================================================
   上墙浮雕镶板：在护墙板以上、帘头以下的大片灰泥墙上，
   沿四壁等距排布带线脚的浅浮雕方板 + 中心徽饰，消除空墙感
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_H as H, ROOM_D as D, FLOOR_Y, box, ball, castAll } from './kit.js';

export function buildUpperPanels(ctx) {
  const { scene, M } = ctx;
  const g = new THREE.Group();
  const yMid = FLOOR_Y + 6.3;
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x5a4226, roughness: 0.85, envMapIntensity: 0.3 });
  const frameMat = M.oakMed;
  const bossMat = M.brass;

  const walls = [
    { x: 0, z: -D / 2 + 0.16, len: W, ry: 0 },
    { x: 0, z: D / 2 - 0.16, len: W, ry: Math.PI },
    { x: -W / 2 + 0.16, z: 0, len: D, ry: Math.PI / 2 },
    { x: W / 2 - 0.16, z: 0, len: D, ry: -Math.PI / 2 },
  ];
  for (const w of walls) {
    const n = Math.max(3, Math.round(w.len / 4.5));
    const seg = w.len / n;
    for (let i = 0; i < n; i++) {
      const t = -w.len / 2 + seg * (i + 0.5);
      const grp = new THREE.Group();
      const wx = w.ry === 0 || w.ry === Math.PI ? w.x + t : w.x;
      const wz = w.ry === 0 || w.ry === Math.PI ? w.z : w.z + t;
      grp.position.set(wx, yMid, wz); grp.rotation.y = w.ry;
      // 外框线脚
      const outer = box(seg * 0.7, 2.6, 0.1, frameMat); grp.add(outer);
      // 内凹板
      const inner = box(seg * 0.56, 2.2, 0.06, panelMat); inner.position.z = 0.06; grp.add(inner);
      // 内框
      const innerFrame = box(seg * 0.6, 2.3, 0.04, frameMat); innerFrame.position.z = 0.04; grp.add(innerFrame);
      // 中心菱形徽饰
      const lozenge = box(0.4, 0.4, 0.08, bossMat); lozenge.position.z = 0.12; lozenge.rotation.z = Math.PI / 4; grp.add(lozenge);
      // 四角钉花
      for (const [cx, cy] of [[-seg * 0.28, 1.0], [seg * 0.28, 1.0], [-seg * 0.28, -1.0], [seg * 0.28, -1.0]]) {
        const stud = ball(0.08, bossMat, 8); stud.position.set(cx, cy, 0.1); grp.add(stud);
      }
      g.add(grp);
    }
  }
  castAll(g, false, false);
  scene.add(g);
  return g;
}
