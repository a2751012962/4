/* ================= 第四晚 · 3D坍塌走廊 ================= */
function hallGame(){
  return new Promise(resolve=>{
    const SEG=9, DEPTH=320, CW=460, CH=430;
    setStage(`
      <div class="game-wrap">
        <div class="hud"><span>记忆保管库 · B4层</span><span id="hg-w" style="color:#c0584a;"></span></div>
        <div id="hall-wrap"><div id="hall"></div></div>
        <div class="game-tip">连续点击画面 向前奔跑 —— <b style="color:#c0584a;">走廊正在你身后坍塌</b></div>
      </div>
    `);
    heartbeat(true,100);
    const hall=$('hall');
    const runes=["不要回头","守则正在重写","回忆即将回收","第四位住客","余生请多……","它们在等你","跑"];
    let html='';
    for(let i=0;i<SEG;i++){
      const z=-i*DEPTH;
      html+=`<div class="seg" id="seg${i}">
        <div class="p3 wallface breathe" style="width:${DEPTH}px;height:${CH}px;transform:translate(-50%,-50%) translate3d(${-CW/2}px,0,${z-DEPTH/2}px) rotateY(90deg);">
          <div class="rune" style="left:30%;top:6%;">${runes[i%runes.length]}</div>
          ${i%2? `<div class="lampdot" style="left:50%;top:30%;"></div>`:''}
        </div>
        <div class="p3 wallface breathe" style="width:${DEPTH}px;height:${CH}px;transform:translate(-50%,-50%) translate3d(${CW/2}px,0,${z-DEPTH/2}px) rotateY(-90deg);">
          <div class="rune" style="left:55%;top:14%;">${runes[(i+3)%runes.length]}</div>
          ${i%2? '':`<div class="lampdot" style="left:40%;top:34%;"></div>`}
        </div>
        <div class="p3" style="width:${CW}px;height:${DEPTH}px;background:linear-gradient(0deg,#0d0a06,#070503);transform:translate(-50%,-50%) translate3d(0,${CH/2}px,${z-DEPTH/2}px) rotateX(90deg);"></div>
        <div class="p3" style="width:${CW}px;height:${DEPTH}px;background:#060403;transform:translate(-50%,-50%) translate3d(0,${-CH/2}px,${z-DEPTH/2}px) rotateX(-90deg);"></div>
      </div>`;
    }
    html+=`<div class="p3" id="vaultdoor" style="width:${CW}px;height:${CH}px;transform:translate(-50%,-50%) translate3d(0,0,${-SEG*DEPTH}px);
      background:radial-gradient(circle at 50% 55%, #2a2214 0%, #0d0a06 75%);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:14px;">
      <div style="font-size:64px;">🌳</div>
      <div style="color:#cdb27a;letter-spacing:.4em;font-size:18px;">记 忆 保 管 库</div>
      <div style="color:#6e614a;font-size:13px;">两个锁孔，正在发光</div>
    </div>`;
    hall.innerHTML=html;
    let step=0, collapsed=0, over=false;
    const apply=()=>{ hall.style.transform=`translateZ(${step*DEPTH}px)`; };
    apply();
    // 身后坍塌：每2.2秒吞掉一段
    const collapse=setInterval(()=>{
      if(over) return;
      if(collapsed < step-1){
        const s=$('seg'+collapsed);
        if(s){ s.style.transition='opacity .5s, filter .5s'; s.style.filter='brightness(4)'; setTimeout(()=>s.style.opacity=0,180); }
        collapsed++;
      } else {
        // 追上了：闪红警告，吞掉当前段之前的，但不惩罚——熊们顶住了
        redAlert(true); shake();
        $('hg-w').textContent='它追上来了——快跑！';
        setTimeout(()=>{ redAlert(false); $('hg-w').textContent=''; },1400);
        if(collapsed<step){ const s=$('seg'+collapsed); if(s){ s.style.opacity=0; } collapsed++; }
      }
    },2200);
    const advance=()=>{
      if(over) return;
      step++; sfx.thud(); apply();
      if(step===3) whisper("笃笃：别回头！我们殿后！", true);
      if(step===6) whisper("突突：就快到了！锁孔在发光！", true);
      if(step>=SEG){
        over=true; clearInterval(collapse);
        redAlert(false); heartbeat(false); sfx.chime(); burstCenter();
        setTimeout(resolve,1500);
      }
    };
    $('hall-wrap').addEventListener('pointerdown',advance);
    const onKey=e=>{ if(e.code==='Space'||e.key==='ArrowUp'){ e.preventDefault(); advance(); } };
    addEventListener('keydown',onKey);
    const cleanup=()=>removeEventListener('keydown',onKey);
    const origResolve=resolve; resolve=()=>{ cleanup(); origResolve(); };
  });
}
