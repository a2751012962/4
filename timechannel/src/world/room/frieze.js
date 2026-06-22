/* ============================================================
   檐下雕饰带：沿四壁在护墙压顶与顶线之间排一圈「卵锭饰(egg-and-dart)」+
   壁柱间的小拱券装饰，丰富中段空墙
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_H as H, ROOM_D as D, FLOOR_Y, box, ball, cyl, castAll } from './kit.js';

export function buildFrieze(ctx) {
  const { scene, M } = ctx;
  const g = new THREE.Group();
  const y = FLOOR_Y + 3.7; // 压顶上方一点
  const eggMat = new THREE.MeshStandardMaterial({ color: 0x5a4226, roughness: 0.7, envMapIntensity: 0.4 });
  const dartMat = M.trim;

  const walls = [
    { x: 0, z: -D / 2 + 0.18, len: W, horiz: true, n: 1 },
    { x: 0, z: D / 2 - 0.18, len: W, horiz: true, n: -1 },
    { x: -W / 2 + 0.18, z: 0, len: D, horiz: false, n: 1 },
    { x: W / 2 - 0.18, z: 0, len: D, horiz: false, n: -1 },
  ];
  for (const w of walls) {
    // 连续装饰带底条
    const band = box(w.horiz ? w.len : 0.2, 0.5, w.horiz ? 0.2 : w.len, dartMat);
    band.position.set(w.x, y, w.z); g.add(band);
    // 卵锭单元
    const count = Math.floor(w.len / 0.55);
    for (let i = 0; i < count; i++) {
      const t = -w.len / 2 + 0.275 + i * 0.55;
      const egg = ball(0.13, eggMat, 10); egg.scale.set(0.8, 1.1, 0.6);
      const dart = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.3, 6), dartMat);
      if (w.horiz) { egg.position.set(t, y + 0.2, w.z + w.n * 0.12); dart.position.set(t + 0.275, y + 0.1, w.z + w.n * 0.12); }
      else { egg.position.set(w.x + w.n * 0.12, y + 0.2, t); dart.position.set(w.x + w.n * 0.12, y + 0.1, t + 0.275); }
      dart.rotation.x = Math.PI;
      g.add(egg); g.add(dart);
    }
  }

  // 壁柱间小拱券（后墙 & 前墙上段）
  const archMat = M.oakMed;
  for (const z of [-D / 2 + 0.3, D / 2 - 0.3]) {
    for (let i = -2; i <= 2; i++) {
      const arch = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.12, 8, 20, Math.PI), archMat);
      arch.position.set(i * 5.0, FLOOR_Y + 8.0, z); if (z > 0) arch.rotation.y = Math.PI; g.add(arch);
    }
  }

  castAll(g, false, false);
  scene.add(g);
  return g;
}
