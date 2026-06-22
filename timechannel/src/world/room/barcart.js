/* ============================================================
   酒水推车：两层黄铜推车 + 多瓶酒 + 醒酒器 + 玻璃杯 + 冰桶 + 托盘 + 柠檬
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_D as D, FLOOR_Y, box, cyl, ball, castAll } from './kit.js';

const BOTTLE_COLORS = [0x3a5a2a, 0x5a2a1a, 0x2a3a4a, 0x4a2a3a, 0x6a4a1a, 0x2a4a3a];

export function buildBarCart(ctx) {
  const { scene, M } = ctx;
  const g = new THREE.Group();
  g.position.set(W / 2 - 3.5, FLOOR_Y, -2.5);
  g.rotation.y = -0.6;

  const brass = M.brass;
  // 框架（四角立柱 + 两层台面 + 把手 + 轮子）
  for (const [lx, lz] of [[-1.1, 0.6], [1.1, 0.6], [-1.1, -0.6], [1.1, -0.6]]) {
    const post = cyl(0.04, 0.04, 2.0, brass, 10); post.position.set(lx, 1.0, lz); g.add(post);
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.04, 8, 14), M.iron); wheel.position.set(lx, 0.12, lz); g.add(wheel);
  }
  const glassTop = new THREE.MeshPhysicalMaterial({ color: 0xcfe0e6, roughness: 0.1, metalness: 0, transmission: 0.6, thickness: 0.2, transparent: true, opacity: 0.5, envMapIntensity: 1.4 });
  const shelfTop = box(2.4, 0.06, 1.4, glassTop); shelfTop.position.y = 2.0; g.add(shelfTop);
  const shelfBot = box(2.4, 0.06, 1.4, glassTop); shelfBot.position.y = 1.0; g.add(shelfBot);
  // 把手
  const handle = cyl(0.04, 0.04, 1.4, brass, 8); handle.rotation.z = Math.PI / 2; handle.position.set(0, 2.0, 0.7); g.add(handle);

  // 上层：酒瓶群
  let bx = -0.9;
  for (let i = 0; i < 5; i++) {
    const col = BOTTLE_COLORS[i % BOTTLE_COLORS.length];
    const glass = new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.12, metalness: 0, transmission: 0.5, thickness: 0.3, transparent: true, opacity: 0.85, envMapIntensity: 1.2 });
    const h = 0.7 + (i % 3) * 0.18;
    const bottle = cyl(0.13, 0.15, h, glass, 14); bottle.position.set(bx, 2.0 + h / 2 + 0.03, -0.2); g.add(bottle);
    const neck = cyl(0.05, 0.07, 0.24, glass, 10); neck.position.set(bx, 2.0 + h + 0.12, -0.2); g.add(neck);
    // 标签
    const label = cyl(0.151, 0.151, 0.22, new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.7 }), 14, true); label.position.set(bx, 2.0 + h * 0.45, -0.2); g.add(label);
    bx += 0.4;
  }
  // 醒酒器（圆胖）
  const decGlass = new THREE.MeshPhysicalMaterial({ color: 0xc9a86a, roughness: 0.05, metalness: 0, transmission: 0.7, thickness: 0.4, transparent: true, opacity: 0.8, envMapIntensity: 1.5 });
  const decanter = ball(0.28, decGlass, 18); decanter.scale.y = 0.8; decanter.position.set(0.9, 2.3, 0.3); g.add(decanter);
  const decNeck = cyl(0.06, 0.1, 0.3, decGlass, 12); decNeck.position.set(0.9, 2.6, 0.3); g.add(decNeck);
  const liquor = ball(0.22, new THREE.MeshStandardMaterial({ color: 0x8a4a1a, roughness: 0.2, transparent: true, opacity: 0.8 }), 14); liquor.scale.y = 0.5; liquor.position.set(0.9, 2.2, 0.3); g.add(liquor);

  // 下层：玻璃杯 + 冰桶 + 托盘 + 柠檬
  const tumbler = new THREE.MeshPhysicalMaterial({ color: 0xdfeef2, roughness: 0.08, metalness: 0, transmission: 0.6, thickness: 0.2, transparent: true, opacity: 0.5, envMapIntensity: 1.4 });
  for (let i = 0; i < 4; i++) { const gl = cyl(0.1, 0.09, 0.26, tumbler, 14); gl.position.set(-0.9 + i * 0.3, 1.16, 0.3); g.add(gl); }
  const bucket = cyl(0.26, 0.22, 0.4, M.silver, 18); bucket.position.set(0.7, 1.23, -0.3); g.add(bucket);
  for (let i = 0; i < 5; i++) { const ice = box(0.1, 0.1, 0.1, new THREE.MeshPhysicalMaterial({ color: 0xeaf4f8, roughness: 0.05, transmission: 0.7, transparent: true, opacity: 0.6 })); ice.position.set(0.7 + (Math.random() - 0.5) * 0.2, 1.4 + Math.random() * 0.05, -0.3 + (Math.random() - 0.5) * 0.2); ice.rotation.set(Math.random(), Math.random(), Math.random()); g.add(ice); }
  const tray = box(0.9, 0.04, 0.6, M.silver); tray.position.set(-0.3, 1.05, -0.3); g.add(tray);
  for (let i = 0; i < 3; i++) { const lemon = ball(0.09, new THREE.MeshStandardMaterial({ color: 0xd8c83a, roughness: 0.6 }), 12); lemon.scale.set(1, 0.8, 0.8); lemon.position.set(-0.5 + i * 0.18, 1.13, -0.3); g.add(lemon); }

  castAll(g, true, true);
  scene.add(g);
  return g;
}
