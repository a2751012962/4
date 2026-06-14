/* ============================================================
   隧道尽头：光从出口洒进来（GPU Gems 3 屏幕空间体积光散射）
   作为普通 ShaderPass 插进现有 EffectComposer；阈值化当前帧、
   沿“像素→光源屏幕位置”径向累加得到放射光束。强度随速度耦合。
============================================================ */
import * as THREE from 'three';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { isMobile } from '../config.js';

const NUM_SAMPLES = isMobile ? 20 : 48;

const godRaysShader = {
  uniforms: {
    tDiffuse: { value: null },
    uLightUV: { value: new THREE.Vector2(0.5, 0.5) },
    uIntensity: { value: 0 },
    uDensity: { value: 0.82 },
    uWeight: { value: 0.4 },
    uDecay: { value: 0.93 },
    uThreshold: { value: 0.62 },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
  `,
  fragmentShader: /* glsl */`
    #define NUM_SAMPLES ${NUM_SAMPLES}
    uniform sampler2D tDiffuse;
    uniform vec2 uLightUV;
    uniform float uIntensity;
    uniform float uDensity;
    uniform float uWeight;
    uniform float uDecay;
    uniform float uThreshold;
    varying vec2 vUv;
    void main() {
      vec4 scene = texture2D(tDiffuse, vUv);
      if (uIntensity <= 0.001) { gl_FragColor = scene; return; }
      vec2 delta = (vUv - uLightUV) * (1.0 / float(NUM_SAMPLES) * uDensity);
      vec2 uv = vUv;
      float decay = 1.0;
      vec3 rays = vec3(0.0);
      for (int i = 0; i < NUM_SAMPLES; i++) {
        uv -= delta;
        vec3 s = max(texture2D(tDiffuse, uv).rgb - uThreshold, 0.0); // 只让够亮的成束
        rays += s * decay * uWeight;
        decay *= uDecay;
      }
      gl_FragColor = vec4(scene.rgb + rays * uIntensity, scene.a); // 加法叠加
    }
  `,
};

export const godRaysPass = new ShaderPass(godRaysShader);

const _ndc = new THREE.Vector3();

// 每帧驱动：把光源世界坐标投影到屏幕 UV，并按速度平滑调整光束强度
export function updateGodRays(camera, worldPos, speedNorm, dt) {
  _ndc.copy(worldPos).project(camera);
  const ux = _ndc.x * 0.5 + 0.5;
  const uy = _ndc.y * 0.5 + 0.5;
  const inFront = _ndc.z < 1; // 点在相机前方时投影方向有效
  const onScreen = inFront && ux > -0.25 && ux < 1.25 && uy > -0.25 && uy < 1.25;
  const u = godRaysPass.uniforms;
  // 只要在前方就更新 UV：离屏淡出期间光束仍朝真实方向收束，不锚在过期边缘点
  if (inFront) u.uLightUV.value.set(ux, uy);
  const target = onScreen ? 0.26 + 0.5 * speedNorm : 0;
  u.uIntensity.value += (target - u.uIntensity.value) * Math.min(dt * 4, 1);
}
