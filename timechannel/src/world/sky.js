/* ============================================================
   星空：流动星云 shader（配色可选 + 彩虹）+ 隧道尽头的光
============================================================ */
import * as THREE from 'three';
import { curveX, curveY } from '../config.js';
import { scene, camera } from '../core/stage.js';
import { spriteCanvas } from '../core/assets.js';

const nebulaMat = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  depthWrite: false,
  uniforms: {
    uTime: { value: 0 },
    uColB: { value: new THREE.Color(0.23, 0.10, 0.30) },
    uColC: { value: new THREE.Color(0.42, 0.18, 0.28) },
    uColD: { value: new THREE.Color(0.55, 0.38, 0.22) },
    uRainbow: { value: 0 },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */`
    uniform float uTime;
    uniform vec3 uColB;
    uniform vec3 uColC;
    uniform vec3 uColD;
    uniform float uRainbow;
    varying vec2 vUv;
    vec3 hsv2rgb(vec3 c){
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }
    // 简易 value noise + fbm
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p){
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
                 mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
    }
    float fbm(vec2 p){
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 4; i++){ v += a * noise(p); p = p * 2.1 + 17.0; a *= 0.5; }
      return v;
    }
    void main(){
      vec2 p = vec2(vUv.x * 6.2831, vUv.y * 4.0);
      float t = uTime * 0.05;
      // 双层流动 → 流体感
      float n1 = fbm(p * 1.4 + vec2(t * 0.7, -t));
      float n2 = fbm(p * 2.3 - vec2(t, t * 0.4) + n1 * 1.8);
      vec3 deep = vec3(0.05, 0.03, 0.09);
      vec3 colB = uColB, colC = uColC, colD = uColD;
      if (uRainbow > 0.01) { // 彩虹：色相沿筒壁与时间流动
        float hue = fract(vUv.x + uTime * 0.018 + n1 * 0.25);
        colB = mix(colB, hsv2rgb(vec3(hue, 0.75, 0.30)), uRainbow);
        colC = mix(colC, hsv2rgb(vec3(fract(hue + 0.18), 0.70, 0.45)), uRainbow);
        colD = mix(colD, hsv2rgb(vec3(fract(hue + 0.40), 0.65, 0.55)), uRainbow);
      }
      vec3 col = mix(deep, colB, smoothstep(0.25, 0.75, n1));
      col = mix(col, colC, smoothstep(0.5, 0.95, n2) * 0.7);
      col += colD * pow(max(n2 - 0.62, 0.0), 2.0) * 2.2;
      // 抬升整体下限，尽头中心不再是纯黑（去掉残余“黑洞”观感）
      vec3 outc = col * 0.5 + vec3(0.018, 0.012, 0.028);
      gl_FragColor = vec4(outc, 1.0);
    }
  `,
});
const nebula = new THREE.Mesh(new THREE.CylinderGeometry(58, 58, 360, 40, 1, true), nebulaMat);
nebula.rotation.x = Math.PI / 2;
scene.add(nebula);

/* ---------- 隧道尽头的光 ---------- */
const endGlowTex = spriteCanvas((ctx) => {
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,240,220,1)');
  g.addColorStop(0.25, 'rgba(255,215,180,0.55)');
  g.addColorStop(0.6, 'rgba(220,160,170,0.18)');
  g.addColorStop(1, 'rgba(220,160,170,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
});
// 大而柔的外晕（更宽羽化，营造光井氛围）
const endHaloTex = spriteCanvas((ctx) => {
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,225,195,0.55)');
  g.addColorStop(0.45, 'rgba(240,180,180,0.18)');
  g.addColorStop(1, 'rgba(200,150,170,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64);
});
// 外晕：更大更柔，fog:false 才不会被雾吞掉
const endHalo = new THREE.Sprite(new THREE.SpriteMaterial({
  map: endHaloTex, transparent: true, opacity: 0.66,
  blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
}));
endHalo.scale.set(96, 96, 1);
scene.add(endHalo);
// 核心亮斑：fog:false 是核心修复点——150 单位外不再被雾吞成黑洞；
// 略提暖白亮度，作为光束放射的源头（真正的“光束”由 godrays ShaderPass 完成）
const endGlow = new THREE.Sprite(new THREE.SpriteMaterial({
  map: endGlowTex, transparent: true, opacity: 1.0,
  color: new THREE.Color(1.25, 1.12, 0.95),
  blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
}));
endGlow.scale.set(58, 58, 1);
scene.add(endGlow);

// 供主循环把光源投影到屏幕、驱动 god-ray 光束
export function getEndLightPos() { return endGlow.position; }

/* ---------- 配色：色系选择 + 彩虹 ---------- */
const SKY_PALETTES = {
  lavender: [[0.23, 0.10, 0.30], [0.42, 0.18, 0.28], [0.55, 0.38, 0.22]],
  rose:     [[0.34, 0.10, 0.18], [0.52, 0.20, 0.28], [0.62, 0.36, 0.30]],
  ocean:    [[0.05, 0.14, 0.32], [0.10, 0.30, 0.46], [0.18, 0.50, 0.55]],
  aurora:   [[0.04, 0.20, 0.18], [0.08, 0.36, 0.30], [0.28, 0.55, 0.34]],
  ember:    [[0.30, 0.13, 0.05], [0.50, 0.26, 0.10], [0.66, 0.44, 0.18]],
};
let skyName = 'lavender';
const skyTarget = [new THREE.Color(), new THREE.Color(), new THREE.Color()];

export function setSky(name) {
  skyName = name;
  try { localStorage.setItem('tc-sky', name); } catch (_) {}
  const pal = SKY_PALETTES[name];
  if (pal) pal.forEach((c, i) => skyTarget[i].setRGB(c[0], c[1], c[2]));
  document.querySelectorAll('#skyPanel .swatch').forEach((el) => {
    el.classList.toggle('active', el.dataset.sky === name);
  });
}

// 恢复上次的配色
const savedSky = (() => { try { return localStorage.getItem('tc-sky'); } catch (_) { return null; } })();
setSky(savedSky && (SKY_PALETTES[savedSky] || savedSky === 'rainbow') ? savedSky : 'lavender');

/* ---------- 每帧：跟随相机 + 配色平滑过渡 + 尽头的光 ---------- */
export function update(dt, t) {
  const cz = camera.position.z;
  nebula.position.set(curveX(cz) * 0.8, curveY(cz) * 0.8, cz - 60);
  nebulaMat.uniforms.uTime.value = t;
  const rbU = nebulaMat.uniforms.uRainbow;
  rbU.value += ((skyName === 'rainbow' ? 1 : 0) - rbU.value) * Math.min(dt * 2, 1);
  nebulaMat.uniforms.uColB.value.lerp(skyTarget[0], Math.min(dt * 2, 1));
  nebulaMat.uniforms.uColC.value.lerp(skyTarget[1], Math.min(dt * 2, 1));
  nebulaMat.uniforms.uColD.value.lerp(skyTarget[2], Math.min(dt * 2, 1));
  endGlow.position.set(curveX(cz - 150), curveY(cz - 150), cz - 150);
  endHalo.position.copy(endGlow.position);
  // 轻微呼吸，强化“活的光”而非死黑
  endGlow.material.opacity = 0.92 + Math.sin(t * 0.6) * 0.08;
  endHalo.material.opacity = 0.62 + Math.sin(t * 0.6) * 0.06;
}
