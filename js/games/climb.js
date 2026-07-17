/* ================= 第二晚 · 雾墙追逐（Three.js 版） =================
   平台手感三件套（土狼时间/跳跃缓冲/可变跳高）原封保留，
   物理仍在像素坐标系内跑；渲染换成侧视3D：
   三层视差山影 / 徒步熊的提灯是真实点光源 / 红雾墙。 */
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
    const cv=$('cgc');
    const W=678, H=429, GY=H-70, PX=130;      /* 逻辑分辨率（与原版一致） */
    const S=17;                               /* 像素 → 世界缩放 */
    const X=v=>(v-W/2)/S, Y=v=>(GY+18-v)/S;   /* 地面顶线 → y=0 */

    /* ---------- 场景 ---------- */
    const renderer=T3.makeView(cv,{pixel:true});
    const scene=new THREE.Scene();
    scene.background=new THREE.Color(0x0a0d16);
    scene.fog=new THREE.Fog(0x0a0d16, 26, 60);
    const camera=new THREE.PerspectiveCamera(50, 226/143, .1, 120);
    camera.position.set(0, 3.4, 24);
    camera.lookAt(0, 3.2, 0);
    const shake=new T3.Shake(camera);
    scene.add(new THREE.AmbientLight(0x1a1e2c, 1.0));
    const fill=new THREE.DirectionalLight(0x2a3048, .4);
    fill.position.set(4,10,20); scene.add(fill);

    /* 地面 */
    const ground=new THREE.Mesh(new THREE.BoxGeometry(64,4,12),
      new THREE.MeshLambertMaterial({color:0x1a1409}));
    ground.position.set(0,-2,0); scene.add(ground);
    const groundEdge=new THREE.Mesh(new THREE.BoxGeometry(64,.08,.1),
      new THREE.MeshBasicMaterial({color:0x2c2516}));
    groundEdge.position.set(0,0,5.05); scene.add(groundEdge);

    /* 三层视差山影（对应原版 .14/.32/.6 卷动系数） */
    function peakLayer(color, hPx, wPx, z, spacingPx){
      const g=new THREE.Group();
      const mat=new THREE.MeshBasicMaterial({color});
      for(let i=0;i<9;i++){
        const shp=new THREE.Shape();
        shp.moveTo(-wPx/S,0); shp.lineTo(0,hPx/S); shp.lineTo(wPx/S,0); shp.closePath();
        const m=new THREE.Mesh(new THREE.ShapeGeometry(shp), mat);
        m.position.x=i*spacingPx/S;
        g.add(m);
      }
      g.position.set(-24, 0, z);
      scene.add(g);
      return {g, spacing:spacingPx/S};
    }
    const L1=peakLayer(0x0e111a, 130, 260, -18, 260);
    const L2=peakLayer(0x11131e, 155, 210, -12, 230);
    const L3=peakLayer(0x171307, 175, 180, -7,  210);

    /* 风丝：循环的细小光点 */
    const winds=[];
    for(let i=0;i<12;i++){
      const m=new THREE.Mesh(new THREE.PlaneGeometry(.9,.05),
        new THREE.MeshBasicMaterial({color:0xc8d2eb, transparent:true, opacity:.28, depthWrite:false}));
      m.position.set((Math.random()-.5)*44, 2+Math.random()*10, -2-Math.random()*4);
      m.userData.v=.12+Math.random()*.12;
      scene.add(m); winds.push(m);
    }

    /* 主角：徒步熊精灵 + 提灯（真点光源） */
    const bear=T3.artSprite('hiker', 3.4);
    scene.add(bear);
    const lamp=new THREE.PointLight(0xffd98a, 1.35, 17, 2);
    scene.add(lamp);
    const lampDot=new THREE.Mesh(new THREE.SphereGeometry(.16,8,8),
      new THREE.MeshBasicMaterial({color:0xffd98a}));
    scene.add(lampDot);
    const lampGlow=T3.glowSprite('#ffd98a', 1.5); scene.add(lampGlow);

    /* 里程旗 ×3 */
    const flags=[.25,.5,.75].map(()=>{
      const g=new THREE.Group();
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,2.7),
        new THREE.MeshLambertMaterial({color:0x6e5639}));
      pole.position.y=1.35; g.add(pole);
      const shp=new THREE.Shape();
      shp.moveTo(0,2.6); shp.lineTo(1.2,2.2); shp.lineTo(0,1.8); shp.closePath();
      g.add(new THREE.Mesh(new THREE.ShapeGeometry(shp),
        new THREE.MeshBasicMaterial({color:0xcdb27a, side:THREE.DoubleSide})));
      g.visible=false; scene.add(g); return g;
    });

    /* 红雾墙 */
    const fogWall=new THREE.Group();
    (()=>{ const cvx=document.createElement('canvas'); cvx.width=128; cvx.height=32;
      const c2=cvx.getContext('2d');
      const gr=c2.createLinearGradient(0,0,128,0);
      gr.addColorStop(0,'rgba(140,30,30,.92)'); gr.addColorStop(.7,'rgba(90,22,22,.75)'); gr.addColorStop(1,'rgba(90,22,22,0)');
      c2.fillStyle=gr; c2.fillRect(0,0,128,32);
      const tex=new THREE.CanvasTexture(cvx);
      const m=new THREE.Mesh(new THREE.PlaneGeometry(17,15),
        new THREE.MeshBasicMaterial({map:tex, transparent:true, depthWrite:false}));
      m.position.set(-6.5,6,1); fogWall.add(m);
    })();
    const blobs=[];
    for(let i=0;i<7;i++){
      const b=T3.glowSprite('#8c1e1e', 3.2);
      b.position.set(1.2+Math.sin(i*2)*.9, i*2.1, 1.4);
      fogWall.add(b); blobs.push(b);
    }
    const fogLight=new THREE.PointLight(0xa02020, 1.1, 14, 2);
    fogLight.position.set(1.5,4,2); fogWall.add(fogLight);
    scene.add(fogWall);

    const P=new T3.Burst(scene);

    /* ---------- 逻辑状态（与原版同名同值） ---------- */
    let t=0, dist=0, over=false;
    const GOAL=3000, speed=3.4;
    let y=GY, vy=0, grounded=true;
    let coyote=0, buffer=0, holding=false;
    let sx=1, sy=1, rot=0;
    let fog=-260, flagsHit=[false,false,false];
    const rocks=[];
    window.__g={rocks, y:()=>y};              /* 调试/自动化测试钩子 */

    const press=()=>{ holding=true; buffer=8; };
    const release=()=>{ holding=false; if(vy<-4.5) vy=-4.5; };
    const onKey=e=>{ if(e.code==='Space'){ e.preventDefault();
      if(e.type==='keydown'&&!e.repeat) press(); if(e.type==='keyup') release(); } };
    addEventListener('keydown',onKey); addEventListener('keyup',onKey);
    cv.addEventListener('pointerdown',press);
    addEventListener('pointerup',release);

    function makeRock(w,h){
      const m=new THREE.Mesh(new THREE.ConeGeometry(w/S*1.15, h/S, 5),
        new THREE.MeshLambertMaterial({color:0x241d12, flatShading:true}));
      m.rotation.y=Math.random()*6.28;
      scene.add(m); return m;
    }
    function dust(n,spd){ P.spawn({x:X(PX), y:.15, z:.5, n, speed:spd*.09,
      life:26, color:'#b4a078', spreadY:.7}); }

    const vec=new THREE.Vector3();
    function popWorld(wx,wy,text){
      vec.set(wx,wy,0).project(camera);
      J.pop(cv,(vec.x+1)/2, Math.max(.06,(1-vec.y)/2-.06), text);
    }

    function loop(){
      if(over) return;
      const act=!J.frozen();
      if(act){
        t++; dist+=speed;
        if(t%72===0){ const w=24+Math.random()*22, h=28+Math.random()*34;
          rocks.push({x:W+40, w, h, mesh:makeRock(w,h)}); }

        /* 平台手感三件套 */
        coyote=grounded?8:Math.max(0,coyote-1);
        buffer=Math.max(0,buffer-1);
        if(buffer>0 && (grounded||coyote>0)){
          vy=-12.6; grounded=false; coyote=0; buffer=0;
          sx=.82; sy=1.22; sfx.tick(); dust(6,1.6);
        }
        vy+=holding&&vy<0?.5:.78;
        y+=vy;
        if(y>=GY){
          if(!grounded){ sx=1.28; sy=.74; dust(Math.min(12,Math.abs(vy)*1.4),2.2);
            if(vy>9) shake.hit(.12); }
          y=GY; vy=0; grounded=true;
        } else grounded=false;
        if(grounded && t%9===0) dust(1,.9);
        sx=J.lerp(sx,1,.18); sy=J.lerp(sy,1,.18); rot=J.lerp(rot,0,.1);
        fog+=.55;
      }
      if(act) P.update();

      /* 视差山影卷动 */
      L1.g.position.x=-24-((dist*.14)/S)%L1.spacing;
      L2.g.position.x=-24-((dist*.32)/S)%L2.spacing;
      L3.g.position.x=-24-((dist*.6)/S)%L3.spacing;

      /* 风丝 */
      for(const w of winds){
        if(act) w.position.x-=w.userData.v;
        if(w.position.x<-24) w.position.x=24;
      }

      /* 里程旗 */
      [.25,.5,.75].forEach((m,i)=>{
        const fx=W+(GOAL*m-dist);
        const g=flags[i];
        if(fx>-60&&fx<W+60){ g.visible=true; g.position.x=X(fx); }
        else g.visible=false;
        if(act && !flagsHit[i] && dist>=GOAL*m){
          flagsHit[i]=true; sfx.chime(); shake.punch(.05);
          popWorld(X(PX), Y(y)+3.6, ['翻过一座山','过半了！','山顶就在前面'][i]);
        }
      });

      /* 岩石 */
      if(act) for(let i=rocks.length-1;i>=0;i--){
        const r=rocks[i]; r.x-=speed;
        if(r.x<-60){ scene.remove(r.mesh); rocks.splice(i,1); continue; }
        if(Math.abs(r.x-PX)<r.w-4 && y>GY-r.h+6){
          scene.remove(r.mesh); rocks.splice(i,1);
          J.hitstop(60); shake.hit(.5); screenTear(); rot=.9; fog+=90;
          P.spawn({x:X(PX), y:Y(y)+.8, z:.5, n:10, speed:.28, life:34, color:'#241d12'});
          $('cg-w').textContent='雾，扑近了！';
          setTimeout(()=>{ const w=$('cg-w'); if(w) w.textContent=''; },1300);
        }
      }
      for(const r of rocks) r.mesh.position.set(X(r.x), r.h/S/2, 0);

      /* 主角 + 提灯（挤压拉伸时脚底贴地） */
      const bobY=grounded?Math.sin(t/5)*.09:0;
      const bx=X(PX), by=Y(y)-1.06+1.95*sy+bobY;
      bear.position.set(bx, by, .4);
      bear.scale.set(3.4*sx, 3.9*sy, 1);
      bear.material.rotation=-rot;
      lamp.position.set(bx+1.6, by+.9, 1.2);
      lampDot.position.copy(lamp.position);
      lampGlow.position.copy(lamp.position);
      lampGlow.scale.setScalar(1.4+Math.sin(t/7)*.18);

      /* 红雾墙 */
      fogWall.position.x=X(fog);
      blobs.forEach((b,i)=>{
        b.position.y=((i*2.1+t*.05)%15);
        b.position.x=1.2+Math.sin(t/14+i*2)*.85;
      });
      fogLight.intensity=1+Math.sin(t/9)*.25;

      const danger=fog>40;
      redAlert(danger);
      if(danger) heartbeat(true,130);
      if(act && fog>118){
        fog=-200; redAlert(false); heartbeat(true,95);
        whisper("徒步熊一把拽住你：「抓紧我！」", true);
        shake.hit(.4);
      }
      const left=Math.max(0, Math.round(100-dist/GOAL*100));
      $('cg-d').textContent=`距山顶 ${left}%`;

      shake.update();
      renderer.render(scene,camera);
      if(dist>=GOAL){ over=true; finish(); return; }
      requestAnimationFrame(loop);
    }

    function finish(){
      removeEventListener('keydown',onKey); removeEventListener('keyup',onKey);
      removeEventListener('pointerup',release);
      redAlert(false); heartbeat(false); sfx.chime(); burstCenter();
      delete window.__g;
      setTimeout(()=>{ T3.dispose(renderer,scene); resolve(); },1200);
    }
    loop();
  });
}
