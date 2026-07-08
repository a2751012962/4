/* ================= 第三晚 · 手电筒暗房 + 倒计时 ================= */
function flashlightGame(){
  return new Promise(resolve=>{
    const total=CONFIG.whispers.length;   /* 跟随配置数量，改配置不再卡关 */
    setStage(`
      <div class="game-wrap">
        <div class="hud"><span id="fg-c">低语 0 / ${total}</span><span class="countdown" id="fg-t" style="font-size:22px;">60</span></div>
        <div id="flash-room"><div id="flash-mask"></div></div>
        <div class="game-tip">移动手电筒的光，把藏在黑暗里的${total}句低语全部照出来<br>守则补充：光熄灭前，必须找齐。</div>
      </div>
    `);
    heartbeat(true,85); sfx.drone(true);
    const room=$('flash-room'), mask=$('flash-mask');
    let found=0, time=60, overFlag=false;
    const spots=[];
    CONFIG.whispers.forEach((w,i)=>{
      const d=document.createElement('div'); d.className='fw'; d.textContent=w;
      const x=6+Math.random()*44, ys=8+ (i*(78/Math.max(1,total)))+Math.random()*6;
      d.style.left=x+'%'; d.style.top=ys+'%';
      room.appendChild(d); spots.push({el:d, found:false});
    });
    /* 位置固定，缓存几何信息，避免每次pointermove强制重排 */
    let roomRect=null;
    const recalc=()=>{ roomRect=room.getBoundingClientRect();
      spots.forEach(s=>{ const sr=s.el.getBoundingClientRect();
        s.cx=sr.left-roomRect.left+sr.width/2; s.cy=sr.top-roomRect.top+sr.height/2;
        s.px=sr.left+sr.width/2; s.py=sr.top+sr.height/2; }); };
    addEventListener('resize',recalc);
    let lx=-999, ly=-999, fl=0;
    function paint(){
      const r=95+Math.sin(fl/7)*5+(Math.random()<.02?-22:0);   /* 光晕呼吸+偶尔骤暗 */
      mask.style.background=`radial-gradient(circle ${r}px at ${lx}px ${ly}px, transparent 0, rgba(2,2,1,.45) ${r*.72}px, rgba(2,2,1,.985) ${r*1.55}px)`;
    }
    const breathTimer=setInterval(()=>{ fl++; paint(); },90);
    /* 黑暗角落的眼睛：被照到就消失 */
    const eyes=document.createElement('div');
    eyes.style.cssText='position:absolute;display:flex;gap:9px;transition:opacity 1s;';
    eyes.innerHTML='<i style="width:5px;height:7px;border-radius:50%;background:#cdb27a;box-shadow:0 0 8px #cdb27a;"></i><i style="width:5px;height:7px;border-radius:50%;background:#cdb27a;box-shadow:0 0 8px #cdb27a;"></i>';
    eyes.style.left=(60+Math.random()*30)+'%'; eyes.style.top=(70+Math.random()*20)+'%';
    room.appendChild(eyes);
    let eyesGone=false, eyesC=null;
    recalc(); paint();
    function onMove(e){
      if(overFlag || !roomRect) return;
      const cx=(e.touches?e.touches[0].clientX:e.clientX)-roomRect.left;
      const cy=(e.touches?e.touches[0].clientY:e.clientY)-roomRect.top;
      lx=cx; ly=cy; paint();
      if(!eyesGone){
        if(!eyesC){ const er=eyes.getBoundingClientRect();
          eyesC={x:er.left-roomRect.left+10, y:er.top-roomRect.top+4}; }
        if(Math.hypot(eyesC.x-cx, eyesC.y-cy)<110){
          eyesGone=true; eyes.style.opacity=0;
          whisper("（那双眼睛……是在看你，还是在守着你？）");
          setTimeout(()=>eyes.remove(),1100);
        }
      }
      spots.forEach(s=>{
        if(s.found) return;
        if(Math.hypot(s.cx-cx,s.cy-cy)<95){
          s.found=true; found++;
          s.el.style.opacity='';   /* 清掉“施舍”时的内联透明度，否则 .found 的高亮永远盖不上去 */
          s.el.classList.add('found');
          $('fg-c').textContent=`低语 ${found} / ${total}`;
          sfx.chime(); burst(s.px, s.py, 10);
          if(found>=total && !overFlag){ overFlag=true; finish(); }
        }
      });
    }
    room.addEventListener('pointermove',onMove);
    room.addEventListener('pointerdown',onMove);
    const timer=setInterval(()=>{
      if(overFlag) return;
      const tEl=$('fg-t');
      if(!tEl){ clearInterval(timer); clearInterval(breathTimer); heartbeat(false); redAlert(false);
        sfx.drone(false); removeEventListener('resize',recalc); return; }  /* 舞台已被替换：自愈清理（连同环境音与resize监听） */
      time--;
      tEl.textContent=time;
      if(time===20){ redAlert(true); heartbeat(true,120); whisper("（光，在变弱……）"); }
      if(time<=10) tEl.style.fontSize='30px';
      if(time<=0){ // 不惩罚：旅馆“施舍”一次
        time=30; redAlert(false); heartbeat(true,85);
        shake(); screenTear();
        whisper("连体衣熊：「再来。这次我陪你一起找。」", true);
        spots.forEach(s=>{ if(!s.found){ s.el.style.opacity=.12; } }); // 微微显形帮她
      }
    },1000);
    function finish(){
      clearInterval(timer); clearInterval(breathTimer);
      room.removeEventListener('pointermove',onMove); room.removeEventListener('pointerdown',onMove);
      removeEventListener('resize',recalc);
      redAlert(false); heartbeat(false); sfx.drone(false);
      room.style.cursor='default';
      mask.style.background='transparent'; sfx.chime(); burstCenter();
      setTimeout(resolve,1400);
    }
  });
}
