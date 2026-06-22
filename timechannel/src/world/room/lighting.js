/* ============================================================
   全局灯光：环境 + 半球 + 凸窗暖夕光（投影主光）+ 黄铜枝形吊灯（多臂蜡烛灯）
============================================================ */
import * as THREE from 'three';
import { ROOM_W as W, ROOM_H as H, ROOM_D as D, FLOOR_Y, box, cyl, ball, softSprite, castAll } from './kit.js';
import { isMobile } from '../../config.js';
import { renderer } from '../../core/stage.js';

const flameTex = softSprite('rgba(255,236,170,1)', 'rgba(255,110,30,0)', 'flame');

export function buildLighting(ctx) {
  const { scene, M, anim } = ctx;

  scene.add(new THREE.AmbientLight(0xffe0bd, 0.42));
  scene.add(new THREE.HemisphereLight(0xffd9a8, 0x140a04, 0.4));

  // 凸窗暖夕光：主投影光
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const sun = new THREE.DirectionalLight(0xffcf94, 1.4);
  sun.position.set(W / 2 - 1, 6, 6);
  sun.target.position.set(-4, FLOOR_Y + 1, -3);
  scene.add(sun); scene.add(sun.target);
  sun.castShadow = true;
  const sm = isMobile ? 1024 : 2048;
  sun.shadow.mapSize.set(sm, sm);
  sun.shadow.camera.near = 1; sun.shadow.camera.far = 60;
  sun.shadow.camera.left = -22; sun.shadow.camera.right = 22;
  sun.shadow.camera.top = 16; sun.shadow.camera.bottom = -16;
  sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02;

  // 枝形吊灯
  const chand = new THREE.Group(); chand.position.set(-1, H / 2 - 0.6, 1);
  const chainTop = cyl(0.06, 0.06, 1.4, M.brass, 8); chainTop.position.y = -0.7; chand.add(chainTop);
  const hub = ball(0.4, M.brass, 16); hub.position.y = -1.6; chand.add(hub);
  const ringG = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.08, 10, 28), M.brass); ringG.rotation.x = Math.PI / 2; ringG.position.y = -1.7; chand.add(ringG);
  const candleFlames = [];
  const arms = 8;
  for (let i = 0; i < arms; i++) {
    const a = (i / arms) * Math.PI * 2;
    const arm = cyl(0.05, 0.05, 1.5, M.brass, 8); arm.position.set(Math.cos(a) * 0.7, -1.7, Math.sin(a) * 0.7); arm.rotation.z = Math.PI / 2; arm.rotation.y = -a; chand.add(arm);
    const cupX = Math.cos(a) * 1.4, cupZ = Math.sin(a) * 1.4;
    const cupp = cyl(0.12, 0.08, 0.16, M.brass, 10); cupp.position.set(cupX, -1.66, cupZ); chand.add(cupp);
    const candle = cyl(0.07, 0.08, 0.5, new THREE.MeshStandardMaterial({ color: 0xf0e4c8, roughness: 0.6 }), 10); candle.position.set(cupX, -1.4, cupZ); chand.add(candle);
    const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
    fl.scale.set(0.3, 0.55, 1); fl.position.set(cupX, -1.05, cupZ); chand.add(fl); candleFlames.push(fl);
  }
  // 吊灯中心点光（一盏即可，避免太多实时光源）
  const chandLight = new THREE.PointLight(0xffd9a0, 1.3, 34, 1.5); chandLight.position.y = -1.7; chand.add(chandLight); chandLight.userData.base = 1.3;
  castAll(chand, false, false);
  scene.add(chand);

  anim.push((dt, t) => {
    const flick = 0.92 + Math.sin(t * 7) * 0.05 + Math.sin(t * 17) * 0.03;
    chandLight.intensity = chandLight.userData.base * flick;
    for (let i = 0; i < candleFlames.length; i++) {
      const f = candleFlames[i];
      const cf = 0.85 + Math.sin(t * 14 + i) * 0.15;
      f.material.opacity = 0.7 + cf * 0.3; f.scale.set(0.25 + cf * 0.1, 0.45 + cf * 0.18, 1);
    }
    chand.rotation.y = Math.sin(t * 0.15) * 0.02;
  });

  return scene;
}
