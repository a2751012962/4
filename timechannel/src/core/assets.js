/* ============================================================
   纹理工具：加载器、色彩空间处理、画布贴图
============================================================ */
import * as THREE from 'three';
import { renderer } from './stage.js';

export const texLoader = new THREE.TextureLoader();
texLoader.setCrossOrigin('anonymous');

export function makeTexture(source) {
  const t = source instanceof HTMLCanvasElement ? new THREE.CanvasTexture(source) : source;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
}

export function spriteCanvas(draw) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 64;
  draw(cv.getContext('2d'));
  return makeTexture(cv);
}

export const dustTex = spriteCanvas((ctx) => {
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
  g.addColorStop(0, 'rgba(255,235,210,1)');
  g.addColorStop(0.4, 'rgba(255,220,180,0.45)');
  g.addColorStop(1, 'rgba(255,220,180,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
});

// 更亮更紧的暖色火花点（卡片环附近的光尘）
export const sparkTex = spriteCanvas((ctx) => {
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 26);
  g.addColorStop(0, 'rgba(255,250,235,1)');
  g.addColorStop(0.3, 'rgba(255,228,190,0.65)');
  g.addColorStop(1, 'rgba(255,220,180,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
});

// 卡片背后的柔光晕（所有卡片共用一张贴图）
export const cardHaloTex = spriteCanvas((ctx) => {
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,236,205,0.55)');
  g.addColorStop(0.5, 'rgba(255,205,175,0.2)');
  g.addColorStop(1, 'rgba(255,200,170,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
});
