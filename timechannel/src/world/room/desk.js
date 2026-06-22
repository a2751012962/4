/* ============================================================
   书桌区：带抽屉的写字台 + 船长椅 + 银行家绿罩灯 + 摊开的书/信纸/墨水瓶/羽毛笔/相框
============================================================ */
import * as THREE from 'three';
import { FLOOR_Y, box, cyl, ball, turnedLeg, contactShadow, painting, castAll } from './kit.js';

export function buildDesk(ctx) {
  const { scene, M, anim } = ctx;
  const g = new THREE.Group();
  g.position.set(8.5, FLOOR_Y, -7); g.rotation.y = -0.5;

  const top = box(4.2, 0.22, 2.2, M.oakMed); top.position.y = 1.7; top.castShadow = true; top.receiveShadow = true; g.add(top);
  // 皮面镶嵌
  const inlay = box(3.4, 0.02, 1.6, M.leatherOx); inlay.position.set(0, 1.82, 0); g.add(inlay);
  // 两侧抽屉柜
  for (const sx of [-1.5, 1.5]) {
    const ped = box(1.0, 1.5, 2.0, M.oakDark); ped.position.set(sx, 0.85, 0); g.add(ped);
    for (let d = 0; d < 3; d++) { const face = box(0.86, 0.4, 0.06, M.oakLight); face.position.set(sx, 0.45 + d * 0.45, 1.0); g.add(face); const knob = ball(0.07, M.brass, 8); knob.position.set(sx, 0.45 + d * 0.45, 1.06); g.add(knob); }
  }
  // 后挡板
  const back = box(4.2, 0.6, 0.1, M.oakDark); back.position.set(0, 2.0, -1.05); g.add(back);

  // 银行家台灯（绿罩，发光）
  const lampBase = cyl(0.2, 0.26, 0.12, M.brass, 16); lampBase.position.set(-1.3, 1.86, -0.4); g.add(lampBase);
  const lampStem = cyl(0.04, 0.04, 0.6, M.brass, 10); lampStem.position.set(-1.3, 2.15, -0.4); g.add(lampStem);
  const shade = new THREE.Mesh(new THREE.SphereGeometry(0.42, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x1e5a3a, emissive: 0x2e7a4a, emissiveIntensity: 0.7, roughness: 0.5, side: THREE.DoubleSide }));
  shade.position.set(-1.3, 2.45, -0.4); shade.rotation.x = Math.PI; g.add(shade);
  const lampLight = new THREE.PointLight(0xffe6a8, 0.9, 9, 2); lampLight.position.set(-1.3, 2.25, -0.4); g.add(lampLight); lampLight.userData.base = 0.9;

  // 摊开的书
  const pageMat = new THREE.MeshStandardMaterial({ color: 0xf2ead2, roughness: 0.85 });
  for (const side of [-1, 1]) { const page = box(0.9, 0.04, 1.2, pageMat); page.position.set(0.5 + side * 0.46, 1.84, 0.4); page.rotation.z = side * 0.04; g.add(page); }
  const spine = box(0.1, 0.1, 1.2, M.leatherOx); spine.position.set(0.5, 1.86, 0.4); g.add(spine);
  // 信纸 + 墨水瓶 + 羽毛笔
  const paper = box(0.8, 0.02, 1.0, pageMat); paper.position.set(1.4, 1.84, -0.2); paper.rotation.y = 0.2; g.add(paper);
  const ink = cyl(0.1, 0.12, 0.18, new THREE.MeshStandardMaterial({ color: 0x14202a, roughness: 0.3, metalness: 0.3 }), 12); ink.position.set(1.6, 1.92, 0.5); g.add(ink);
  const quill = cyl(0.012, 0.012, 0.9, new THREE.MeshStandardMaterial({ color: 0xf0ead8, roughness: 0.7 }), 6); quill.position.set(1.55, 2.2, 0.5); quill.rotation.z = 0.5; quill.rotation.x = 0.2; g.add(quill);
  // 叠书
  for (let k = 0; k < 4; k++) { const b = box(1.0, 0.16, 0.7, new THREE.MeshStandardMaterial({ color: ['#5a2a2a', '#2a4a3a', '#3a3a5a', '#5a4a2a'][k], roughness: 0.7 })); b.position.set(-1.4, 1.89 + k * 0.17, 0.6); b.rotation.y = k * 0.05; g.add(b); }
  // 桌上小相框
  const pf = new THREE.Group(); pf.position.set(0.2, 2.1, -0.8);
  pf.add(box(0.8, 1.0, 0.06, M.brass));
  const pc = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.82), new THREE.MeshBasicMaterial({ map: (ctx.photoTex && ctx.photoTex(0)) || painting(3) })); pc.position.z = 0.05; pf.add(pc);
  pf.rotation.y = 0.2; g.add(pf);

  // 船长椅
  const chair = new THREE.Group(); chair.position.set(8.5, FLOOR_Y, -4.6); chair.rotation.y = Math.PI - 0.5;
  chair.add(p(box(1.8, 0.5, 1.7, M.leatherOx), 0, 1.3, 0));
  const cb = box(1.8, 1.6, 0.4, M.leatherOx); cb.position.set(0, 2.1, -0.7); cb.rotation.x = -0.1; chair.add(cb);
  for (const ax of [-0.9, 0.9]) chair.add(p(box(0.3, 0.8, 1.5, M.leatherOx), ax, 1.7, 0));
  const post = cyl(0.12, 0.12, 1.0, M.iron, 10); post.position.set(0, 0.8, 0); chair.add(post);
  for (let i = 0; i < 5; i++) { const leg = box(0.1, 0.1, 1.0, M.iron); leg.position.set(0, 0.3, 0); leg.rotation.y = (i / 5) * Math.PI * 2; leg.translateZ(0.6); chair.add(leg); const caster = ball(0.08, M.iron, 8); caster.position.copy(leg.position); caster.translateZ(0.6); chair.add(caster); }
  castAll(chair, true, true); scene.add(chair);

  castAll(g, true, true); scene.add(g);
  contactShadow(scene, 8.5, -7, 6); contactShadow(scene, 8.5, -4.6, 3.5);

  anim.push((dt, t) => { lampLight.intensity = lampLight.userData.base * (0.97 + Math.sin(t * 30) * 0.03); });
  return g;
}
function p(m, x, y, z) { m.position.set(x, y, z); return m; }
