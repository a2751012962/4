/* ============================================================
   门厅小景：编织门垫 + 玄关长凳 + 名片托盘小几（托盘里几张名片+一串钥匙）+ 黄铜门刮
============================================================ */
import * as THREE from 'three';
import { ROOM_D as D, FLOOR_Y, box, cyl, ball, turnedLeg, contactShadow, castAll, mulberry } from './kit.js';

export function buildEntry(ctx) {
  const { scene, M } = ctx;
  const rnd = mulberry(17);

  // 编织门垫
  const matTex = (() => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d');
    c.fillStyle = '#7a5a32'; c.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 64; i += 6) { c.fillStyle = i % 12 ? 'rgba(40,28,14,0.35)' : 'rgba(150,120,70,0.3)'; c.fillRect(i, 0, 3, 64); c.fillRect(0, i, 64, 3); }
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const doormat = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.6), new THREE.MeshStandardMaterial({ map: matTex, roughness: 0.95 }));
  doormat.rotation.x = -Math.PI / 2; doormat.position.set(-1, FLOOR_Y + 0.05, D / 2 - 2.4); doormat.receiveShadow = true; scene.add(doormat);

  // 玄关长凳
  const bench = new THREE.Group(); bench.position.set(-6, FLOOR_Y, D / 2 - 2.5); bench.rotation.y = Math.PI;
  bench.add(setp(box(3.2, 0.3, 1.0, M.leatherOx), 0, 1.4, 0));
  bench.add(setp(box(3.2, 0.2, 1.0, M.oakMed), 0, 1.2, 0));
  for (const [lx, lz] of [[-1.4, 0.4], [1.4, 0.4], [-1.4, -0.4], [1.4, -0.4]]) { const leg = turnedLeg(1.2, 0.1, M.oakDark); leg.position.set(lx, 0, lz); bench.add(leg); }
  const armL = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.06, 8, 16, Math.PI), M.oakDark); armL.position.set(-1.5, 1.9, 0); armL.rotation.z = -Math.PI / 2; bench.add(armL);
  castAll(bench, true, true); scene.add(bench); contactShadow(scene, -6, D / 2 - 2.5, 4);

  // 名片托盘小几
  const t = new THREE.Group(); t.position.set(3, FLOOR_Y, D / 2 - 2.6);
  const top = cyl(0.5, 0.5, 0.1, M.oakLight, 18); top.position.y = 2.0; t.add(top);
  const post = cyl(0.08, 0.1, 2.0, M.oakDark, 10); post.position.y = 1.0; t.add(post);
  const foot = cyl(0.4, 0.45, 0.1, M.oakDark, 14); foot.position.y = 0.05; t.add(foot);
  const tray = cyl(0.34, 0.34, 0.04, M.silver, 18); tray.position.y = 2.08; t.add(tray);
  for (let i = 0; i < 4; i++) { const card = box(0.22, 0.01, 0.14, new THREE.MeshStandardMaterial({ color: 0xf4efe6, roughness: 0.6 })); card.position.set((rnd() - 0.5) * 0.2, 2.11 + i * 0.012, (rnd() - 0.5) * 0.1); card.rotation.y = rnd() * 0.6; t.add(card); }
  // 一串钥匙
  const keyRing = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.015, 8, 16), M.brass); keyRing.position.set(0.2, 2.12, 0.1); keyRing.rotation.x = Math.PI / 2; t.add(keyRing);
  for (let i = 0; i < 3; i++) { const key = box(0.03, 0.01, 0.18, M.brass); key.position.set(0.2 + (i - 1) * 0.03, 2.11, 0.22); t.add(key); }
  castAll(t, true, true); scene.add(t); contactShadow(scene, 3, D / 2 - 2.6, 2.4);

  // 黄铜门刮（门槛旁）
  const scraper = box(0.5, 0.16, 0.1, M.iron); scraper.position.set(1.2, FLOOR_Y + 0.1, D / 2 - 1.5); scraper.castShadow = true; scene.add(scraper);

  return scene;
}
function setp(m, x, y, z) { m.position.set(x, y, z); return m; }
