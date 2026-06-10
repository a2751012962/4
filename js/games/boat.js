/* ================= 第一晚 · 2D夜海行船 ================= */
function boatGame(){
  return new Promise(resolve=>{
    setStage(`
      <div class="game-wrap">
        <div class="hud"><span id="bg-score">回忆之光 0 / 4</span><span id="bg-warn"></span></div>
        <canvas class="game" id="bgc" width="680" height="430"></canvas>
        <div class="game-tip">← → 或 拖动屏幕 移动小船 · 接住金色的光 · 避开黑色的暗礁</div>
      </div>
    `);
    sfx.waves(true); heartbeat(true, 70);
    const cv=$('bgc'), ctx=cv.getContext('2d');
    const W=cv.width, H=cv.height;
    let px=W/2, score=0, t=0, inv=0, over=false;
    let keyL=false, keyR=false;
    const ents=[];
    const onKey=e=>{ if(e.key==='ArrowLeft')keyL=e.type==='keydown'; if(e.key==='ArrowRight')keyR=e.type==='keydown'; };
    addEventListener('keydown',onKey); addEventListener('keyup',onKey);
    cv.addEventListener('pointermove',e=>{ const r=cv.getBoundingClientRect(); px=(e.clientX-r.left)/r.width*W; });
    cv.addEventListener('pointerdown',e=>{ const r=cv.getBoundingClientRect(); px=(e.clientX-r.left)/r.width*W; });
    function spawn(){
      const light=Math.random()<.42;
      ents.push({x:40+Math.random()*(W-80), y:-30, v:1.6+Math.random()*1.6, light});
    }
    function loop(){
      if(over) return;
      t++;
      if(t%55===0) spawn();
      if(keyL) px-=6; if(keyR) px+=6;
      px=Math.max(30,Math.min(W-30,px));
      // 背景
      const g=ctx.createLinearGradient(0,0,0,H);
      g.addColorStop(0,'#05060f'); g.addColorStop(1,'#0a1226');
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      ctx.fillStyle='rgba(232,203,143,.5)';
      for(let i=0;i<26;i++){ const sx=(i*97)%W, sy=(i*53)%140; ctx.globalAlpha=.2+((t/20+i)%10)/22; ctx.fillRect(sx,sy,2,2); }
      ctx.globalAlpha=1;
      // 月亮
      ctx.beginPath(); ctx.arc(W-90,70,26,0,7); ctx.fillStyle='#d8cfae'; ctx.shadowColor='#d8cfae'; ctx.shadowBlur=40; ctx.fill(); ctx.shadowBlur=0;
      // 海浪线
      ctx.strokeStyle='rgba(120,150,200,.25)';
      for(let r=0;r<5;r++){ ctx.beginPath();
        for(let x=0;x<=W;x+=8){ ctx.lineTo(x, H-120+r*26 + Math.sin(x/46 + t/22 + r)*6); } ctx.stroke(); }
      // 实体
      for(const e of ents){
        e.y+=e.v;
        if(e.light){
          ctx.beginPath(); ctx.arc(e.x,e.y,9,0,7);
          ctx.fillStyle='#e8cb8f'; ctx.shadowColor='#e8cb8f'; ctx.shadowBlur=22; ctx.fill(); ctx.shadowBlur=0;
        } else {
          ctx.beginPath(); ctx.moveTo(e.x-16,e.y+12); ctx.lineTo(e.x,e.y-14); ctx.lineTo(e.x+16,e.y+12); ctx.closePath();
          ctx.fillStyle='#10131c'; ctx.strokeStyle='#26304a'; ctx.fill(); ctx.stroke();
        }
      }
      // 船
      const by=H-58 + Math.sin(t/14)*3;
      ctx.beginPath(); ctx.moveTo(px-34,by); ctx.quadraticCurveTo(px,by+26,px+34,by); ctx.lineTo(px+22,by+14); ctx.lineTo(px-22,by+14); ctx.closePath();
      ctx.fillStyle= inv>0 && t%8<4 ? '#7a5b3a' : '#4a3722'; ctx.fill();
      ctx.font='26px serif'; ctx.textAlign='center'; ctx.fillText('🧸', px, by-6);
      if(inv>0) inv--;
      // 碰撞
      for(let i=ents.length-1;i>=0;i--){
        const e=ents[i];
        if(e.y>H+30){ ents.splice(i,1); continue; }
        if(Math.abs(e.x-px)<32 && Math.abs(e.y-by)<26){
          if(e.light){ score++; $('bg-score').textContent=`回忆之光 ${score} / 4`;
            burst((e.x/W)*cv.getBoundingClientRect().width+cv.getBoundingClientRect().left, cv.getBoundingClientRect().top+e.y/H*cv.getBoundingClientRect().height, 14);
            sfx.chime(); ents.splice(i,1);
            if(score>=4){ over=true; finish(); return; }
          } else if(inv<=0){ shake(); screenTear(); inv=60; $('bg-warn').textContent='暗礁！'; setTimeout(()=>$('bg-warn').textContent='',1200); ents.splice(i,1); }
        }
      }
      requestAnimationFrame(loop);
    }
    function finish(){
      removeEventListener('keydown',onKey); removeEventListener('keyup',onKey);
      heartbeat(false); sfx.waves(false); sfx.chime(); burstCenter();
      setTimeout(resolve, 1200);
    }
    loop();
  });
}
