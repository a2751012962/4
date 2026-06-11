/* ================= 游戏手感工具库（juice） =================
   工业级手感技术：trauma镜头震动(Vlambeer)、hitstop打击停顿、
   粒子系统、缓动曲线、插值。所有canvas小游戏共用。 */
"use strict";
const J = (() => {

  const ease = {
    outCubic: t => 1 - Math.pow(1 - t, 3),
    outBack: t => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
    inOut: t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
  };
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ---------- 粒子系统 ---------- */
  class PSys {
    constructor() { this.ps = []; }
    spawn(o) {
      const n = o.n ?? 8;
      for (let i = 0; i < n; i++) {
        const a = (o.angle ?? Math.random() * 6.283) + (Math.random() - .5) * (o.spread ?? 6.283);
        const sp = (o.speed ?? 2) * (.5 + Math.random() * .9);
        this.ps.push({
          x: o.x, y: o.y,
          vx: Math.cos(a) * sp + (o.vx || 0), vy: Math.sin(a) * sp + (o.vy || 0),
          g: o.g ?? 0, drag: o.drag ?? .985,
          life: o.life ?? 40, t0: o.life ?? 40,
          r: (o.r ?? 3) * (.6 + Math.random() * .8),
          color: o.color || '#e8cb8f', type: o.type || 'dot',
          rot: Math.random() * 6.28, vr: (Math.random() - .5) * .25, text: o.text
        });
      }
    }
    update() {
      this.ps = this.ps.filter(p => {
        p.x += p.vx; p.y += p.vy; p.vy += p.g;
        p.vx *= p.drag; p.vy *= p.drag; p.rot += p.vr;
        return --p.life > 0;
      });
    }
    draw(ctx) {
      for (const p of this.ps) {
        const k = p.life / p.t0;
        ctx.globalAlpha = Math.min(1, k * 1.4);
        if (p.type === 'text') {
          ctx.font = '15px "Songti SC","Noto Serif SC",serif';
          ctx.fillStyle = p.color; ctx.textAlign = 'center';
          ctx.fillText(p.text, p.x, p.y);
        } else if (p.type === 'ring') {
          ctx.strokeStyle = p.color; ctx.lineWidth = 2.5 * k;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (2.6 - k * 2), 0, 7); ctx.stroke();
        } else if (p.type === 'shard') {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
          ctx.fillStyle = p.color; ctx.fillRect(-p.r, -p.r * .4, p.r * 2, p.r * .8);
          ctx.restore();
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(.4, p.r * k), 0, 7); ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }
  }

  /* ---------- trauma镜头（震动平方衰减 + 变焦punch） ---------- */
  class Cam {
    constructor() { this.trauma = 0; this.x = 0; this.y = 0; this.zoom = 1; this.zt = 0; }
    hit(n) { this.trauma = Math.min(1, this.trauma + n); }
    punch(n = .06) { this.zt = Math.min(.25, this.zt + n); }
    update() {
      const s = this.trauma * this.trauma;
      this.x = (Math.random() * 2 - 1) * 16 * s;
      this.y = (Math.random() * 2 - 1) * 11 * s;
      this.trauma = Math.max(0, this.trauma - .028);
      this.zoom = 1 + this.zt; this.zt *= .86;
    }
    apply(ctx, W, H) {
      ctx.save();
      ctx.translate(W / 2 + this.x, H / 2 + this.y);
      ctx.scale(this.zoom, this.zoom);
      ctx.translate(-W / 2, -H / 2);
    }
    restore(ctx) { ctx.restore(); }
  }

  /* ---------- hitstop ---------- */
  let frozenUntil = 0;
  const hitstop = ms => { frozenUntil = performance.now() + ms; };
  const frozen = () => performance.now() < frozenUntil;

  /* DOM飘字（像素分辨率下中文画进canvas会糊，浮在上层） */
  const pop=(cv,xr,yr,text,color)=>{
    const r=cv.getBoundingClientRect();
    const d=document.createElement('div');
    d.className='jpop'; d.textContent=text;
    d.style.left=(r.left+xr*r.width)+'px';
    d.style.top=(r.top+yr*r.height)+'px';
    if(color) d.style.color=color;
    document.body.appendChild(d);
    setTimeout(()=>d.remove(),1500);
  };

  return { ease, lerp, PSys, Cam, hitstop, frozen, pop };
})();
