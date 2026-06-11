/* ================= 第一晚 · 2D夜海行船（juice版） ================= */
"use strict";
function boatGame(){
  return new Promise(resolve=>{
    setStage(`
      <div class="game-wrap">
        <div class="hud"><span id="bg-score">回忆之光 0 / 4</span><span id="bg-warn"></span></div>
        <div class="px-wrap"><canvas class="game" id="bgc" width="226" height="143"></canvas><div class="scanlines"></div></div>
        <div class="game-tip">← → 或 拖动屏幕 移动小船 · 接住金色的光 · 避开黑色的暗礁</div>
      </div>
    `);
    sfx.waves(true); heartbeat(true, 70);
    const cv=$('bgc'), ctx=cv.getContext('2d');
    const W=678, H=429;                       /* 逻辑分辨率 */
    ctx.imageSmoothingEnabled=false;          /* 像素核心三件套之一 */
    ctx.scale(cv.width/W, cv.height/H);       /* 226x143 背板，3倍像素放大 */
    const P=new J.PSys(), cam=new J.Cam();
    let px=W/2, vx=0, tilt=0, score=0, t=0, inv=0, over=false, flash=0;
    let keyL=false, keyR=false, targetX=null;
    const ents=[];
    const bs=ART.sprite('sailor');

    const onKey=e=>{
      if(e.key==='ArrowLeft'){ keyL=e.type==='keydown'; targetX=null; }
      if(e.key==='ArrowRight'){ keyR=e.type==='keydown'; targetX=null; }
    };
    addEventListener('keydown',onKey); addEventListener('keyup',onKey);
    const toX=e=>{ const r=cv.getBoundingClientRect(); return (e.clientX-r.left)/r.width*W; };
    cv.addEventListener('pointermove',e=>{ if(e.buttons||e.pointerType==='touch') targetX=toX(e); });
    cv.addEventListener('pointerdown',e=>{ targetX=toX(e); });

    function spawn(){
      const light=Math.random()<.42;
      ents.push({x:50+Math.random()*(W-100), y:-30, v:1.5+Math.random()*1.7,
        light, ph:Math.random()*6.28, sway:.6+Math.random()*.9});
    }

    function drawSea(){
      const fl=flash>0?.5:0;
      const g=ctx.createLinearGradient(0,0,0,H);
      g.addColorStop(0,flash>0?'#1a2240':'#05060f'); g.addColorStop(1,'#0a1226');
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      ctx.fillStyle='rgba(232,203,143,.5)';
      for(let i=0;i<26;i++){ const sx=(i*97)%W, sy=(i*53)%140;
        ctx.globalAlpha=Math.min(1,.18+((t/22+i)%10)/26+fl); ctx.fillRect(sx,sy,2,2); }
      ctx.globalAlpha=1;
      ctx.beginPath(); ctx.arc(W-90,70,26,0,7);
      ctx.fillStyle='#d8cfae'; ctx.shadowColor='#d8cfae'; ctx.shadowBlur=40+fl*60; ctx.fill(); ctx.shadowBlur=0;
      ctx.fillStyle='rgba(216,207,174,.16)';
      for(let i=0;i<9;i++){
        const ry=H-128+i*13, rw=30-i*2.4+Math.sin(t/16+i*1.7)*7;
        ctx.fillRect(W-90-rw/2+Math.sin(t/23+i)*5, ry, rw, 3);
      }
      for(let r=0;r<5;r++){
        ctx.strokeStyle=`rgba(120,150,200,${.13+r*.05})`;
        ctx.lineWidth=1+r*.3;
        ctx.beginPath();
        for(let x=0;x<=W;x+=8)
          ctx.lineTo(x, H-118+r*26 + Math.sin(x/(52-r*5) + t/(26-r*3) + r*2)*(5+r*1.4));
        ctx.stroke();
      }
    }

    function loop(){
      if(over) return;
      const act=!J.frozen();
      if(act){
        t++; flash=Math.max(0,flash-1);
        if(t%52===0) spawn();
        if(Math.random()<.0015) flash=7;
        if(keyL) vx-=.6; if(keyR) vx+=.6;
        if(targetX!=null) vx+=(targetX-px)*.013;
        vx*=.9; px+=vx;
        if(px<34){ px=34; vx*=-.4; cam.hit(.12); }
        if(px>W-34){ px=W-34; vx*=-.4; cam.hit(.12); }
        if(inv>0) inv--;
      }
      tilt=J.lerp(tilt, vx*.045, .16);
      cam.update(); if(act) P.update();

      const by=H-58 + Math.sin(t/14)*3;
      if(act && Math.abs(vx)>1 && t%3===0)
        P.spawn({x:px-Math.sign(vx)*30, y:by+10, n:1, speed:.5, angle:Math.PI/2,
          spread:.8, life:34, r:2.4, color:'rgba(159,178,221,.85)'});

      cam.apply(ctx,W,H);
      drawSea();

      for(const e of ents){
        if(act){ e.y+=e.v; e.x+=Math.sin(t/30+e.ph)*e.sway*.4; }
        if(e.light){
          const pulse=7.5+Math.sin(t/9+e.ph)*2;
          ctx.beginPath(); ctx.arc(e.x,e.y,pulse,0,7);
          ctx.fillStyle='#e8cb8f'; ctx.shadowColor='#e8cb8f'; ctx.shadowBlur=24; ctx.fill(); ctx.shadowBlur=0;
          ctx.beginPath(); ctx.arc(e.x,e.y,pulse*2.1,0,7);
          ctx.strokeStyle='rgba(232,203,143,.22)'; ctx.stroke();
        } else {
          ctx.save(); ctx.translate(e.x,e.y); ctx.rotate(Math.sin(t/40+e.ph)*.06);
          ctx.beginPath(); ctx.moveTo(-17,13); ctx.lineTo(-4,-15); ctx.lineTo(5,-9); ctx.lineTo(17,13); ctx.closePath();
          ctx.fillStyle='#10131c'; ctx.strokeStyle='#26304a'; ctx.fill(); ctx.stroke();
          ctx.restore();
        }
      }

      ctx.save(); ctx.translate(px,by); ctx.rotate(tilt);
      ctx.globalAlpha = inv>0 && t%8<4 ? .4 : 1;
      ctx.beginPath(); ctx.moveTo(-34,0); ctx.quadraticCurveTo(0,26,34,0); ctx.lineTo(22,14); ctx.lineTo(-22,14); ctx.closePath();
      ctx.fillStyle='#4a3722'; ctx.fill();
      ctx.strokeStyle='#2c2014'; ctx.stroke();
      if(bs.complete&&bs.naturalWidth) ctx.drawImage(bs,-26,-64,52,61);
      ctx.globalAlpha=1; ctx.restore();

      if(act) for(let i=ents.length-1;i>=0;i--){
        const e=ents[i];
        if(e.y>H+30){ ents.splice(i,1); continue; }
        if(Math.abs(e.x-px)<32 && Math.abs(e.y-by)<26){
          if(e.light){
            score++; ents.splice(i,1);
            $('bg-score').textContent=`回忆之光 ${score} / 4`;
            J.hitstop(80); cam.punch(.07); sfx.chime();
            P.spawn({x:e.x,y:e.y,type:'ring',n:1,speed:0,life:26,r:9,color:'#e8cb8f'});
            P.spawn({x:e.x,y:e.y,n:14,speed:3,life:32,r:2.4,color:'#ffd98a',drag:.94});
            J.pop(cv, e.x/W, Math.max(.08,(e.y-26)/H), '+ 回忆之光');
            if(score>=4){ over=true; finish(); return; }
          } else if(inv<=0){
            ents.splice(i,1); inv=60;
            J.hitstop(60); cam.hit(.55); screenTear(); flash=4;
            P.spawn({x:e.x,y:e.y,type:'shard',n:9,speed:3.4,life:36,r:5,color:'#26304a',g:.18});
            P.spawn({x:px,y:by+8,n:10,speed:2.6,life:30,r:2.6,color:'rgba(159,178,221,.9)',g:.12});
            $('bg-warn').textContent='暗礁！';
            setTimeout(()=>$('bg-warn').textContent='',1200);
          }
        }
      }

      P.draw(ctx);
      cam.restore(ctx);
      requestAnimationFrame(loop);
    }

    function finish(){
      removeEventListener('keydown',onKey); removeEventListener('keyup',onKey);
      heartbeat(false); sfx.waves(false); sfx.chime(); burstCenter();
      setTimeout(resolve,1200);
    }
    loop();
  });
}
