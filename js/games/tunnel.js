/* ================= 第四晚 · 时光隧道（照片隧道，致敬 FranzLy/TimeChannel） =================
   照片环绕成一条向深处蜿蜒的3D隧道：入口是相遇，深处是现在。
   分环排布 + 正弦蜿蜒 + 镜头侧倾 + 年份路标，按住屏幕/空格加速穿行。 */
"use strict";

/* ---------- 恢复所有记忆的通道：全屏进入完整版 TimeChannel ----------
   timechannel/ 是完整复制的 FranzLy/TimeChannel（Three.js 无限照片隧道），
   构建产物已内联成单文件，file:// 双击打开也能跑。
   右上角「⊕ My Photos」可导入这四年全部照片，一张都不用少。
   WebGL 起不来 / 加载失败时，退回下面的像素版 tunnelGame()。 */
function memoryChannel(){
  return new Promise(resolve=>{
    const ov=document.createElement('div'); ov.id='tc-overlay';
    ov.innerHTML=`
      <iframe id="tc-frame" src="timechannel/dist/index.html" title="时光隧道"></iframe>
      <div id="tc-loading">正 在 打 开 时 光 隧 道 ……</div>
      <div id="tc-hint"></div>
      <button class="btn" id="tc-back">记 忆 已 全 部 恢 复 · 回 到 旅 馆</button>`;
    document.body.appendChild(ov);
    requestAnimationFrame(()=>ov.classList.add('on'));     /* 立刻给黑幕+加载文案，不留死屏 */
    const frame=$('tc-frame'), back=$('tc-back'), hint=$('tc-hint');
    let ready=false, fell=false, timer=0;
    const cleanup=()=>{ clearTimeout(timer); removeEventListener('message',onMsg); };
    const fallback=()=>{                                   /* 通道没开启 → 像素隧道 */
      if(fell||ready) return; fell=true;
      cleanup(); ov.remove();
      tunnelGame().then(resolve);
    };
    /* 自适应超时：iframe 加载完成后再给 WebGL/照片初始化留足时间（慢设备别误降级） */
    timer=setTimeout(fallback,15000);
    frame.addEventListener('load',()=>{
      if(ready||fell) return;
      clearTimeout(timer); timer=setTimeout(fallback,20000);
      /* 返回入口与 tc:ready 解耦：即便就绪消息丢失也保证玩家能离开，不被困在终章 */
      setTimeout(()=>{ if(!fell) back.classList.add('show'); },9000);
    });
    const showHint=text=>{ hint.textContent=text; hint.classList.add('show'); };
    const onMsg=e=>{
      if(e.source&&e.source!==frame.contentWindow) return;
      if(e.data!=='tc:ready'||ready||fell) return;
      ready=true; clearTimeout(timer);
      ov.classList.add('ready'); sfx.chime();              /* 隧道淡入，撤掉加载文案 */
      showHint("滚轮 / 拖动 在回忆里前进后退 · 点击照片可以靠近看");
      setTimeout(()=>showHint("右上角 ⊕ My Photos —— 把这四年所有的照片都放进来吧"),6000);
      setTimeout(()=>{ hint.classList.remove('show'); back.classList.add('show'); },12000);
    };
    addEventListener('message',onMsg);
    back.onclick=()=>{
      if(fell) return; back.onclick=null;
      cleanup();
      sfx.chime(); ov.classList.remove('on');
      setTimeout(()=>{ ov.remove(); resolve(); },1300);
    };
  });
}

/* ================= 像素版时光隧道（无 WebGL 时的兜底） ================= */
function tunnelGame(){
  return new Promise(resolve=>{
    const cfg = CONFIG.timeTunnel || { years:[], photos:[], totalDays:1460 };
    setStage(`
      <div class="game-wrap">
        <div class="hud"><span>记忆保管库 · 时光隧道</span><span id="tn-day" style="color:#cdb27a;"></span></div>
        <div class="px-wrap"><canvas class="game" id="tnc" width="226" height="143"></canvas><div class="scanlines"></div>
          <div id="tn-cap"></div><div id="tn-year"></div></div>
        <div class="game-tip">按住屏幕 或 空格 加速穿行 —— 每一张照片，都是真的</div>
      </div>
    `);
    sfx.drone(true);
    const cv=$('tnc'), ctx=cv.getContext('2d');
    const W=678, H=429, F=300;               /* 逻辑分辨率 + 焦距 */
    ctx.imageSmoothingEnabled=false;
    ctx.scale(cv.width/W, cv.height/H);
    const P=new J.PSys(), cam=new J.Cam();

    /* ---------- 隧道蜿蜒路径（正弦曲线） ---------- */
    const pathX=z=>Math.sin(z*.0016)*72;
    const pathY=z=>Math.sin(z*.0011+2)*42;

    /* ---------- 装配：分环照片 + 年份路标 ---------- */
    const imgs=(cfg.photos||[]).map(p=>{ const im=new Image(); im.src=p; return im; });
    const years=(cfg.years&&cfg.years.length)?cfg.years:[{mark:"这 四 年",moments:["……"]}];
    const cards=[], marks=[];
    let zCursor=420, mi=0;
    years.forEach(y=>{
      marks.push({z:zCursor, label:y.mark, done:false});
      zCursor+=240;
      (y.moments||[]).forEach(m=>{
        const side=mi%2?1:-1, seed=mi*7+3;
        cards.push({ z:zCursor, main:true, text:m, img:imgs[mi]||null, seed,
          wx:side*(112+(seed*37%26)), wy:((seed*53%70)-35), scl:1,
          rot:(side>0?-1:1)*.06, ph:seed, shown:false });
        for(let k=0;k<3;k++){               /* 同环的陪衬小相框，撑出隧道密度 */
          const a=(mi*2.1+k*2.094+.8)%6.283;
          cards.push({ z:zCursor+((seed*k*31%80)-40), main:false, seed:seed+k+1,
            wx:Math.cos(a)*205, wy:Math.sin(a)*132,
            scl:.5+(seed*k%30)/100, rot:((seed+k)%10-5)*.03, ph:seed+k });
        }
        zCursor+=200; mi++;
      });
    });
    const endZ=zCursor+360;
    const stars=Array.from({length:80},(_,i)=>({
      wx:(Math.random()*2-1)*460, wy:(Math.random()*2-1)*300, dz:Math.random()*1500 }));

    /* ---------- 输入：按住加速 ---------- */
    let hold=false;
    const wrap=cv.parentElement;
    const dn=()=>hold=true, up=()=>hold=false;
    wrap.addEventListener('pointerdown',dn);
    addEventListener('pointerup',up); wrap.addEventListener('pointerleave',up);
    const onKey=e=>{ if(e.code==='Space'){ e.preventDefault(); hold=e.type==='keydown'; } };
    addEventListener('keydown',onKey); addEventListener('keyup',onKey);

    /* ---------- 相框：真实照片 or 手绘小画 ---------- */
    function doodle(n,w,h){
      ctx.strokeStyle='#e8cb8f'; ctx.fillStyle='#e8cb8f'; ctx.lineWidth=Math.max(1.2,w*.04);
      const cx=0, cy=0;
      switch(n%6){
        case 0: /* 心 */
          ctx.beginPath(); ctx.moveTo(cx,cy+h*.22);
          ctx.bezierCurveTo(cx-w*.3,cy-h*.12,cx-w*.12,cy-h*.3,cx,cy-h*.08);
          ctx.bezierCurveTo(cx+w*.12,cy-h*.3,cx+w*.3,cy-h*.12,cx,cy+h*.22);
          ctx.stroke(); break;
        case 1: /* 两个小人 */
          ctx.beginPath(); ctx.arc(cx-w*.13,cy-h*.08,w*.07,0,7); ctx.stroke();
          ctx.beginPath(); ctx.arc(cx+w*.13,cy-h*.1,w*.07,0,7); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx-w*.13,cy); ctx.lineTo(cx-w*.13,cy+h*.2);
          ctx.moveTo(cx+w*.13,cy-h*.02); ctx.lineTo(cx+w*.13,cy+h*.2);
          ctx.moveTo(cx-w*.1,cy+h*.08); ctx.lineTo(cx+w*.1,cy+h*.08); ctx.stroke(); break;
        case 2: /* 山与日 */
          ctx.beginPath(); ctx.arc(cx+w*.15,cy-h*.14,w*.08,0,7); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx-w*.3,cy+h*.2); ctx.lineTo(cx-w*.08,cy-h*.12);
          ctx.lineTo(cx+w*.08,cy+h*.2); ctx.closePath(); ctx.stroke(); break;
        case 3: /* 小船与浪 */
          ctx.beginPath(); ctx.moveTo(cx-w*.18,cy); ctx.quadraticCurveTo(cx,cy+h*.18,cx+w*.18,cy);
          ctx.closePath(); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx,cy-h*.02); ctx.lineTo(cx,cy-h*.2); ctx.lineTo(cx+w*.12,cy-h*.08); ctx.closePath(); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx-w*.3,cy+h*.16); ctx.quadraticCurveTo(cx-w*.2,cy+h*.1,cx-w*.1,cy+h*.16); ctx.stroke(); break;
        case 4: /* 月亮星星 */
          ctx.beginPath(); ctx.arc(cx-w*.06,cy,w*.13,.6,5.2); ctx.stroke();
          ctx.fillRect(cx+w*.14,cy-h*.14,2.4,2.4); ctx.fillRect(cx+w*.2,cy+h*.06,2,2); break;
        default: /* 小屋 */
          ctx.strokeRect(cx-w*.14,cy-h*.02,w*.28,h*.2);
          ctx.beginPath(); ctx.moveTo(cx-w*.2,cy-h*.02); ctx.lineTo(cx,cy-h*.2);
          ctx.lineTo(cx+w*.2,cy-h*.02); ctx.stroke();
      }
    }
    function drawCard(c,sx,sy,s,t){
      const w=88*c.scl, h=64*c.scl;
      ctx.save(); ctx.translate(sx,sy); ctx.scale(s,s);
      ctx.rotate(c.rot+Math.sin(t/46+c.ph)*.05);
      ctx.globalAlpha=Math.min(1,Math.max(0,(1500-(c.z-camZ))/520))*(c.main?1:.7);
      if(c.main){ ctx.shadowColor='#e8cb8f'; ctx.shadowBlur=14; }
      ctx.fillStyle=c.main?'#e9e0c8':'#9a937e';            /* 拍立得相纸 */
      ctx.fillRect(-w/2,-h/2,w,h*1.16);
      ctx.shadowBlur=0;
      ctx.fillStyle='#141a2c';                              /* 相片区 */
      const pw=w*.86, ph2=h*.84;
      ctx.fillRect(-pw/2,-h/2+h*.07,pw,ph2);
      ctx.save(); ctx.translate(0,-h/2+h*.07+ph2/2);
      if(c.img && c.img.complete && c.img.naturalWidth){
        ctx.beginPath(); ctx.rect(-pw/2,-ph2/2,pw,ph2); ctx.clip();
        const r=Math.max(pw/c.img.naturalWidth, ph2/c.img.naturalHeight);
        ctx.drawImage(c.img,-c.img.naturalWidth*r/2,-c.img.naturalHeight*r/2,
          c.img.naturalWidth*r, c.img.naturalHeight*r);
      } else doodle(c.seed,pw,ph2);
      ctx.restore(); ctx.globalAlpha=1; ctx.restore();
    }

    /* ---------- 字幕 / 年份路标（中文走DOM，像素canvas画不动） ---------- */
    let capTimer=null;
    function caption(text){
      const el=$('tn-cap'); if(!el) return;
      el.textContent=text; el.style.opacity=1;
      clearTimeout(capTimer); capTimer=setTimeout(()=>{ el.style.opacity=0; },2800);
    }
    function yearFlash(label){
      const el=$('tn-year'); if(!el) return;
      const cap=$('tn-cap'); if(cap) cap.style.opacity=0;
      el.textContent=label; el.style.opacity=1;
      sfx.chime(); cam.punch(.12);
      P.spawn({x:W/2,y:H/2,type:'ring',n:1,speed:0,life:34,r:30,color:'#e8cb8f'});
      setTimeout(()=>{ el.style.opacity=0; },1800);
    }

    /* ---------- 主循环 ---------- */
    let camZ=0, speed=2.2, t=0, over=false, fade=0;
    const penta=[523.25,587.33,659.25,783.99,880];
    function loop(){
      if(over && fade>=1){ finish(); return; }
      t++;
      speed=J.lerp(speed, over?9:(hold?7.2:2.2), .05);
      camZ+=speed;
      cam.update(); P.update();
      if(camZ>endZ && !over){ over=true; sfx.chime(); }
      if(over) fade=Math.min(1,fade+.016);

      const day=Math.min(cfg.totalDays||1460, Math.max(1,Math.round(camZ/endZ*(cfg.totalDays||1460))));
      const dEl=$('tn-day'); if(dEl) dEl.textContent=`第 ${day} 天`;

      /* 镜头随蜿蜒微微侧倾 */
      const tilt=(pathX(camZ+60)-pathX(camZ))*-.0045;
      cam.apply(ctx,W,H);
      ctx.translate(W/2,H/2); ctx.rotate(tilt); ctx.translate(-W/2,-H/2);

      /* 星云背景 */
      const g=ctx.createLinearGradient(0,0,0,H);
      g.addColorStop(0,'#060818'); g.addColorStop(.55,'#0b0f26'); g.addColorStop(1,'#070514');
      ctx.fillStyle=g; ctx.fillRect(-60,-60,W+120,H+120);
      const nb=ctx.createRadialGradient(W*.5+Math.sin(t/240)*120,H*.45,20,W*.5,H*.45,W*.62);
      nb.addColorStop(0,'rgba(120,90,170,.10)'); nb.addColorStop(.5,'rgba(70,60,130,.05)'); nb.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=nb; ctx.fillRect(-60,-60,W+120,H+120);

      /* 隧道尽头的光 */
      const ed=endZ-camZ;
      if(ed>10){
        const es=F/ed, ex=W/2+(pathX(endZ)-pathX(camZ))*es, ey=H/2+(pathY(endZ)-pathY(camZ))*es;
        const er=Math.min(W, 30+9000/ed + fade*W);
        const lg=ctx.createRadialGradient(ex,ey,0,ex,ey,er);
        lg.addColorStop(0,'rgba(245,232,200,.95)'); lg.addColorStop(.4,'rgba(232,203,143,.35)'); lg.addColorStop(1,'rgba(232,203,143,0)');
        ctx.fillStyle=lg; ctx.beginPath(); ctx.arc(ex,ey,er,0,7); ctx.fill();
      }

      /* 星流（拖尾线条体现速度） */
      ctx.strokeStyle='rgba(216,207,174,.5)';
      for(const st of stars){
        st.dz-=speed; if(st.dz<16) st.dz+=1500;
        const s1=F/st.dz, s2=F/Math.min(1500,st.dz+speed*3.5);
        const ox=pathX(camZ+st.dz)-pathX(camZ), oy=pathY(camZ+st.dz)-pathY(camZ);
        ctx.globalAlpha=Math.min(.8,(1500-st.dz)/900);
        ctx.lineWidth=Math.min(2.2,s1*2);
        ctx.beginPath();
        ctx.moveTo(W/2+(st.wx+ox)*s1, H/2+(st.wy+oy)*s1);
        ctx.lineTo(W/2+(st.wx+ox)*s2, H/2+(st.wy+oy)*s2);
        ctx.stroke();
      }
      ctx.globalAlpha=1;

      /* 照片（远→近排序绘制） */
      const vis=cards.filter(c=>{ const dz=c.z-camZ; return dz>26 && dz<1500; })
        .sort((a,b)=>b.z-a.z);
      for(const c of vis){
        const dz=c.z-camZ, s=F/dz;
        const ox=pathX(c.z)-pathX(camZ), oy=pathY(c.z)-pathY(camZ);
        drawCard(c, W/2+(c.wx+ox)*s, H/2+(c.wy+oy)*s, s, t);
        if(c.main && !c.shown && dz<170){
          c.shown=true; caption(c.text);
          sfx.note(penta[c.seed%penta.length],.6,.08);
          P.spawn({x:W/2+(c.wx+ox)*s, y:H/2+(c.wy+oy)*s, n:8, speed:2.2, life:30, r:2.2, color:'#ffd98a', drag:.93});
        }
      }
      for(const m of marks){                                /* 跨年路标 */
        if(!m.done && camZ>m.z-90){ m.done=true; yearFlash(m.label); }
      }

      P.draw(ctx);
      if(fade>0){ ctx.globalAlpha=fade; ctx.fillStyle='#f5ecd8'; ctx.fillRect(-60,-60,W+120,H+120); ctx.globalAlpha=1; }
      cam.restore(ctx);
      requestAnimationFrame(loop);
    }

    function finish(){
      wrap.removeEventListener('pointerdown',dn);
      removeEventListener('pointerup',up);
      removeEventListener('keydown',onKey); removeEventListener('keyup',onKey);
      clearTimeout(capTimer);
      sfx.drone(false); sfx.chime(); burstCenter();
      setTimeout(resolve,900);
    }
    loop();
  });
}
