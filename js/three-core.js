/* ================= Three.js 公共层（T3） =================
   四个小游戏共用：渲染器工厂（像素模式/高清模式）、中文纹理、
   ART精灵纹理、trauma镜头震动、轻量3D粒子、资源释放。
   依赖：js/vendor/three.min.js（r128 UMD 全局 THREE） */
"use strict";
const T3 = (() => {

  /* ---------- 渲染器工厂 ----------
     pixel:true  → 低分辨率背板（226x143），CSS放大+image-rendering:pixelated，
                   与2D像素画一致的 PS1 质感
     pixel:false → 按容器尺寸高清渲染（走廊/暗房需要可读文字） */
  function makeView(canvas, { pixel = true, w = 226, h = 143 } = {}) {
    const renderer = new THREE.WebGLRenderer({
      canvas, antialias: !pixel, alpha: false,
      powerPreference: 'low-power'
    });
    renderer.setPixelRatio(1);
    if (pixel) {
      renderer.setSize(w, h, false);          /* 不动CSS，交给 .game 类放大 */
    } else {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(2, devicePixelRatio || 1);
      renderer.setSize(Math.round(r.width * dpr), Math.round(r.height * dpr), false);
    }
    return renderer;
  }

  /* ---------- 中文canvas纹理 ----------
     vertical:true 时逐字竖排（走廊符文用） */
  function textTexture(text, { size = 28, color = '#d8c694', font = '"Songti SC","Noto Serif SC",serif',
    vertical = false, lineHeight = 1.35, pad = 8, glow = 0, maxChars = 0 } = {}) {
    const cv = document.createElement('canvas');
    const ctx = cv.getContext('2d');
    const f = `${size}px ${font}`;
    let lines;
    if (vertical) lines = [...text];
    else if (maxChars > 0) {
      lines = [];
      for (let i = 0; i < text.length; i += maxChars) lines.push(text.slice(i, i + maxChars));
    } else lines = [text];
    ctx.font = f;
    const wMax = vertical ? size : Math.max(...lines.map(l => ctx.measureText(l).width));
    cv.width = Math.ceil(wMax + pad * 2 + glow * 2);
    cv.height = Math.ceil(size * lineHeight * lines.length + pad * 2 + glow * 2);
    ctx.font = f; ctx.fillStyle = color; ctx.textBaseline = 'top';
    if (glow) { ctx.shadowColor = color; ctx.shadowBlur = glow; }
    lines.forEach((l, i) => ctx.fillText(l, pad + glow, pad + glow + i * size * lineHeight));
    const tex = new THREE.CanvasTexture(cv);
    tex.minFilter = THREE.LinearFilter;
    return { tex, w: cv.width, h: cv.height };
  }

  /* 文本面片（默认不受光照，自发光风格） */
  function textPlane(text, opts = {}) {
    const { tex, w, h } = textTexture(text, opts);
    const scale = opts.scale ?? .02;
    const mat = new THREE.MeshBasicMaterial({
      map: tex, transparent: true,
      opacity: opts.opacity ?? 1, depthWrite: false,
      side: opts.side ?? THREE.FrontSide
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w * scale, h * scale), mat);
    mesh.userData.pxSize = { w, h };
    return mesh;
  }

  /* ---------- ART SVG精灵 → Sprite ---------- */
  function artSprite(key, scale = 3) {
    const img = ART.sprite(key);
    const tex = new THREE.Texture(img);
    tex.magFilter = THREE.NearestFilter;       /* 保持像素味 */
    tex.minFilter = THREE.NearestFilter;
    if (img.complete && img.naturalWidth) tex.needsUpdate = true;
    else img.addEventListener('load', () => { tex.needsUpdate = true; }, { once: true });
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
    sp.scale.set(scale, scale, 1);
    return sp;
  }

  /* ---------- 径向光晕纹理（发光体通用） ---------- */
  function glowTexture(color = '#e8cb8f', r = 64) {
    const cv = document.createElement('canvas'); cv.width = cv.height = r * 2;
    const ctx = cv.getContext('2d');
    const g = ctx.createRadialGradient(r, r, 0, r, r, r);
    g.addColorStop(0, color); g.addColorStop(.35, color + 'aa'); g.addColorStop(1, 'transparent');
    ctx.fillStyle = g; ctx.fillRect(0, 0, r * 2, r * 2);
    return new THREE.CanvasTexture(cv);
  }
  function glowSprite(color, scale = 2) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture(color), transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    sp.scale.set(scale, scale, 1);
    return sp;
  }

  /* ---------- trauma镜头（J.Cam 的 3D 版） ---------- */
  class Shake {
    constructor(cam) { this.cam = cam; this.trauma = 0; this.zt = 0; this.base = cam.position.clone(); this.fov0 = cam.fov; }
    hit(n) { this.trauma = Math.min(1, this.trauma + n); }
    punch(n = .06) { this.zt = Math.min(.25, this.zt + n); }
    rebase() { this.base.copy(this.cam.position); }
    update() {
      const s = this.trauma * this.trauma;
      this.cam.position.x = this.base.x + (Math.random() * 2 - 1) * .55 * s;
      this.cam.position.y = this.base.y + (Math.random() * 2 - 1) * .38 * s;
      this.trauma = Math.max(0, this.trauma - .028);
      this.cam.fov = this.fov0 / (1 + this.zt);
      this.zt *= .86;
      this.cam.updateProjectionMatrix();
    }
  }

  /* ---------- 轻量3D粒子（爆点/尘土/涟漪） ---------- */
  class Burst {
    constructor(scene, max = 220) {
      this.scene = scene; this.ps = [];
      const geo = new THREE.BufferGeometry();
      this.pos = new Float32Array(max * 3);
      this.col = new Float32Array(max * 3);
      geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
      this.mat = new THREE.PointsMaterial({
        size: .5, vertexColors: true, transparent: true,
        blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
      });
      this.points = new THREE.Points(geo, this.mat);
      this.points.frustumCulled = false;
      this.max = max;
      scene.add(this.points);
    }
    spawn({ x = 0, y = 0, z = 0, n = 10, speed = .3, color = '#ffd98a', life = 34, g = 0, spreadY = 1 }) {
      const c = new THREE.Color(color);
      for (let i = 0; i < n; i++) {
        if (this.ps.length >= this.max) this.ps.shift();
        const a = Math.random() * 6.283, b = (Math.random() - .5) * 3.14 * spreadY;
        const sp = speed * (.5 + Math.random() * .9);
        this.ps.push({
          x, y, z,
          vx: Math.cos(a) * Math.cos(b) * sp, vy: Math.sin(b) * sp, vz: Math.sin(a) * Math.cos(b) * sp * .4,
          life, t0: life, g, c
        });
      }
    }
    update() {
      let i = 0;
      this.ps = this.ps.filter(p => {
        p.x += p.vx; p.y += p.vy; p.z += p.vz; p.vy -= p.g;
        return --p.life > 0;
      });
      for (const p of this.ps) {
        const k = p.life / p.t0;
        this.pos[i * 3] = p.x; this.pos[i * 3 + 1] = p.y; this.pos[i * 3 + 2] = p.z;
        this.col[i * 3] = p.c.r * k; this.col[i * 3 + 1] = p.c.g * k; this.col[i * 3 + 2] = p.c.b * k;
        i++;
      }
      /* 把未使用的槽位挪到视野外 */
      for (let j = i; j < this.max; j++) { this.pos[j * 3 + 1] = -9999; }
      this.points.geometry.attributes.position.needsUpdate = true;
      this.points.geometry.attributes.color.needsUpdate = true;
    }
  }

  /* ---------- 释放 ---------- */
  function dispose(renderer, scene) {
    scene.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      const mats = Array.isArray(o.material) ? o.material : (o.material ? [o.material] : []);
      mats.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
    });
    renderer.dispose();
    try { renderer.forceContextLoss(); } catch (e) { }
  }

  return { makeView, textTexture, textPlane, artSprite, glowTexture, glowSprite, Shake, Burst, dispose };
})();
