/* ============================================================
   格状凹镶天花：在顶梁分出的每个格子里做下沉镶板 + 中心小玫瑰花饰
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_H as H, ROOM_D as D, box, cyl, ball, castAll } from './kit.js';

export function buildCoffers(ctx) {
  const { scene, M } = ctx;
  const g = new THREE.Group();
  const cy = H / 2 - 0.1;
  const cols = 5, rows = 7;
  const cw = W / cols, cd = D / rows;
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x3a2818, roughness: 0.85, envMapIntensity: 0.25 });
  const frameMat = M.oakDark;
  const rosette = new THREE.MeshStandardMaterial({ color: 0x5a4226, roughness: 0.8, envMapIntensity: 0.3 });

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = -W / 2 + cw * (i + 0.5);
      const z = -D / 2 + cd * (j + 0.5);
      // 下沉镶板（比格子略小）
      const pw = cw - 1.0, pd = cd - 1.0;
      const panel = box(pw, 0.1, pd, panelMat); panel.position.set(x, cy - 0.5, z); g.add(panel);
      // 凹槽内框（四条）
      const fA = box(pw, 0.3, 0.16, frameMat); fA.position.set(x, cy - 0.32, z - pd / 2); g.add(fA);
      const fB = box(pw, 0.3, 0.16, frameMat); fB.position.set(x, cy - 0.32, z + pd / 2); g.add(fB);
      const fC = box(0.16, 0.3, pd, frameMat); fC.position.set(x - pw / 2, cy - 0.32, z); g.add(fC);
      const fD = box(0.16, 0.3, pd, frameMat); fD.position.set(x + pw / 2, cy - 0.32, z); g.add(fD);
      // 中心花饰
      const rose = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.08, 8, 14), rosette); rose.rotation.x = Math.PI / 2; rose.position.set(x, cy - 0.55, z); g.add(rose);
      const boss = ball(0.12, rosette, 10); boss.position.set(x, cy - 0.55, z); g.add(boss);
    }
  }
  castAll(g, false, false);
  scene.add(g);
  return g;
}
