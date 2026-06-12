"use strict";
function monumentGame(){
  return new Promise(resolve=>{
    /* ── overlay ── */
    const ov=document.createElement('div');
    ov.style.cssText='position:fixed;inset:0;z-index:9999;background:#0d0d1a;overflow:hidden';
    document.body.appendChild(ov);

    const skipBtn=document.createElement('div');
    skipBtn.textContent='跳过开场 ›';
    skipBtn.style.cssText='position:absolute;top:16px;right:20px;color:rgba(255,255,255,.4);font:14px/1 sans-serif;cursor:pointer;z-index:10;letter-spacing:.1em;padding:6px 10px';
    ov.appendChild(skipBtn);

    const hintEl=document.createElement('div');
    hintEl.textContent='点击建筑移动 · 点击发光机关旋转';
    hintEl.style.cssText='position:absolute;bottom:18px;left:50%;transform:translateX(-50%);color:rgba(200,190,175,.5);font:13px/1 sans-serif;letter-spacing:.12em;pointer-events:none;z-index:10;white-space:nowrap';
    ov.appendChild(hintEl);

    const titleCard=document.createElement('div');
    titleCard.style.cssText='position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;z-index:5;opacity:0;transition:opacity .6s';
    titleCard.innerHTML='<div style="color:rgba(220,210,195,.9);font:300 24px \'Songti SC\',serif;letter-spacing:.4em;text-shadow:0 0 40px rgba(200,170,120,.7)">旋 柱 幻 廊</div><div style="margin-top:14px;color:rgba(180,165,145,.55);font:300 13px \'Songti SC\',serif;letter-spacing:.25em">第 二 晚 · 山 之 房</div>';
    ov.appendChild(titleCard);

    if(typeof THREE==='undefined'){ ov.remove(); resolve(); return; }

    /* ── renderer ── */
    const W=ov.clientWidth||window.innerWidth, H=ov.clientHeight||window.innerHeight;
    const renderer=new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(W,H); renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.15;
    renderer.domElement.style.cssText='position:absolute;inset:0;width:100%!important;height:100%!important';
    ov.insertBefore(renderer.domElement, ov.firstChild);

    const scene=new THREE.Scene();
    scene.background=new THREE.Color(0x0c0c1a);
    scene.fog=new THREE.FogExp2(0x0c0c1a,.018);

    /* ── camera ── */
    const aspect=W/H;
    let fSize=24;
    const camera=new THREE.OrthographicCamera(-fSize*aspect/2,fSize*aspect/2,fSize/2,-fSize/2,0.1,300);
    const camTarget=new THREE.Vector3(0,3,-13);
    let camEl=0.09, camAz=Math.PI/4+.28, camDist=50; // intro start
    const TARGET_EL=Math.PI/5, TARGET_AZ=Math.PI/4, TARGET_DIST=42, TARGET_FSIZE=24;

    function applyCamera(){
      camera.position.set(
        camTarget.x+camDist*Math.cos(camEl)*Math.sin(camAz),
        camTarget.y+camDist*Math.sin(camEl),
        camTarget.z+camDist*Math.cos(camEl)*Math.cos(camAz)
      );
      camera.lookAt(camTarget);
      camera.left=-fSize*aspect/2; camera.right=fSize*aspect/2;
      camera.top=fSize/2; camera.bottom=-fSize/2;
      camera.updateProjectionMatrix();
    }
    applyCamera();

    /* ── lights ── */
    scene.add(new THREE.AmbientLight(0x8899cc,.55));
    const sun=new THREE.DirectionalLight(0xffe8c0,1.5);
    sun.position.set(9,16,8); sun.castShadow=true;
    sun.shadow.mapSize.set(2048,2048);
    ['left','right','top','bottom'].forEach((k,i)=>sun.shadow.camera[k]=[-24,24,24,-24][i]);
    sun.shadow.camera.far=120; scene.add(sun);
    const fill=new THREE.DirectionalLight(0xc0d0ff,.35);
    fill.position.set(-8,5,-10); scene.add(fill);

    /* ── helpers ── */
    const lmb=c=>new THREE.MeshLambertMaterial({color:c});
    const lmbE=(c,e,i)=>new THREE.MeshLambertMaterial({color:c,emissive:e,emissiveIntensity:i});
    function mkBox(w,h,d,mat,pos,cast=true,recv=true){
      const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
      if(pos) m.position.set(...pos); m.castShadow=cast; m.receiveShadow=recv; scene.add(m); return m;
    }
    function mkCyl(rt,rb,h,seg,mat,pos){
      const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),mat);
      if(pos) m.position.set(...pos); m.castShadow=true; scene.add(m); return m;
    }

    /* ── SCENE ── */
    // start island
    mkBox(10,1.6,10,lmb(0xb8c5d0),[0,-.8,2]);
    mkBox(10.4,.5,10.4,lmb(0x98a8b8),[0,-1.65,2]);
    mkBox(10.8,.4,10.8,lmb(0x7e8fa0),[0,-2.15,2]);

    // far shore
    mkBox(8,1.6,8,lmb(0xc5b8d0),[0,-.8,-9]);
    mkBox(8.4,.5,8.4,lmb(0xa598b8),[0,-1.65,-9]);

    // tower body
    mkBox(3.2,11,3.2,lmb(0xa8b2a8),[0,3.8,-18]);
    mkBox(4,.4,4,lmb(0x98a298),[0,9.2,-18]);

    // stairs (3-step Z-path)
    mkBox(3,1.4,3,lmb(0xd0c5b8),[0,.7,-16]);
    mkBox(3,1.4,3,lmb(0xc5b8a8),[1.5,2.2,-18]);
    mkBox(3,1.4,3,lmb(0xbaaaa0),[-1,3.7,-20]);

    // tower top
    mkBox(9,1.6,9,lmb(0xb2ccbf),[0,5.3,-24]);
    mkBox(9.4,.5,9.4,lmb(0x90aaA0),[0,4.35,-24]);

    // low parapet walls on tower top
    mkBox(9,.5,.3,lmb(0xb2ccbf),[0,5.9,-28.3]);
    mkBox(9,.5,.3,lmb(0xb2ccbf),[0,5.9,-19.7]);
    mkBox(.3,.5,9,lmb(0xb2ccbf),[-4.35,5.9,-24]);

    // ── clouds ──
    const cloudMat=new THREE.MeshLambertMaterial({color:0xe8eef5,transparent:true,opacity:.55});
    [[-9,-6,-2],[12,-7,0],[-14,-5,-9],[16,-6,-15],[-7,-8,-20],[14,-5,-25],[-12,-7,-28],[5,-9,-32]].forEach(([cx,cy,cz])=>{
      const m=new THREE.Mesh(new THREE.BoxGeometry(7+Math.random()*5,1.8,4+Math.random()*4),cloudMat);
      m.position.set(cx,cy,cz); m.castShadow=false; m.receiveShadow=false; scene.add(m);
    });

    /* ── MECHANISM A – Coral Pillar ── */
    const grpA=new THREE.Group(); grpA.position.set(0,.1,-4); scene.add(grpA);
    const matA=lmb(0xe0956a), matAg=lmbE(0xf0a878,0xf08040,.4);
    const pedA=new THREE.Mesh(new THREE.BoxGeometry(1.2,.7,1.2),matA);
    pedA.position.set(0,-.45,0); pedA.castShadow=true; grpA.add(pedA);
    const cylA=new THREE.Mesh(new THREE.CylinderGeometry(.32,.38,1.3,8),matAg);
    cylA.position.set(0,.35,0); cylA.castShadow=true; grpA.add(cylA);
    const orbA=new THREE.Mesh(new THREE.SphereGeometry(.26,12,8),matAg);
    orbA.position.set(0,1.1,0); grpA.add(orbA);
    // rotating arm group
    const armGrpA=new THREE.Group(); armGrpA.position.set(0,1,0); grpA.add(armGrpA);
    const armA1=new THREE.Mesh(new THREE.BoxGeometry(7,.32,.5),matA); armA1.castShadow=true; armGrpA.add(armA1);
    const armA2=new THREE.Mesh(new THREE.BoxGeometry(.5,.32,4),matA); armA2.castShadow=true; armGrpA.add(armA2);
    // Remove the scene.add() for pedA (it was added to scene by mkBox above)
    // Actually mkBox adds to scene, so I need a different approach for group children.
    // Let me NOT use mkBox for group children from here.

    /* ── MECHANISM B – Amber Disc ── */
    const grpB=new THREE.Group(); grpB.position.set(-3,.1,-13); scene.add(grpB);
    const matB=lmb(0xe0c060), matBg=lmbE(0xf0d878,0xd0a020,.4);
    const pedB=new THREE.Mesh(new THREE.BoxGeometry(1.4,.6,1.4),matB);
    pedB.position.set(0,-.3,0); pedB.castShadow=true; grpB.add(pedB);
    const discB=new THREE.Mesh(new THREE.CylinderGeometry(1.9,1.9,.45,6),matBg);
    discB.position.set(0,.3,0); discB.castShadow=true; grpB.add(discB);
    const gemB=new THREE.Mesh(new THREE.OctahedronGeometry(.52),matBg);
    gemB.position.set(0,.7,0); grpB.add(gemB);

    /* ── MECHANISM C – Jade Arm ── */
    const grpC=new THREE.Group(); grpC.position.set(3.5,5.6,-24); scene.add(grpC);
    const matC=lmb(0x72c898), matCg=lmbE(0x88d8a8,0x20a060,.4);
    const pedC=new THREE.Mesh(new THREE.BoxGeometry(1.2,.6,1.2),matC);
    pedC.position.set(0,-.3,0); pedC.castShadow=true; grpC.add(pedC);
    const cylC=new THREE.Mesh(new THREE.CylinderGeometry(.3,.34,1,8),matCg);
    cylC.position.set(0,.2,0); cylC.castShadow=true; grpC.add(cylC);
    const armGrpC=new THREE.Group(); armGrpC.position.set(0,.75,0); grpC.add(armGrpC);
    const armC1=new THREE.Mesh(new THREE.BoxGeometry(5,.35,.5),matC);
    armC1.position.set(2.2,0,0); armC1.castShadow=true; armGrpC.add(armC1);
    const armC2=new THREE.Mesh(new THREE.BoxGeometry(.5,.35,3),matC);
    armC2.position.set(4.7,0,-1.2); armC2.castShadow=true; armGrpC.add(armC2);

    /* ── dynamic bridge tiles ── */
    const bridgeMatA=lmb(0xd0bec8);
    const tileA=new THREE.Mesh(new THREE.BoxGeometry(.55,.22,7.2),bridgeMatA);
    tileA.position.set(0,.92,-4); tileA.visible=false; tileA.castShadow=true; scene.add(tileA);

    const bridgeMatC=lmb(0x90c8b0);
    const tileC=new THREE.Mesh(new THREE.BoxGeometry(4.5,.22,.55),bridgeMatC);
    tileC.position.set(6.25,5.62,-24); tileC.visible=false; tileC.castShadow=true; scene.add(tileC);

    /* ── light door ── */
    const doorGroup=new THREE.Group(); doorGroup.position.set(10,6,-24); scene.add(doorGroup);
    const doorFrameMat=lmb(0xa0b0a0);
    const dfL=new THREE.Mesh(new THREE.BoxGeometry(.35,4,.35),doorFrameMat); dfL.position.set(-1,0,0); doorGroup.add(dfL);
    const dfR=new THREE.Mesh(new THREE.BoxGeometry(.35,4,.35),doorFrameMat); dfR.position.set(1,0,0); doorGroup.add(dfR);
    const dfT=new THREE.Mesh(new THREE.BoxGeometry(2.35,.35,.35),doorFrameMat); dfT.position.set(0,2,0); doorGroup.add(dfT);
    const doorGlowMat=new THREE.MeshLambertMaterial({color:0xfffce0,emissive:0xffe880,emissiveIntensity:1.6,transparent:true,opacity:.92,side:THREE.DoubleSide});
    const doorPlane=new THREE.Mesh(new THREE.PlaneGeometry(1.9,3.7),doorGlowMat);
    doorPlane.position.set(0,0,.05); doorGroup.add(doorPlane);
    const doorLight=new THREE.PointLight(0xffe880,3,10); doorLight.position.set(10,6,-24); scene.add(doorLight);

    /* ── player ── */
    const playerGrp=new THREE.Group(); scene.add(playerGrp);
    const pMat=new THREE.MeshLambertMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:.15});
    const pBody=new THREE.Mesh(new THREE.CylinderGeometry(.18,.22,.7,8),pMat);
    pBody.position.y=.55; playerGrp.add(pBody);
    const pHead=new THREE.Mesh(new THREE.SphereGeometry(.2,10,8),pMat);
    pHead.position.y=1.1; playerGrp.add(pHead);
    const pHat=new THREE.Mesh(new THREE.ConeGeometry(.18,.44,8),pMat);
    pHat.position.y=1.52; playerGrp.add(pHat);
    const pLight=new THREE.PointLight(0xffffff,.6,3); pLight.position.y=1; playerGrp.add(pLight);

    /* ── waypoints ── */
    const WP=[
      {id:0, p:new THREE.Vector3(0,.75,4)},
      {id:1, p:new THREE.Vector3(0,.75,-.5)},
      {id:2, p:new THREE.Vector3(0,.92,-4)},   // bridge A
      {id:3, p:new THREE.Vector3(0,.75,-6.5)},
      {id:4, p:new THREE.Vector3(-1,.75,-11)},
      {id:5, p:new THREE.Vector3(0,1.4,-16)},
      {id:6, p:new THREE.Vector3(1.5,2.9,-18)},
      {id:7, p:new THREE.Vector3(-1,4.4,-20)},
      {id:8, p:new THREE.Vector3(0,5.6,-22)},
      {id:9, p:new THREE.Vector3(2.5,5.6,-24)},
      {id:10,p:new THREE.Vector3(6.5,5.62,-24)}, // bridge C
      {id:11,p:new THREE.Vector3(10,6,-24)},     // door WIN
    ];

    /* ── game state ── */
    const S={
      mechA:false, mechB:false, mechC:false,
      wp:0, moving:false, over:false,
      phase:0, // 0=intro, 1=play, 2=end
      t:0, running:true
    };
    playerGrp.position.copy(WP[0].p);

    /* ── connectivity ── */
    function graph(){
      const g={0:[1],1:[0],3:[4],4:[3],5:[6],6:[5,7],7:[6,8],8:[7,9],9:[8]};
      if(S.mechA){g[1]=[...g[1],2]; g[2]=[1,3]; g[3]=[...g[3],2];}
      if(S.mechB){g[4]=[...g[4],5]; g[5]=[...g[5],4];}
      if(S.mechC){g[9]=[...g[9],10]; g[10]=[9,11]; g[11]=[10];}
      return g;
    }
    function bfs(g,from,to){
      const prev={[from]:null}; const q=[from];
      while(q.length){const c=q.shift(); if(c===to) break; for(const n of(g[c]||[])) if(!(n in prev)){prev[n]=c; q.push(n);}}
      if(!(to in prev)) return null;
      const p=[]; let c=to; while(c!==null){p.unshift(c); c=prev[c];} return p;
    }

    /* ── animation queues ── */
    const tweens=[];
    function tween(dur,onUpdate,onDone){
      const start=S.t; tweens.push({start,dur,onUpdate,onDone,done:false});
    }

    /* ── mechanism rotation ── */
    const mechRot={A:0,B:0,C:0};
    function rotateMech(name){
      if(S.moving||S.over) return;
      playSound('ratchet');
      const from=mechRot[name], to=from+Math.PI/2;
      tween(.52,p=>{
        const e=p<.5?2*p*p:-1+(4-2*p)*p;
        const r=from+(to-from)*e;
        if(name==='A') armGrpA.rotation.y=r;
        else if(name==='B') grpB.rotation.y=r;
        else armGrpC.rotation.y=r;
      },()=>{
        mechRot[name]=to;
        const norm=((to%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
        const snap=Math.abs(norm-Math.PI/2)<.12;
        if(snap){
          if(name==='A'&&!S.mechA){S.mechA=true; tileA.visible=true; playSound('bridge');}
          if(name==='B'&&!S.mechB){S.mechB=true; playSound('bridge');}
          if(name==='C'&&!S.mechC){S.mechC=true; tileC.visible=true; playSound('bridge');}
        }
      });
    }

    /* ── player movement ── */
    function moveTo(wpId){
      if(S.moving||S.over||wpId===S.wp) return;
      const path=bfs(graph(),S.wp,wpId);
      if(!path||path.length<2){playSound('deny'); return;}
      S.moving=true;
      let step=1;
      function walkStep(){
        if(step>=path.length){S.moving=false; S.wp=wpId; if(wpId===11) setTimeout(doEnding,500); return;}
        const dest=WP[path[step]].p.clone();
        const src=playerGrp.position.clone();
        // face direction of travel
        const dx=dest.x-src.x, dz=dest.z-src.z;
        const targetY=Math.atan2(dx,dz);
        tween(.55,p=>{
          const e=p<.5?2*p*p:-1+(4-2*p)*p;
          playerGrp.position.lerpVectors(src,dest,e);
          playerGrp.position.y+=Math.sin(p*Math.PI)*.35;
          playerGrp.rotation.y=targetY;
          if(Math.abs(p-.5)<.06) playSound('step');
        },()=>{
          playerGrp.position.copy(dest);
          step++; walkStep();
        });
      }
      walkStep();
    }

    /* ── raycasting ── */
    const ray=new THREE.Raycaster();
    const zones=[];
    WP.forEach(w=>{
      const z=new THREE.Mesh(new THREE.BoxGeometry(2.8,1.4,2.8),new THREE.MeshBasicMaterial({visible:false}));
      z.position.copy(w.p); z.position.y-=.3; scene.add(z);
      zones.push({mesh:z, wpId:w.id});
    });
    const mechZones=[
      {grp:grpA, name:'A'},
      {grp:grpB, name:'B'},
      {grp:grpC, name:'C'},
    ].map(({grp,name})=>{
      const z=new THREE.Mesh(new THREE.BoxGeometry(5,5,5),new THREE.MeshBasicMaterial({visible:false}));
      grp.add(z); return {mesh:z, name};
    });

    const mouse2=new THREE.Vector2();
    function onPtr(e){
      if(S.phase!==1) return;
      const r=renderer.domElement.getBoundingClientRect();
      const cx=e.touches?e.touches[0].clientX:e.clientX;
      const cy=e.touches?e.touches[0].clientY:e.clientY;
      mouse2.x=((cx-r.left)/r.width)*2-1;
      mouse2.y=-((cy-r.top)/r.height)*2+1;
      ray.setFromCamera(mouse2,camera);
      for(const{mesh,name} of mechZones){
        if(ray.intersectObject(mesh,false).length){rotateMech(name); return;}
      }
      const hits=ray.intersectObjects(zones.map(z=>z.mesh),false);
      if(hits.length){
        const z=zones.find(z=>z.mesh===hits[0].object);
        if(z) moveTo(z.wpId);
      }
    }
    renderer.domElement.addEventListener('pointerdown',onPtr);
    renderer.domElement.addEventListener('touchstart',onPtr,{passive:true});

    /* ── audio ── */
    let audioCtx;
    const PENTA=[196,220,246.94,293.66,329.63];
    function ac(){
      if(!audioCtx) audioCtx=new(window.AudioContext||window.webkitAudioContext)();
      if(audioCtx.state==='suspended') audioCtx.resume();
      return audioCtx;
    }
    function note(freq,type,dur,vol){
      try{const a=ac(),o=a.createOscillator(),g=a.createGain();
        o.connect(g); g.connect(a.destination);
        o.type=type; o.frequency.value=freq;
        g.gain.setValueAtTime(vol,a.currentTime);
        g.gain.exponentialRampToValueAtTime(.001,a.currentTime+dur);
        o.start(); o.stop(a.currentTime+dur);}catch(e){}
    }
    let ambientNode=null;
    function playSound(type){
      try{
        const a=ac();
        if(type==='step') note(PENTA[Math.random()*5|0]*2,'triangle',.07,.12);
        else if(type==='ratchet'){
          for(let i=0;i<3;i++) setTimeout(()=>{
            const b=a.createBuffer(1,a.sampleRate*.045,a.sampleRate);
            const d=b.getChannelData(0); for(let j=0;j<d.length;j++) d[j]=(Math.random()*2-1)*.28;
            const s=a.createBufferSource(),f=a.createBiquadFilter();
            f.type='bandpass'; f.frequency.value=700+i*350; f.Q.value=1.5;
            s.buffer=b; s.connect(f); f.connect(a.destination); s.start();
          },i*65);
          setTimeout(()=>note(PENTA[2]*2,'triangle',.14,.22),200);
        }
        else if(type==='bridge'){
          note(PENTA[0]*2,'sine',.35,.32);
          setTimeout(()=>note(PENTA[2]*2,'sine',.35,.32),55);
        }
        else if(type==='deny') note(75,'sine',.22,.18);
        else if(type==='win') PENTA.forEach((f,i)=>setTimeout(()=>note(f*2,'triangle',.38,.36),i*115));
        else if(type==='ambient'&&!ambientNode){
          const o=a.createOscillator(),g=a.createGain(),f=a.createBiquadFilter();
          const lfo=a.createOscillator(),lg=a.createGain();
          o.type='sawtooth'; o.frequency.value=48;
          f.type='lowpass'; f.frequency.value=190;
          lfo.frequency.value=.18; lg.gain.value=35;
          lfo.connect(lg); lg.connect(f.frequency);
          o.connect(f); f.connect(g); g.connect(a.destination);
          g.gain.setValueAtTime(.07,a.currentTime); o.start(); lfo.start();
          ambientNode={osc:o,gain:g};
        }
      }catch(e){}
    }

    /* ── intro cinematic ── */
    const INTRO=8;
    function introTick(t){
      const p=Math.min(1,t/INTRO);
      const e=p<.5?2*p*p:-1+(4-2*p)*p;
      camEl=.09+(TARGET_EL-.09)*e;
      camAz=(Math.PI/4+.28)+(TARGET_AZ-(Math.PI/4+.28))*e;
      camDist=50+(TARGET_DIST-50)*e;
      fSize=28+(TARGET_FSIZE-28)*e;
      applyCamera();
      if(t>=7&&titleCard.style.opacity==='0') titleCard.style.opacity='1';
      if(t>=7.7) titleCard.style.opacity='0';
      if(p>=1){ S.phase=1; skipBtn.style.display='none'; playSound('ambient'); }
    }
    function skipIntro(){
      if(S.phase!==0) return;
      S.phase=1; skipBtn.style.display='none'; titleCard.style.opacity='0';
      camEl=TARGET_EL; camAz=TARGET_AZ; camDist=TARGET_DIST; fSize=TARGET_FSIZE;
      applyCamera(); playSound('ambient');
    }
    skipBtn.addEventListener('click',skipIntro);

    /* ── ending ── */
    function doEnding(){
      S.over=true; S.phase=2;
      playSound('win');
      if(ambientNode) try{ambientNode.gain.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+2);}catch(e){}
      tween(1.2,p=>{
        playerGrp.scale.setScalar(1-p);
        doorLight.intensity=3+p*10;
      },()=>{
        // white flash card
        const card=document.createElement('div');
        card.style.cssText='position:absolute;inset:0;background:rgba(252,245,228,0);z-index:8;transition:background 1.2s;display:flex;align-items:center;justify-content:center';
        card.innerHTML='<span id="endTxt" style="color:rgba(60,38,18,0);font:300 52px \'Songti SC\',serif;letter-spacing:.6em;transition:color 1.2s">终</span>';
        ov.appendChild(card);
        requestAnimationFrame(()=>{
          card.style.background='rgba(252,245,228,.9)';
          card.querySelector('#endTxt').style.color='rgba(60,38,18,.88)';
        });
        setTimeout(()=>{
          renderer.domElement.removeEventListener('pointerdown',onPtr);
          if(ambientNode) try{ambientNode.osc.stop();}catch(e){}
          S.running=false;
          ov.remove();
          resolve();
        },2800);
      });
    }

    /* ── main loop ── */
    let last=null;
    function tick(ts){
      if(!S.running) return;
      const dt=last===null?0:Math.min((ts-last)/1000,.05);
      last=ts; S.t+=dt;

      // intro
      if(S.phase===0) introTick(S.t);

      // tick tweens
      for(let i=tweens.length-1;i>=0;i--){
        const tw=tweens[i]; if(tw.done) continue;
        const p=Math.min(1,(S.t-tw.start)/tw.dur);
        tw.onUpdate(p);
        if(p>=1){ tw.done=true; if(tw.onDone) tw.onDone(); tweens.splice(i,1);}
      }

      // idle
      if(!S.over){
        // player idle float
        if(!S.moving) playerGrp.position.y+=Math.sin(S.t*1.6)*.003;
        // door pulse
        doorLight.intensity=2.4+Math.sin(S.t*2.2)*.5;
        doorPlane.material.emissiveIntensity=1.4+Math.sin(S.t*2.2)*.3;
        // mech orbits
        orbA.rotation.y=S.t*1.1;
        gemB.rotation.y=S.t*.75; gemB.rotation.x=S.t*.4;
        // mech glow pulse (for unactivated mechs)
        if(!S.mechA) cylA.material.emissiveIntensity=.3+Math.sin(S.t*3)*.15;
        if(!S.mechB) discB.material.emissiveIntensity=.3+Math.sin(S.t*2.7+1)*.15;
        if(!S.mechC) cylC.material.emissiveIntensity=.3+Math.sin(S.t*2.5+2)*.15;
      }

      renderer.render(scene,camera);
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}
