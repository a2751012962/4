/* ================= 第四晚 · 坍塌走廊（Three.js 版） =================
   真第一人称走廊：油灯是会失灵的点光源，符文在墙上向下爬，
   身后的段落整块坠入黑暗。点按前进，节奏与原版一致。 */
"use strict";
function hallGame(){
  return new Promise(resolve=>{
    const SEG=9, DEPTH=8, HW=3.3, HH=3;       /* 段数/段深/半宽/半高（世界单位） */
    setStage(`
      <div class="game-wrap">
        <div class="hud"><span>记忆保管库 · B4层</span><span id="hg-w" style="color:#c0584a;"></span></div>
        <div id="hall-wrap"><canvas id="hgc" style="position:absolute;inset:0;width:100%;height:100%;display:block;"></canvas></div>
        <div class="game-tip">连续点击画面 向前奔跑 —— <b style="color:#c0584a;">走廊正在你身后坍塌</b></div>
      </div>
    `);
    heartbeat(true,100);
    const wrap=$('hall-wrap'), cv=$('hgc');
    const rect=wrap.getBoundingClientRect();

    const renderer=T3.makeView(cv,{pixel:false});
    const scene=new THREE.Scene();
    scene.background=new THREE.Color(0x050507);
    scene.fog=new THREE.Fog(0x050507, 8, 60);
    const camera=new THREE.PerspectiveCamera(64, rect.width/rect.height, .1, 120);
    camera.position.set(0,0,6);
    const shake=new T3.Shake(camera);
    scene.add(new THREE.AmbientLight(0x4a3d28, .8));
    const carried=new THREE.PointLight(0xcdb27a, .8, 13, 1.4);   /* 她手里那点光 */
    scene.add(carried);

    const runes=["不要回头","守则正在重写","回忆即将回收","第四位住客","余生请多……","它们在等你","跑"];

    /* ---------- 走廊段 ---------- */
    const segs=[], lamps=[], runeMeshes=[];
    for(let i=0;i<SEG;i++){
      const g=new THREE.Group();
      const zMid=-(i+.5)*DEPTH;
      const wallMat=()=>new THREE.MeshLambertMaterial({color:0x241c10});
      const mk=(w,h)=>new THREE.Mesh(new THREE.PlaneGeometry(w,h));
      const L=mk(DEPTH,HH*2); L.material=wallMat();
      L.rotation.y=Math.PI/2;  L.position.set(-HW,0,zMid); g.add(L);
      const R=mk(DEPTH,HH*2); R.material=wallMat();
      R.rotation.y=-Math.PI/2; R.position.set(HW,0,zMid); g.add(R);
      const F=mk(HW*2,DEPTH); F.material=new THREE.MeshLambertMaterial({color:0x0d0a06});
      F.rotation.x=-Math.PI/2; F.position.set(0,-HH,zMid); g.add(F);
      const C=mk(HW*2,DEPTH); C.material=new THREE.MeshLambertMaterial({color:0x060403});
      C.rotation.x=Math.PI/2;  C.position.set(0,HH,zMid); g.add(C);

      /* 竖排符文（两侧交错） */
      [[-1,runes[i%runes.length]],[1,runes[(i+3)%runes.length]]].forEach(([side,txt])=>{
        const r=T3.textPlane(txt,{size:34, color:'#8a774f', vertical:true, scale:.012, opacity:.85});
        r.position.set(side*(HW-.06), .6, zMid+(side>0?1.1:-1.1));
        r.rotation.y=side>0?-Math.PI/2:Math.PI/2;
        r.userData.phase=i*1.3;
        g.add(r); runeMeshes.push(r);
      });

      /* 油灯：隔段交替挂墙，真点光源 */
      if(i%2===1){
        const side=(i%4===1)?-1:1;
        const bulb=new THREE.Mesh(new THREE.SphereGeometry(.09,8,8),
          new THREE.MeshBasicMaterial({color:0xe0b35a}));
        bulb.position.set(side*(HW-.15), .9, zMid); g.add(bulb);
        const glow=T3.glowSprite('#e0b35a', 1.1); glow.position.copy(bulb.position); g.add(glow);
        const light=new THREE.PointLight(0xe0b35a, 1.6, 16, 1.4);
        light.position.set(side*(HW-.4), .9, zMid); g.add(light);
        lamps.push({light, glow, dip:0});
      }
      scene.add(g);
      segs.push({g, gone:false});
    }

    /* ---------- 保管库大门（canvas手绘：橡树+锁孔） ---------- */
    (()=>{
      const c=document.createElement('canvas'); c.width=512; c.height=460;
      const x=c.getContext('2d');
      const rg=x.createRadialGradient(256,250,30,256,250,320);
      rg.addColorStop(0,'#2a2214'); rg.addColorStop(.75,'#0d0a06'); rg.addColorStop(1,'#070503');
      x.fillStyle=rg; x.fillRect(0,0,512,460);
      /* 橡树 */
      x.strokeStyle='#4a3b22'; x.lineWidth=10; x.lineCap='round';
      x.beginPath(); x.moveTo(256,300); x.quadraticCurveTo(250,220,256,170); x.stroke();
      x.lineWidth=5;
      [[-46,-38],[46,-38],[-24,-66],[24,-66],[0,-80]].forEach(([dx,dy])=>{
        x.beginPath(); x.moveTo(256,200); x.quadraticCurveTo(256+dx*.6,200+dy*.6,256+dx,200+dy); x.stroke();
      });
      x.fillStyle='#3d3320';
      [[-52,-52,34],[52,-52,34],[0,-84,40],[-26,-72,30],[26,-72,30]].forEach(([dx,dy,r])=>{
        x.beginPath(); x.arc(256+dx,196+dy,r,0,7); x.fill();
      });
      /* 树根与锁孔 */
      x.strokeStyle='#4a3b22'; x.lineWidth=7;
      x.beginPath(); x.moveTo(256,300); x.quadraticCurveTo(216,318,186,326); x.stroke();
      x.beginPath(); x.moveTo(256,300); x.quadraticCurveTo(296,318,326,326); x.stroke();
      [[-38,330],[38,330]].forEach(([dx,dy])=>{
        x.fillStyle='#0a0805';
        x.beginPath(); x.ellipse(256+dx,dy,9,12,0,0,7); x.fill();
        x.strokeStyle='#e0b35a'; x.lineWidth=2;
        x.beginPath(); x.ellipse(256+dx,dy,11,14,0,0,7); x.stroke();
      });
      x.fillStyle='#cdb27a'; x.font='26px "Songti SC","Noto Serif SC",serif';
      x.textAlign='center';
      x.fillText('记 忆 保 管 库',256,396);
      x.fillStyle='#6e614a'; x.font='15px "Songti SC","Noto Serif SC",serif';
      x.fillText('两个锁孔，正在发光',256,426);
      const door=new THREE.Mesh(new THREE.PlaneGeometry(HW*2,HH*2),
        new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c)}));
      door.position.set(0,0,-SEG*DEPTH);
      scene.add(door);
      /* 锁孔微光 */
      [[-.5,-1.15],[.5,-1.15]].forEach(([dx,dy])=>{
        const kg=T3.glowSprite('#e0b35a',.8); kg.position.set(dx,dy,-SEG*DEPTH+.2); scene.add(kg);
      });
      const doorLight=new THREE.PointLight(0xcdb27a,.8,16,2);
      doorLight.position.set(0,0,-SEG*DEPTH+3); scene.add(doorLight);
    })();

    /* 追在身后的红光（坍塌前沿） */
    const chaseLight=new THREE.PointLight(0xa02020, 0, 22, 2);
    chaseLight.position.set(0,0,10); scene.add(chaseLight);

    /* ---------- 状态与前进（节奏与原版一致） ---------- */
    let step=0, collapsed=0, over=false, t=0;
    let camTarget=6;
    const collapsing=[];

    const collapse=setInterval(()=>{
      if(over) return;
      if(collapsed < step-1){
        fall(collapsed); collapsed++;
      } else {
        redAlert(true); shake.hit(.4);
        $('hg-w').textContent='它追上来了——快跑！';
        setTimeout(()=>{ redAlert(false); const w=$('hg-w'); if(w) w.textContent=''; },1400);
        if(collapsed<step){ fall(collapsed); collapsed++; }
      }
    },2200);

    function fall(i){
      const s=segs[i];
      if(!s || s.gone) return;
      s.gone=true;
      s.g.traverse(o=>{ if(o.material&&o.material.emissive) { o.material.emissive.setHex(0xfff2d0); o.material.emissiveIntensity=1.4; } });
      collapsing.push({g:s.g, k:0});
    }

    const speedline=()=>{
      const d=document.createElement('div');
      d.style.cssText='position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(90deg,transparent 0 30px,rgba(205,178,122,.07) 30px 32px);opacity:.9;transition:opacity .45s;z-index:5;';
      wrap.appendChild(d);
      requestAnimationFrame(()=>{ d.style.opacity=0; });
      setTimeout(()=>d.remove(),500);
    };
    const advance=()=>{
      if(over) return;
      step++; sfx.thud(); speedline(); shake.punch(.06);
      camTarget=6-step*DEPTH;
      if(step===3) whisper("笃笃：别回头！我们殿后！", true);
      if(step===6) whisper("突突：就快到了！锁孔在发光！", true);
      if(step>=SEG){
        over=true; clearInterval(collapse);
        redAlert(false); heartbeat(false); sfx.chime(); burstCenter();
        setTimeout(()=>{ T3.dispose(renderer,scene); resolve(); },1500);
      }
    };
    wrap.addEventListener('pointerdown',advance);
    const onKey=e=>{ if(e.code==='Space'||e.key==='ArrowUp'){ e.preventDefault(); advance(); } };
    addEventListener('keydown',onKey);
    const cleanup=()=>removeEventListener('keydown',onKey);
    const origResolve=resolve; resolve=()=>{ cleanup(); origResolve(); };

    /* ---------- 渲染循环 ---------- */
    function loop(){
      t++;
      /* 相机滑行 + 轻微头部起伏 */
      const base=shake.base;
      base.z=J.lerp(base.z===0?6:base.z, camTarget, .12);
      base.z=Math.abs(base.z-camTarget)<.01?camTarget:base.z;
      base.x=0; base.y=Math.sin(t/9)*.04;
      camera.position.z=base.z;
      shake.update();
      camera.lookAt(0, 0, camera.position.z-10);
      carried.position.set(0, -.3, camera.position.z-1.5);

      /* 符文向下爬（对应原版 runecrawl 动画） */
      for(const r of runeMeshes)
        r.position.y=1.6-((t*.006+r.userData.phase)%3);

      /* 油灯失灵般的闪烁 */
      for(const l of lamps){
        if(l.dip>0) l.dip--;
        else if(Math.random()<.008) l.dip=5;
        l.light.intensity=l.dip>0?.25:1.6;
        l.glow.material.opacity=l.dip>0?.25:1;
      }

      /* 坍塌动画：亮一瞬，整段坠落 */
      for(let i=collapsing.length-1;i>=0;i--){
        const c=collapsing[i]; c.k++;
        const k=c.k/40;
        c.g.rotation.x=-k*k*.8;
        c.g.position.y=-k*k*9;
        c.g.traverse(o=>{ if(o.material&&o.material.emissiveIntensity)
          o.material.emissiveIntensity=Math.max(0,1.4-k*3); });
        if(c.k>=40){ scene.remove(c.g); collapsing.splice(i,1); }
      }
      /* 红光追在坍塌前沿 */
      chaseLight.position.z=-(collapsed*DEPTH)+6;
      chaseLight.intensity=collapsed>0?1+Math.sin(t/6)*.35:0;

      renderer.render(scene,camera);
      if(!over || collapsing.length) requestAnimationFrame(loop);
    }
    loop();
  });
}
