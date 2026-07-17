/* ================= 第一晚 · 夜海行船（Three.js 版） =================
   逻辑仍在 678x429 像素坐标系内跑（手感与原版逐帧一致），
   渲染换成真 3D：起伏海面 / 月亮 / 发光回忆 / 暗礁。
   低分辨率背板 226x143 + CSS像素放大，保持 PS1 质感。 */
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
    const cv=$('bgc');
    const W=678, H=429, BY=H-58;              /* 逻辑分辨率（与原2D版一致） */
    const X=v=>(v-W/2)/17, Z=v=>(v-BY)/9;     /* 像素坐标 → 世界坐标 */

    /* ---------- 场景 ---------- */
    const renderer=T3.makeView(cv,{pixel:true});
    const scene=new THREE.Scene();
    scene.background=new THREE.Color(0x05060f);
    scene.fog=new THREE.Fog(0x05060f, 40, 96);
    const camera=new THREE.PerspectiveCamera(58, 226/143, .1, 200);
    camera.position.set(0, 5.6, 11);
    const shake=new T3.Shake(camera);
    const amb=new THREE.AmbientLight(0x3a4258, 1.15); scene.add(amb);
    const moonlight=new THREE.DirectionalLight(0x8ea0c8, .8);
    moonlight.position.set(14, 22, -30); scene.add(moonlight);

    /* 海面：顶点正弦起伏 */
    const seaGeo=new THREE.PlaneGeometry(150, 130, 46, 34);
    seaGeo.rotateX(-Math.PI/2);
    const sea=new THREE.Mesh(seaGeo, new THREE.MeshLambertMaterial({color:0x16233f, emissive:0x050a16, flatShading:true}));
    sea.position.z=-40; scene.add(sea);
    const seaPos=seaGeo.attributes.position;

    /* 月亮 + 月光道 */
    const moon=new THREE.Mesh(new THREE.SphereGeometry(3.2,12,12),
      new THREE.MeshBasicMaterial({color:0xd8cfae}));
    moon.position.set(10, 11, -70); scene.add(moon);
    const moonGlow=T3.glowSprite('#d8cfae', 14); moonGlow.position.copy(moon.position); scene.add(moonGlow);
    const lane=[];
    for(let i=0;i<8;i++){
      const m=new THREE.Mesh(new THREE.PlaneGeometry(3.2-i*.28, 1.1),
        new THREE.MeshBasicMaterial({color:0xd8cfae, transparent:true, opacity:.10,
          blending:THREE.AdditiveBlending, depthWrite:false}));
      m.rotation.x=-Math.PI/2; m.position.set(10, .32, -60+i*6.4);
      scene.add(m); lane.push(m);
    }

    /* 星星 */
    (()=>{ const g=new THREE.BufferGeometry(); const p=new Float32Array(130*3);
      for(let i=0;i<130;i++){ p[i*3]=(Math.random()-.5)*160; p[i*3+1]=8+Math.random()*36; p[i*3+2]=-30-Math.random()*70; }
      g.setAttribute('position', new THREE.BufferAttribute(p,3));
      scene.add(new THREE.Points(g, new THREE.PointsMaterial({color:0xe8cb8f, size:.5, transparent:true, opacity:.75})));
    })();

    /* 小木船（船体+帆+海员熊） */
    const boat=new THREE.Group();
    const hull=new THREE.Mesh(new THREE.BoxGeometry(3.8,.75,1.7),
      new THREE.MeshLambertMaterial({color:0x4a3722}));
    boat.add(hull);
    const bow=new THREE.Mesh(new THREE.ConeGeometry(.85,1.5,4),
      new THREE.MeshLambertMaterial({color:0x3c2d1c}));
    bow.rotation.z=-Math.PI/2; bow.position.set(2.4,.05,0); boat.add(bow);
    const stern=bow.clone(); stern.rotation.z=Math.PI/2; stern.position.x=-2.4; boat.add(stern);
    const mast=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,3.4),
      new THREE.MeshLambertMaterial({color:0x2c2014}));
    mast.position.set(-.4,2,0); boat.add(mast);
    const sail=new THREE.Mesh(new THREE.PlaneGeometry(2.2,2.4),
      new THREE.MeshBasicMaterial({color:0x6e6350, side:THREE.DoubleSide}));
    sail.position.set(.75,2.15,0); boat.add(sail);
    const bear=T3.artSprite('sailor', 3.1); bear.position.set(-1.1,1.9,.2); boat.add(bear);
    const lampGlow=T3.glowSprite('#e8cb8f', 1.6); lampGlow.position.set(2.2,1,0); boat.add(lampGlow);
    const lantern=new THREE.PointLight(0xe8cb8f, 1.1, 15, 1.6);
    lantern.position.set(2.2,1.4,.5); boat.add(lantern);
    scene.add(boat);

    const P=new T3.Burst(scene);

    /* ---------- 逻辑状态（与原版同名同值） ---------- */
    let px=W/2, vx=0, tilt=0, score=0, t=0, inv=0, over=false, flash=0;
    let keyL=false, keyR=false, targetX=null;
    const ents=[];
    window.__g={ents, px:()=>px};             /* 调试/自动化测试钩子 */

    const onKey=e=>{
      if(e.key==='ArrowLeft'){ keyL=e.type==='keydown'; targetX=null; }
      if(e.key==='ArrowRight'){ keyR=e.type==='keydown'; targetX=null; }
    };
    addEventListener('keydown',onKey); addEventListener('keyup',onKey);
    const toX=e=>{ const r=cv.getBoundingClientRect(); return (e.clientX-r.left)/r.width*W; };
    cv.addEventListener('pointermove',e=>{ if(e.buttons||e.pointerType==='touch') targetX=toX(e); });
    cv.addEventListener('pointerdown',e=>{ targetX=toX(e); });

    function makeOrb(){
      const g=new THREE.Group();
      const core=new THREE.Mesh(new THREE.SphereGeometry(.5,10,10),
        new THREE.MeshBasicMaterial({color:0xe8cb8f}));
      const halo=T3.glowSprite('#e8cb8f', 2.6);
      g.add(core); g.add(halo); g.userData={halo};
      scene.add(g); return g;
    }
    function makeReef(){
      const m=new THREE.Mesh(new THREE.IcosahedronGeometry(1.5,0),
        new THREE.MeshLambertMaterial({color:0x10131c, flatShading:true}));
      m.scale.set(1.25,1.5+Math.random(),1.25);
      m.rotation.y=Math.random()*6.28;
      scene.add(m); return m;
    }
    function spawn(){
      const light=Math.random()<.42;
      ents.push({x:50+Math.random()*(W-100), y:-30, v:1.5+Math.random()*1.7,
        light, ph:Math.random()*6.28, sway:.6+Math.random()*.9,
        mesh: light?makeOrb():makeReef()});
    }
    function killEnt(i){ const e=ents[i]; scene.remove(e.mesh); ents.splice(i,1); }

    /* 3D坐标 → 屏幕比例（DOM飘字定位用） */
    const vec=new THREE.Vector3();
    function popAt(obj, text){
      vec.setFromMatrixPosition(obj.matrixWorld).project(camera);
      J.pop(cv, (vec.x+1)/2, Math.max(.06,(1-vec.y)/2-.08), text);
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
        if(px<34){ px=34; vx*=-.4; shake.hit(.12); }
        if(px>W-34){ px=W-34; vx*=-.4; shake.hit(.12); }
        if(inv>0) inv--;
      }
      tilt=J.lerp(tilt, vx*.045, .16);
      if(act) P.update();

      /* 海浪 */
      for(let i=0;i<seaPos.count;i++){
        const x=seaPos.getX(i), z=seaPos.getZ(i);
        seaPos.setY(i, Math.sin(x/6+t/26)*.55 + Math.sin(z/4.2+t/17)*.35);
      }
      seaPos.needsUpdate=true;
      if(t%2===0) seaGeo.computeVertexNormals();
      lane.forEach((m,i)=>{ m.material.opacity=.07+.05*Math.abs(Math.sin(t/22+i)); });

      /* 闪电：环境光短暂增亮 */
      amb.intensity=.9+(flash>0?.9:0);
      scene.background.setHex(flash>0?0x111a30:0x05060f);

      /* 船 */
      const bobY=Math.sin(t/14)*.3;
      boat.position.set(X(px), .55+bobY, 0);
      boat.rotation.z=-tilt*2.2;
      boat.rotation.x=Math.sin(t/19)*.045;
      boat.visible=!(inv>0 && t%8<4);
      if(act && Math.abs(vx)>1 && t%3===0)
        P.spawn({x:boat.position.x-Math.sign(vx)*2, y:.35, z:.6, n:2, speed:.12,
          life:30, color:'#9fb2dd', spreadY:.4});

      /* 实体 */
      for(const e of ents){
        if(act){ e.y+=e.v; e.x+=Math.sin(t/30+e.ph)*e.sway*.4; }
        e.mesh.position.set(X(e.x), e.light? .9+Math.sin(t/9+e.ph)*.25 : .35, Z(e.y));
        if(e.light){
          const s=1+Math.sin(t/9+e.ph)*.22;
          e.mesh.userData.halo.scale.set(2.6*s,2.6*s,1);
        } else {
          e.mesh.rotation.y+=.004;
        }
      }

      if(act) for(let i=ents.length-1;i>=0;i--){
        const e=ents[i];
        if(e.y>H+30){ killEnt(i); continue; }
        if(Math.abs(e.x-px)<32 && Math.abs(e.y-BY)<26){
          if(e.light){
            score++;
            $('bg-score').textContent=`回忆之光 ${score} / 4`;
            J.hitstop(80); shake.punch(.07); sfx.chime();
            P.spawn({x:e.mesh.position.x, y:e.mesh.position.y, z:e.mesh.position.z,
              n:16, speed:.34, life:32, color:'#ffd98a'});
            popAt(e.mesh, '+ 回忆之光');
            killEnt(i);
            if(score>=4){ over=true; finish(); return; }
          } else if(inv<=0){
            J.hitstop(60); shake.hit(.55); screenTear(); flash=4;
            P.spawn({x:e.mesh.position.x, y:.8, z:e.mesh.position.z,
              n:12, speed:.3, life:34, color:'#26304a'});
            P.spawn({x:boat.position.x, y:.5, z:.4, n:10, speed:.26, life:30, color:'#9fb2dd'});
            killEnt(i); inv=60;
            $('bg-warn').textContent='暗礁！';
            setTimeout(()=>{ const w=$('bg-warn'); if(w) w.textContent=''; },1200);
          }
        }
      }

      /* 镜头微跟随 */
      shake.base.set(boat.position.x*.35, 5.6, 11);
      shake.update();
      camera.lookAt(boat.position.x*.5, 1.1, -14);

      renderer.render(scene,camera);
      requestAnimationFrame(loop);
    }

    function finish(){
      removeEventListener('keydown',onKey); removeEventListener('keyup',onKey);
      heartbeat(false); sfx.waves(false); sfx.chime(); burstCenter();
      delete window.__g;
      setTimeout(()=>{ T3.dispose(renderer,scene); resolve(); },1200);
    }
    loop();
  });
}
