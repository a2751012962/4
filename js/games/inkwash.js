/* ================= 创意环节 · 水墨流云（移植自 shuimo-liuyun 演示站，适配本项目）
   宣纸落墨 + 墨色晕染扩散 + 流云漂移。低压力创作环节：随手都成画，墨气满或「收笔」即结束。
   复用：sfx(core) / J.PSys(juice) / burst(fx)。平滑渲染（区别于像素小游戏，更贴近水墨质感）。 */
"use strict";
function inkwashGame(){
  return new Promise(resolve=>{
    const C = (CONFIG.inkwash||{});
    const GOAL = 100, revealChar = C.revealChar || "云";
    setStage(`
      <div class="game-wrap">
        <div class="hud"><span id="ink-score">墨气 0 / ${GOAL}</span><span id="ink-cloud">流云 · 起</span></div>
        <canvas class="game ink" id="inkc" width="680" height="430"></canvas>
        <div class="game-tip">${C.tip || "在宣纸上拖动 / 触摸落墨 · 笔走则云生 · 墨气渐满，可随时「收笔」"}</div>
        <button class="btn" id="ink-done" style="margin-top:10px;font-size:14px;padding:9px 30px;">收 笔</button>
      </div>
    `);
    const cv=$('inkc'), ctx=cv.getContext('2d');
    const W=cv.width, H=cv.height;
    /* 持久墨层：笔触累积、不逐帧清除 */
    const ink=document.createElement('canvas'); ink.width=W; ink.height=H;
    const ictx=ink.getContext('2d');
    const P=new J.PSys();
    let score=0, over=false, t=0, last=null, sinceNote=0, sinceTick=0, doneShown=false;
    sfx.drone(true);

    /* ---- 流云：若干漂移的柔灰墨晕 ---- */
    const clouds=[];
    function addCloud(){
      clouds.push({ x:-160, y:40+Math.random()*(H-120), s:.7+Math.random()*1.1,
        v:.18+Math.random()*.4, a:.10+Math.random()*.12, ph:Math.random()*6.28,
        puffs:3+Math.floor(Math.random()*3) });
    }
    for(let i=0;i<3;i++){ addCloud(); clouds[i].x=Math.random()*W; }

    /* ---- 落墨：主墨团 + 晕染光晕 + 飞白溅点 ---- */
    function stamp(x,y,press){
      const r=8+press*10;
      let g=ictx.createRadialGradient(x,y,0,x,y,r*2.4);
      g.addColorStop(0,'rgba(22,20,26,.42)'); g.addColorStop(.5,'rgba(28,26,34,.16)'); g.addColorStop(1,'rgba(40,38,48,0)');
      ictx.fillStyle=g; ictx.beginPath(); ictx.arc(x,y,r*2.4,0,7); ictx.fill();
      ictx.fillStyle='rgba(16,14,20,.55)'; ictx.beginPath(); ictx.arc(x,y,r*.7,0,7); ictx.fill();
      for(let i=0;i<3;i++){ /* 飞白：周围零星墨点 */
        const a=Math.random()*6.28, d=r*(1.4+Math.random()*1.6);
        ictx.globalAlpha=.10+Math.random()*.14;
        ictx.beginPath(); ictx.arc(x+Math.cos(a)*d, y+Math.sin(a)*d, .8+Math.random()*1.8,0,7); ictx.fill();
        ictx.globalAlpha=1;
      }
    }

    const toXY=e=>{ const b=cv.getBoundingClientRect();
      return [ (e.clientX-b.left)/b.width*W, (e.clientY-b.top)/b.height*H ]; };
    function paintTo(x,y){
      if(last){
        const dx=x-last[0], dy=y-last[1], dist=Math.hypot(dx,dy);
        const steps=Math.max(1,Math.floor(dist/5));
        for(let i=1;i<=steps;i++){
          const px=last[0]+dx*i/steps, py=last[1]+dy*i/steps;
          stamp(px,py, Math.min(1,dist/22));
          if(score<GOAL){ score=Math.min(GOAL,score+0.7); }
        }
        if(score<GOAL) $('ink-score').textContent=`墨气 ${Math.round(score)} / ${GOAL}`;
        /* 笔走则云生 + 墨点飞溅 */
        if(sinceTick++%3===0){ sfx.tick();
          P.spawn({x,y,n:2,speed:1.1,life:26,r:2.2,color:'rgba(36,34,44,.7)',g:.04,drag:.93}); }
        if(sinceNote++%26===0){ addCloud(); sfx.note(392+Math.random()*120,.6,.05);
          $('ink-cloud').textContent='流云 · 生'; }
        if(score>=GOAL && !over){ over=true; finish(); }
      }
      last=[x,y];
    }

    const onDown=e=>{ if(over)return; e.preventDefault(); last=null; const [x,y]=toXY(e); paintTo(x,y); paintTo(x,y); };
    const onMove=e=>{ if(over||!(e.buttons||e.pointerType==='touch'))return; e.preventDefault(); const [x,y]=toXY(e); paintTo(x,y); };
    const onUp=()=>{ last=null; };
    cv.addEventListener('pointerdown',onDown);
    cv.addEventListener('pointermove',onMove);
    addEventListener('pointerup',onUp);

    function loop(){
      if(over && doneShown) return;
      t++;
      /* 宣纸底色 */
      const pg=ctx.createLinearGradient(0,0,0,H);
      pg.addColorStop(0,'#ece2cc'); pg.addColorStop(1,'#ddd0b4');
      ctx.fillStyle=pg; ctx.fillRect(0,0,W,H);
      /* 纸纹斑驳 */
      ctx.globalAlpha=.04; ctx.fillStyle='#7a6c4a';
      for(let i=0;i<40;i++){ const sx=(i*149)%W, sy=(i*97)%H; ctx.fillRect(sx,sy,1,1); }
      ctx.globalAlpha=1;
      /* 浮现的水印字（随墨气渐显） */
      const rv=score/GOAL;
      ctx.globalAlpha=.05+rv*.22; ctx.fillStyle='#1a1620';
      ctx.font='240px "Songti SC","Noto Serif SC",serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(revealChar, W/2, H/2+12); ctx.globalAlpha=1;
      /* 墨层 */
      ctx.drawImage(ink,0,0);
      /* 流云漂移（覆于墨上，似薄雾） */
      for(const c of clouds){
        c.x+=c.v*(over?2.4:1); c.ph+=.01;
        const cy=c.y+Math.sin(c.ph)*8;
        for(let i=0;i<c.puffs;i++){
          const ox=i*46*c.s-(c.puffs*23*c.s), rr=(34+i%2*16)*c.s;
          const g=ctx.createRadialGradient(c.x+ox,cy,0,c.x+ox,cy,rr);
          g.addColorStop(0,`rgba(70,68,82,${c.a})`); g.addColorStop(1,'rgba(70,68,82,0)');
          ctx.fillStyle=g; ctx.beginPath(); ctx.arc(c.x+ox,cy,rr,0,7); ctx.fill();
        }
        if(c.x>W+180){ c.x=-180; c.y=40+Math.random()*(H-120); }
      }
      P.update(); P.draw(ctx);
      requestAnimationFrame(loop);
    }

    function finish(){
      $('ink-score').textContent=`墨气 ${GOAL} / ${GOAL}`;
      $('ink-cloud').textContent='流云 · 满';
      const b=$('ink-done'); if(b) b.textContent='收 笔 ✓';
      cv.removeEventListener('pointerdown',onDown);
      cv.removeEventListener('pointermove',onMove);
      removeEventListener('pointerup',onUp);
      sfx.chime(); burstCenter(); sfx.drone(false);
      setTimeout(()=>{ over=true; doneShown=true; resolve(); },1400);
    }

    $('ink-done').onclick=()=>{ if(over)return; over=true; finish(); };
    loop();
  });
}
