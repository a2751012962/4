/* ================= 第二晚 · 2.5D雾墙追逐（juice版：土狼时间/跳跃缓冲/挤压拉伸） ================= */
"use strict";
function climbGame(){
  return new Promise(resolve=>{
    setStage(`
      <div class="game-wrap">
        <div class="hud"><span id="cg-d">距山顶 100%</span><span id="cg-w" style="color:#c0584a;"></span></div>
        <div class="px-wrap"><canvas class="game" id="cgc" width="226" height="143"></canvas><div class="scanlines"></div></div>
        <div class="game-tip">空格 / 按住屏幕 跳跃（按得越久跳得越高）· <b style="color:#c0584a;">身后的雾正在追你</b></div>
      </div>
    `);
    heartbeat(true, 95);
    const cv=$('cgc'), ctx=cv.getContext('2d');
    const W=678, H=429, GY=H-70, PX=130;
    ctx.imageSmoothingEnabled=false;
    ctx.scale(cv.width/W, cv.height/H);
    const P=new J.PSys(), cam=new J.Cam();
    let t=0, dist=0, over=false;
    const GOAL=3000, speed=3.4;
    let y=GY, vy=0, grounded=true;
    let coyote=0, buffer=0, holding=false;       /* 土狼时间 / 跳跃缓冲 / 可变跳高 */
    let sx=1, sy=1, rot=0;                       /* 挤压拉伸 / 受击翻滚 */
    let fog=-260, flagsHit=[false,false,false];
    const rocks=[], hb=ART.sprite('hiker');

    const press=()=>{ holding=true; buffer=8; };
    const release=()=>{ holding=false; if(vy<-4.5) vy=-4.5; };  /* 提前松手=矮跳 */
    const onKey=e=>{ if(e.code==='Space'){ e.preventDefault();
      if(e.type==='keydown'&&!e.repeat) press(); if(e.type==='keyup') release(); } };
    addEventListener('keydown',onKey); addEventListener('keyup',onKey);
    cv.addEventListener('pointerdown',press);
    addEventListener('pointerup',release);

    const peak=(x,base,w,h,c)=>{ ctx.beginPath(); ctx.moveTo(x-w,base);
      ctx.lineTo(x,base-h); ctx.lineTo(x+w,base); ctx.closePath(); ctx.fillStyle=c; ctx.fill(); };

    function dust(n,spd){ P.spawn({x:PX,y:GY+16,n,speed:spd,angle:-Math.PI/2,spread:2.2,
      life:26,r:2.6,color:'rgba(180,160,120,.65)',g:.12,drag:.92}); }

    function loop(){
      if(over) return;
      const act=!J.frozen();
      if(act){
        t++; dist+=speed;
        if(t%72===0) rocks.push({x:W+40, w:24+Math.random()*22, h:28+Math.random()*34});
        if(t%5===0) P.spawn({x:W+10,y:40+Math.random()*220,n:1,speed:0,vx:-(2+Math.random()*2),
          life:50,r:1.4,color:'rgba(200,210,235,.4)',drag:1});            /* 风丝 */

        /* 平台手感三件套 */
        coyote=grounded?8:Math.max(0,coyote-1);
        buffer=Math.max(0,buffer-1);
        if(buffer>0 && (grounded||coyote>0)){
          vy=-12.6; grounded=false; coyote=0; buffer=0;
          sx=.82; sy=1.22; sfx.tick(); dust(6,1.6);
        }
        vy+=holding&&vy<0?.5:.78;                /* 按住上升更久 */
        y+=vy;
        if(y>=GY){
          if(!grounded){ sx=1.28; sy=.74; dust(Math.min(12,Math.abs(vy)*1.4),2.2);
            if(vy>9) cam.hit(.12); }
          y=GY; vy=0; grounded=true;
        } else grounded=false;
        if(grounded && t%9===0 ) dust(1,.9);     /* 跑步扬尘 */
        sx=J.lerp(sx,1,.18); sy=J.lerp(sy,1,.18); rot=J.lerp(rot,0,.1);
        fog+=.55;
      }
      cam.update(); if(act) P.update();

      cam.apply(ctx,W,H);
      const g=ctx.createLinearGradient(0,0,0,H);
      g.addColorStop(0,'#0a0d16'); g.addColorStop(1,'#141008');
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      for(let i=0;i<6;i++) peak(((i*260)-(dist*.14)%260), H-114, 175, 86, '#0e111a');
      for(let i=0;i<6;i++) peak(((i*230)-(dist*.32)%230), H-96, 140, 110, '#11131e');
      for(let i=0;i<6;i++) peak(((i*210)-(dist*.6)%210), H-82, 120, 126, '#171307');
      ctx.fillStyle='#1a1409'; ctx.fillRect(0,GY+18,W,H);
      ctx.strokeStyle='#2c2516'; ctx.beginPath(); ctx.moveTo(0,GY+18); ctx.lineTo(W,GY+18); ctx.stroke();

      /* 里程旗 */
      [.25,.5,.75].forEach((m,i)=>{
        const fx=W+ (GOAL*m-dist);
        if(fx>-30&&fx<W+30){
          ctx.strokeStyle='#6e5639'; ctx.lineWidth=3;
          ctx.beginPath(); ctx.moveTo(fx,GY+18); ctx.lineTo(fx,GY-26); ctx.stroke();
          ctx.fillStyle='#cdb27a';
          ctx.beginPath(); ctx.moveTo(fx,GY-26); ctx.lineTo(fx+20,GY-19); ctx.lineTo(fx,GY-12); ctx.closePath(); ctx.fill();
        }
        if(act && !flagsHit[i] && dist>=GOAL*m){
          flagsHit[i]=true; sfx.chime(); cam.punch(.05);
          J.pop(cv, PX/W, Math.max(.08,(y-70)/H), ['翻过一座山','过半了！','山顶就在前面'][i]);
        }
      });

      /* 岩石 */
      if(act) for(let i=rocks.length-1;i>=0;i--){
        const r=rocks[i]; r.x-=speed;
        if(r.x<-60){ rocks.splice(i,1); continue; }
        if(Math.abs(r.x-PX)<r.w-4 && y>GY-r.h+6){
          rocks.splice(i,1);
          J.hitstop(60); cam.hit(.5); screenTear(); rot=.9; fog+=90;
          P.spawn({x:PX,y:y,type:'shard',n:8,speed:3,life:34,r:4.5,color:'#241d12',g:.2});
          $('cg-w').textContent='雾，扑近了！';
          setTimeout(()=>{ const w=$('cg-w'); if(w) w.textContent=''; },1300);
        }
      }
      for(const r of rocks){
        ctx.beginPath(); ctx.moveTo(r.x-r.w,GY+18); ctx.lineTo(r.x,GY+18-r.h); ctx.lineTo(r.x+r.w,GY+18); ctx.closePath();
        ctx.fillStyle='#241d12'; ctx.strokeStyle='#46392055'; ctx.fill(); ctx.stroke();
      }

      /* 主角：挤压拉伸 + 翻滚 */
      ctx.save(); ctx.translate(PX, y+12); ctx.rotate(rot); ctx.scale(sx,sy);
      const bobY=grounded?Math.sin(t/5)*1.5:0;
      if(hb.complete&&hb.naturalWidth) ctx.drawImage(hb,-28,-56+bobY,56,66);
      ctx.beginPath(); ctx.arc(30,-26+bobY,6,0,7);
      ctx.fillStyle='#ffd98a'; ctx.shadowColor='#ffd98a'; ctx.shadowBlur=16; ctx.fill(); ctx.shadowBlur=0;
      ctx.restore();

      /* 雾墙：卷须边缘 */
      const fg=ctx.createLinearGradient(fog-180,0,fog+60,0);
      fg.addColorStop(0,'rgba(140,30,30,.5)'); fg.addColorStop(.7,'rgba(70,20,20,.85)'); fg.addColorStop(1,'transparent');
      ctx.fillStyle=fg; ctx.fillRect(fog-200,0,260,H);
      ctx.fillStyle='rgba(120,28,28,.45)';
      for(let i=0;i<7;i++){
        const ty=i*64+(t*1.3)%64;
        ctx.beginPath(); ctx.ellipse(fog+50+Math.sin(t/14+i*2)*16, ty, 26, 13, 0, 0, 7); ctx.fill();
      }
      P.draw(ctx);
      cam.restore(ctx);

      const danger=fog>40;
      redAlert(danger);
      if(danger) heartbeat(true,130);
      if(act && fog>118){
        fog=-200; redAlert(false); heartbeat(true,95);
        whisper("徒步熊一把拽住你：「抓紧我！」", true);
        cam.hit(.4);
      }
      const left=Math.max(0, Math.round(100-dist/GOAL*100));
      $('cg-d').textContent=`距山顶 ${left}%`;
      if(dist>=GOAL){ over=true; finish(); return; }
      requestAnimationFrame(loop);
    }

    function finish(){
      removeEventListener('keydown',onKey); removeEventListener('keyup',onKey);
      removeEventListener('pointerup',release);
      redAlert(false); heartbeat(false); sfx.chime(); burstCenter();
      setTimeout(resolve,1200);
    }
    loop();
  });
}
