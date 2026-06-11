/* ================= 第三晚 · 手电筒暗房 + 倒计时 ================= */
function flashlightGame(){
  return new Promise(resolve=>{
    setStage(`
      <div class="game-wrap">
        <div class="hud"><span id="fg-c">低语 0 / 5</span><span class="countdown" id="fg-t" style="font-size:22px;">60</span></div>
        <div id="flash-room"><div id="flash-mask"></div></div>
        <div class="game-tip">移动手电筒的光，把藏在黑暗里的五句低语全部照出来<br>守则补充：光熄灭前，必须找齐。</div>
      </div>
    `);
    heartbeat(true,85); sfx.drone(true);
    const room=$('flash-room'), mask=$('flash-mask');
    const R=room.getBoundingClientRect();
    let found=0, time=60, overFlag=false;
    const spots=[];
    CONFIG.whispers.forEach((w,i)=>{
      const d=document.createElement('div'); d.className='fw'; d.textContent=w;
      const x=6+Math.random()*52, ys=8+ (i*17)+Math.random()*6;
      d.style.left=x+'%'; d.style.top=ys+'%';
      room.appendChild(d); spots.push({el:d, found:false});
    });
    let lx=-999, ly=-999, fl=0;
    function paint(){
      const r=95+Math.sin(fl/7)*5+(Math.random()<.02?-22:0);   /* 光晕呼吸+偶尔骤暗 */
      mask.style.background=`radial-gradient(circle ${r}px at ${lx}px ${ly}px, transparent 0, rgba(2,2,1,.45) ${r*.72}px, rgba(2,2,1,.985) ${r*1.55}px)`;
    }
    setInterval(()=>{ fl++; paint(); },90);
    /* 黑暗角落的眼睛：被照到就消失 */
    const eyes=document.createElement('div');
    eyes.style.cssText='position:absolute;display:flex;gap:9px;transition:opacity 1s;';
    eyes.innerHTML='<i style="width:5px;height:7px;border-radius:50%;background:#cdb27a;box-shadow:0 0 8px #cdb27a;"></i><i style="width:5px;height:7px;border-radius:50%;background:#cdb27a;box-shadow:0 0 8px #cdb27a;"></i>';
    eyes.style.left=(60+Math.random()*30)+'%'; eyes.style.top=(70+Math.random()*20)+'%';
    room.appendChild(eyes);
    let eyesGone=false;
    paint();
    function onMove(e){
      const r=room.getBoundingClientRect();
      const cx=(e.touches?e.touches[0].clientX:e.clientX)-r.left;
      const cy=(e.touches?e.touches[0].clientY:e.clientY)-r.top;
      lx=cx; ly=cy; paint();
      if(!eyesGone){
        const er=eyes.getBoundingClientRect(), rr=room.getBoundingClientRect();
        if(Math.hypot(er.left-rr.left+10-cx, er.top-rr.top+4-cy)<110){
          eyesGone=true; eyes.style.opacity=0;
          whisper("（那双眼睛……是在看你，还是在守着你？）");
          setTimeout(()=>eyes.remove(),1100);
        }
      }
      spots.forEach(s=>{
        if(s.found) return;
        const sr=s.el.getBoundingClientRect();
        const ex=sr.left-r.left+sr.width/2, ey=sr.top-r.top+sr.height/2;
        if(Math.hypot(ex-cx,ey-cy)<95){
          s.found=true; found++; s.el.classList.add('found');
          $('fg-c').textContent=`低语 ${found} / 5`;
          sfx.chime(); burst(sr.left+sr.width/2, sr.top+sr.height/2, 10);
          if(found>=5 && !overFlag){ overFlag=true; finish(); }
        }
      });
    }
    room.addEventListener('pointermove',onMove);
    room.addEventListener('pointerdown',onMove);
    const timer=setInterval(()=>{
      if(overFlag) return;
      time--;
      $('fg-t').textContent=time;
      if(time===20){ redAlert(true); heartbeat(true,120); whisper("（光，在变弱……）"); }
      if(time<=10) $('fg-t').style.fontSize='30px';
      if(time<=0){ // 不惩罚：旅馆“施舍”一次
        time=30; redAlert(false); heartbeat(true,85);
        shake(); screenTear();
        whisper("连体衣熊：「再来。这次我陪你一起找。」", true);
        spots.forEach(s=>{ if(!s.found){ s.el.style.opacity=.12; } }); // 微微显形帮她
      }
    },1000);
    function finish(){
      clearInterval(timer); redAlert(false); heartbeat(false); sfx.drone(false);
      room.style.cursor='default';
      mask.style.background='transparent'; sfx.chime(); burstCenter();
      setTimeout(resolve,1400);
    }
  });
}
