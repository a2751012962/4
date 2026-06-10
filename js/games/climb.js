/* ================= 第二晚 · 2.5D雾墙追逐跑酷 ================= */
function climbGame(){
  return new Promise(resolve=>{
    setStage(`
      <div class="game-wrap">
        <div class="hud"><span id="cg-d">距山顶 100%</span><span id="cg-w" style="color:#c0584a;"></span></div>
        <canvas class="game" id="cgc" width="680" height="430"></canvas>
        <div class="game-tip">空格 / 点击屏幕 跳跃 · 跨过山岩 · <b style="color:#c0584a;">身后的雾正在追你</b></div>
      </div>
    `);
    heartbeat(true, 95);
    const cv=$('cgc'), ctx=cv.getContext('2d');
    const W=cv.width, H=cv.height, GY=H-70;
    let t=0, dist=0, GOAL=3000, speed=3.4;
    let y=GY, vy=0, jumping=false, over=false;
    let fog=-260; // 雾墙x
    const rocks=[];
    function jump(){ if(!jumping){ vy=-12.5; jumping=true; sfx.tick(); } }
    const onKey=e=>{ if(e.code==='Space'){ e.preventDefault(); jump(); } };
    addEventListener('keydown',onKey);
    cv.addEventListener('pointerdown',jump);
    function loop(){
      if(over) return;
      t++; dist+=speed;
      if(t%75===0) rocks.push({x:W+40, w:26+Math.random()*22, h:30+Math.random()*34});
      // 物理
      vy+=.62; y+=vy;
      if(y>=GY){ y=GY; vy=0; jumping=false; }
      // 雾墙推进/被撞减速时雾逼近
      fog += .55;
      // 背景 2.5D 视差
      const g=ctx.createLinearGradient(0,0,0,H);
      g.addColorStop(0,'#0a0d16'); g.addColorStop(1,'#141008');
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#11141f';
      for(let i=0;i<5;i++){ const mx=((i*260)-(dist*.18)%260); peak(mx,H-110,170,90,'#10131c'); }
      for(let i=0;i<5;i++){ const mx=((i*230)-(dist*.45)%230); peak(mx,H-86,130,120,'#171307'); }
      function peak(x,base,w,h,c){ ctx.beginPath(); ctx.moveTo(x-w,base); ctx.lineTo(x,base-h); ctx.lineTo(x+w,base); ctx.closePath(); ctx.fillStyle=c; ctx.fill(); }
      // 地面
      ctx.fillStyle='#1a1409'; ctx.fillRect(0,GY+18,W,H);
      ctx.strokeStyle='#2c2516'; ctx.beginPath(); ctx.moveTo(0,GY+18); ctx.lineTo(W,GY+18); ctx.stroke();
      // 岩石
      for(let i=rocks.length-1;i>=0;i--){
        const r=rocks[i]; r.x-=speed;
        ctx.beginPath(); ctx.moveTo(r.x-r.w,GY+18); ctx.lineTo(r.x,GY+18-r.h); ctx.lineTo(r.x+r.w,GY+18); ctx.closePath();
        ctx.fillStyle='#241d12'; ctx.strokeStyle='#46392055'; ctx.fill(); ctx.stroke();
        if(r.x<-60) rocks.splice(i,1);
        else if(Math.abs(r.x-130)<r.w-4 && y>GY-r.h+6){ // 撞上
          shake(); screenTear(); rocks.splice(i,1); fog+=90;
          $('cg-w').textContent='雾，扑近了！';
          setTimeout(()=>$('cg-w').textContent='',1300);
        }
      }
      // 主角
      ctx.font='30px serif'; ctx.textAlign='center';
      ctx.fillText('🧸', 130, y+12 + (jumping?0:Math.sin(t/5)*1.5));
      ctx.font='13px serif'; ctx.fillText('🏮',152, y-8);
      // 雾墙
      const fg=ctx.createLinearGradient(fog-180,0,fog+60,0);
      fg.addColorStop(0,'rgba(140,30,30,.5)'); fg.addColorStop(.7,'rgba(70,20,20,.85)'); fg.addColorStop(1,'transparent');
      ctx.fillStyle=fg; ctx.fillRect(fog-200,0,260,H);
      const danger = fog > 40;
      redAlert(danger);
      if(danger) heartbeat(true,130);
      if(fog>118){ // 被追上：不死，拉回+剧情减压
        fog=-200; redAlert(false); heartbeat(true,95);
        whisper("徒步熊一把拽住你：「抓紧我！」", true);
        shake();
      }
      // 进度
      const left=Math.max(0, Math.round(100-dist/GOAL*100));
      $('cg-d').textContent=`距山顶 ${left}%`;
      if(dist>=GOAL){ over=true; finish(); return; }
      requestAnimationFrame(loop);
    }
    function finish(){
      removeEventListener('keydown',onKey);
      redAlert(false); heartbeat(false); sfx.chime(); burstCenter();
      setTimeout(resolve,1200);
    }
    loop();
  });
}
