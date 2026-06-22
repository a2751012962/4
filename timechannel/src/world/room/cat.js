/* ============================================================
   炉火边蜷睡的橘猫：身体随呼吸起伏，尾巴偶尔轻摆，耳朵微动
============================================================ */
import * as THREE from 'three';
import { ROOM_D as D, FLOOR_Y, ball, cyl, cone } from './kit.js';

export function buildCat(ctx) {
  const { scene } = ctx;
  const fur = new THREE.MeshStandardMaterial({ color: 0xc77a3a, roughness: 0.85, envMapIntensity: 0.2 });
  const furL = new THREE.MeshStandardMaterial({ color: 0xe8c89a, roughness: 0.85 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x8a4a1a, roughness: 0.85 });

  const g = new THREE.Group();
  g.position.set(3.2, FLOOR_Y + 0.05, -D / 2 + 4.0);
  g.rotation.y = -0.6;

  // 蜷成一团的身体
  const body = ball(0.7, fur, 20); body.scale.set(1.3, 0.7, 1.0); body.position.y = 0.5; g.add(body);
  // 肚皮浅色
  const belly = ball(0.5, furL, 16); belly.scale.set(1.1, 0.5, 0.9); belly.position.set(0, 0.42, 0.25); g.add(belly);
  // 头
  const head = new THREE.Group(); head.position.set(0.7, 0.55, 0.35);
  const skull = ball(0.34, fur, 18); head.add(skull);
  for (const sx of [-0.18, 0.18]) { const ear = cone(0.14, 0.26, fur, 5); ear.position.set(sx, 0.3, 0); ear.rotation.x = -0.2; head.add(ear); const inner = cone(0.07, 0.16, dark, 5); inner.position.set(sx, 0.28, 0.04); head.add(inner); }
  const muzzle = ball(0.18, furL, 12); muzzle.scale.set(1, 0.7, 1); muzzle.position.set(0.22, -0.08, 0); head.add(muzzle);
  const nose = ball(0.05, new THREE.MeshStandardMaterial({ color: 0xd86a6a, roughness: 0.5 }), 8); nose.position.set(0.36, -0.05, 0); head.add(nose);
  // 闭眼（小弧线用扁球）
  for (const sx of [-0.1, 0.16]) { const eye = ball(0.05, dark, 8); eye.scale.set(1.4, 0.3, 1); eye.position.set(0.18, 0.04, sx); head.add(eye); }
  g.add(head);
  // 蜷起的尾巴
  const tail = new THREE.Group(); tail.position.set(-0.7, 0.45, 0.1);
  for (let i = 0; i < 8; i++) { const seg = ball(0.16 - i * 0.012, i > 5 ? furL : fur, 10); const a = i * 0.5; seg.position.set(Math.cos(a) * 0.5, Math.sin(a) * 0.2, Math.sin(a) * 0.5); tail.add(seg); }
  g.add(tail);
  // 前爪
  for (const sx of [0.0, 0.2]) { const paw = ball(0.14, furL, 10); paw.scale.set(1.4, 0.6, 0.8); paw.position.set(0.55, 0.18, 0.35 + sx); g.add(paw); }

  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  scene.add(g);

  ctx.anim.push((dt, t) => {
    const breath = 1 + Math.sin(t * 1.6) * 0.04;
    body.scale.set(1.3, 0.7 * breath, 1.0);
    tail.rotation.y = Math.sin(t * 0.6) * 0.15;
    head.rotation.z = Math.sin(t * 0.5) * 0.03;
  });
  return g;
}
