"use strict";
/* ============================================================
   第四晚 · 《珊瑚之塔》—— Monument Valley 风格 3D 解谜关卡
   依赖：全局 THREE（CDN r160）、可选全局 sfx（sfx.chime）
   导出：monumentGame() -> Promise（通关后 resolve）

   流程：起点岛 → 机关A珊瑚柱(桥) → 河对岸 → 机关B琥珀盘(开路)
         → Z字三级楼梯 → 塔顶 → 机关C翡翠臂(桥) → 光门·终
   ============================================================ */
function monumentGame(){
  return new Promise(resolve=>{

    /* ---------- 1. 环境检查 ---------- */
    if(typeof THREE==='undefined'){ resolve(); return; }

    /* ---------- 2. overlay + UI ---------- */
    const ov=document.createElement('div');
    ov.style.cssText='position:fixed;inset:0;z-index:9999;background:#0d1020;overflow:hidden';
    document.body.appendChild(ov);

    // 跳过开场按钮（仅 t<8s 可见）
    const skipBtn=document.createElement('div');
    skipBtn.textContent='跳过 ›';
    skipBtn.style.cssText='position:absolute;top:16px;right:20px;color:rgba(255,255,255,.4);'
      +'font:14px/1 sans-serif;cursor:pointer;z-index:10;letter-spacing:.12em;padding:8px 12px;user-select:none';
    ov.appendChild(skipBtn);

    // 操作提示
    const hintEl=document.createElement('div');
    hintEl.textContent='点击地面移动 · 点击发光机关旋转';
    hintEl.style.cssText='position:absolute;bottom:18px;left:50%;transform:translateX(-50%);'
      +'color:rgba(200,195,180,.45);font:13px/1 sans-serif;letter-spacing:.14em;'
      +'pointer-events:none;z-index:10;white-space:nowrap;opacity:0;transition:opacity 1.2s';
    ov.appendChild(hintEl);

    // 标题卡（开场 t=7~7.8s 淡入淡出）
    const titleCard=document.createElement('div');
    titleCard.style.cssText='position:absolute;inset:0;display:flex;flex-direction:column;'
      +'align-items:center;justify-content:center;pointer-events:none;z-index:5;opacity:0;transition:opacity .4s';
    titleCard.innerHTML=
      '<div style="color:rgba(225,215,200,.92);font:300 26px \'Songti SC\',\'STSong\',serif;'
      +'letter-spacing:.45em;text-shadow:0 0 36px rgba(220,180,130,.6)">旋 柱 幻 廊</div>'
      +'<div style="margin-top:14px;color:rgba(185,170,150,.5);font:300 13px serif;letter-spacing:.3em">珊 瑚 之 塔</div>';
    ov.appendChild(titleCard);

    /* ---------- 3. renderer + scene + camera ---------- */
    let W=ov.clientWidth||window.innerWidth, H=ov.clientHeight||window.innerHeight;
    let renderer;
    try{
      renderer=new THREE.WebGLRenderer({antialias:true});
    }catch(e){ ov.remove(); resolve(); return; }
    const PR=Math.min(window.devicePixelRatio||1,2);
    renderer.setPixelRatio(PR);
    renderer.setSize(W,H);
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.toneMapping=THREE.ACESFilmicToneMapping; // 注：渲染到RT时不生效，后处理中手动补ACES
    renderer.domElement.style.cssText='position:absolute;inset:0;width:100%;height:100%';
    ov.insertBefore(renderer.domElement,ov.firstChild);
    const dom=renderer.domElement;

    const scene=new THREE.Scene();
    scene.background=new THREE.Color(0x0d1020);
    scene.fog=new THREE.FogExp2(0x0d1020,0.018);

    // 正交相机：标准等距视角 az=PI/4 el=PI/5 dist=40，观察中心(0,3,-12)
    const camTarget=new THREE.Vector3(0,3,-12);
    const STD_AZ=Math.PI/4, STD_EL=Math.PI/5, STD_DIST=40, STD_FRUS=26;
    let camAz=STD_AZ-0.22, camEl=0.08, camDist=60, frus=30; // 开场低仰角起点
    const camera=new THREE.OrthographicCamera(-1,1,1,-1,0.1,300);
    function applyCamera(){
      const a=W/H;
      camera.left=-frus*a/2; camera.right=frus*a/2;
      camera.top=frus/2; camera.bottom=-frus/2;
      camera.position.set(
        camTarget.x+camDist*Math.cos(camEl)*Math.sin(camAz),
        camTarget.y+camDist*Math.sin(camEl),
        camTarget.z+camDist*Math.cos(camEl)*Math.cos(camAz));
      camera.lookAt(camTarget);
      camera.updateProjectionMatrix();
    }
    applyCamera();

    /* ---------- 4. 光照：暖主光长阴影 + 冷补光 + 环境光 ---------- */
    const sun=new THREE.DirectionalLight(0xffe8c0,1.4);
    sun.position.set(8,14,6);
    sun.target.position.set(0,0,-12);
    sun.castShadow=true;
    sun.shadow.mapSize.set(2048,2048);
    sun.shadow.camera.left=-28; sun.shadow.camera.right=28;
    sun.shadow.camera.top=28; sun.shadow.camera.bottom=-28;
    sun.shadow.camera.near=1; sun.shadow.camera.far=120;
    sun.shadow.bias=-0.0004;
    scene.add(sun); scene.add(sun.target);

    const fill=new THREE.DirectionalLight(0xc0d8ff,0.3);
    fill.position.set(-6,4,-8); scene.add(fill);
    scene.add(new THREE.AmbientLight(0x8899cc,0.5));

    /* ---------- 5. 材质表（低饱和配色） ---------- */
    const MAT={
      islandTop : new THREE.MeshLambertMaterial({color:0xb8c5d0}),
      islandSide: new THREE.MeshLambertMaterial({color:0x8898a8}),
      shoreTop  : new THREE.MeshLambertMaterial({color:0xc5b8d0}),
      shoreSide : new THREE.MeshLambertMaterial({color:0xa598b0}),
      stair1    : new THREE.MeshLambertMaterial({color:0xd0c5b8}),
      stair2    : new THREE.MeshLambertMaterial({color:0xc2b5a8}),
      stair3    : new THREE.MeshLambertMaterial({color:0xb4a698}),
      towerTop  : new THREE.MeshLambertMaterial({color:0xb8d0c5}),
      towerBody : new THREE.MeshLambertMaterial({color:0xa8b8a8}),
      cloud     : new THREE.MeshLambertMaterial({color:0xe0e8f0,transparent:true,opacity:0.5}),
      mechA     : new THREE.MeshLambertMaterial({color:0xe8a07a}),
      mechAGlow : new THREE.MeshLambertMaterial({color:0xe8a07a,emissive:0xe07040,emissiveIntensity:0.4}),
      mechB     : new THREE.MeshLambertMaterial({color:0xe8c87a}),
      mechBGlow : new THREE.MeshLambertMaterial({color:0xe8c87a,emissive:0xd09020,emissiveIntensity:0.4}),
      mechC     : new THREE.MeshLambertMaterial({color:0x7ac8a0}),
      mechCGlow : new THREE.MeshLambertMaterial({color:0x7ac8a0,emissive:0x20a060,emissiveIntensity:0.4}),
      door      : new THREE.MeshLambertMaterial({color:0xfff4d0,emissive:0xffe890,emissiveIntensity:2.0,
                    transparent:true,opacity:0.92,side:THREE.DoubleSide}),
      doorFrame : new THREE.MeshLambertMaterial({color:0xa8b8a8}),
      player    : new THREE.MeshLambertMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:0.3}),
      hidden    : new THREE.MeshBasicMaterial({visible:false}),
    };

    /* ---------- 6. 场景几何 ---------- */
    // 通用：顶面亮色 + 侧裙暗色的平台
    function platform(x,y,z,w,h,d,topMat,sideMat){
      const top=new THREE.Mesh(new THREE.BoxGeometry(w,h*0.45,d),topMat);
      top.position.set(x,y+h*0.275,z);
      const side=new THREE.Mesh(new THREE.BoxGeometry(w,h*0.55,d),sideMat);
      side.position.set(x,y-h*0.225,z);
      [top,side].forEach(m=>{m.castShadow=true;m.receiveShadow=true;scene.add(m);});
      return top;
    }
    function box(w,h,d,mat,x,y,z,parent){
      const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
      m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true;
      (parent||scene).add(m); return m;
    }

    // —— 平台（坐标为最终定稿，勿改）——
    platform(0,-0.75,2, 10,1.5,10, MAT.islandTop, MAT.islandSide);   // 起点岛 top y=0
    platform(0,-0.75,-9, 8,1.5,8,  MAT.shoreTop,  MAT.shoreSide);    // 河对岸 top y=0
    box(3,1.2,3, MAT.stair1, 0,0.6,-16);                             // stair1 top y=1.2
    box(3,1.2,3, MAT.stair2, 1.5,2.1,-18);                           // stair2 top y=2.7
    box(3,1.2,3, MAT.stair3, 0,3.6,-20);                             // stair3 top y=4.2
    platform(0,4.75,-23, 9,1.5,9, MAT.towerTop, MAT.towerBody);      // 塔顶 top y=5.5
    box(3,8,3, MAT.towerBody, 0,4.0,-18);                            // 装饰塔身
    box(3.6,0.5,3.6, MAT.towerBody, 0,8.25,-18);                     // 塔身檐口
    // 塔身暗窗（装饰）
    const winMat=new THREE.MeshLambertMaterial({color:0x2a3448});
    box(0.6,1.1,0.08, winMat, 0,6.2,-16.46);
    box(0.08,1.1,0.6, winMat, 1.54,5.0,-18);
    // 塔顶矮护墙（远侧两边，不挡行走路线）
    box(9,0.5,0.3, MAT.towerTop, 0,5.95,-27.35);
    box(0.3,0.5,7, MAT.towerTop, -4.35,5.95,-23.5);
    // 平台底部裙摆层（向下渐暗渐收）
    box(10.6,0.4,10.6, new THREE.MeshLambertMaterial({color:0x6e7e90}), 0,-1.75,2);
    box(8.6,0.4,8.6,  new THREE.MeshLambertMaterial({color:0x857898}), 0,-1.75,-9);

    // —— 云层（漂浮装饰）——
    const clouds=[];
    [[-10,-5,0],[13,-6,-3],[-15,-4,-10],[16,-5,-17],[-8,-7,-22],[13,-4,-27],[-13,-6,-30],[6,-8,-33]]
    .forEach(([cx,cy,cz],i)=>{
      const m=new THREE.Mesh(new THREE.BoxGeometry(6+(i%3)*2.5,1.6,4+(i%2)*2.5),MAT.cloud);
      m.position.set(cx,cy,cz); scene.add(m);
      clouds.push({m,baseX:cx,ph:i*1.7,sp:0.12+(i%3)*0.05});
    });

    /* —— 机关A「珊瑚柱」(0,0,-4)：十字旋转柱，长臂转向Z轴后接通下层桥 —— */
    const mechAGrp=new THREE.Group(); mechAGrp.position.set(0,0,-4); scene.add(mechAGrp);
    box(1.0,5,1.0, MAT.mechA, 0,-2.7,0, mechAGrp);        // 水中立柱（从雾里升起）
    const rotorA=new THREE.Group(); mechAGrp.add(rotorA);
    box(6,0.3,1.1, MAT.mechA, 0,0.15,0, rotorA);          // 长臂（初始朝X轴，桥面 top y=0.3）
    box(1.1,0.3,2.6, MAT.mechA, 0,0.15,0, rotorA);        // 短臂 → 十字形
    const hubA=new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.48,0.9,8),MAT.mechAGlow);
    hubA.position.y=0.55; hubA.castShadow=true; rotorA.add(hubA);
    const orbA=new THREE.Mesh(new THREE.OctahedronGeometry(0.3),MAT.mechAGlow);
    orbA.position.y=1.25; mechAGrp.add(orbA);

    /* —— 机关B「琥珀盘」(-3,0,-13)：六边形盘，闸臂初始横挡楼梯入口 —— */
    const mechBGrp=new THREE.Group(); mechBGrp.position.set(-3,0,-13); scene.add(mechBGrp);
    box(1.4,1.0,1.4, MAT.mechB, 0,0.5,0, mechBGrp);       // 基座
    const rotorB=new THREE.Group(); rotorB.position.y=1.2; mechBGrp.add(rotorB);
    const discB=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.5,0.45,6),MAT.mechBGlow);
    discB.castShadow=true; rotorB.add(discB);
    box(4.6,1.5,0.55, MAT.mechB, 2.6,0.45,0, rotorB);     // 闸臂（初始朝+X，封住通往stair1的路）
    box(0.55,2.0,0.55, MAT.mechB, 4.7,0.7,0, rotorB);     // 闸臂端柱
    const gemB=new THREE.Mesh(new THREE.OctahedronGeometry(0.45),MAT.mechBGlow);
    gemB.position.y=2.0; mechBGrp.add(gemB);

    /* —— 机关C「翡翠臂」(3,5.5,-23)：L形臂，初始朝内(-Z)，转向+X后延伸到光门 —— */
    const mechCGrp=new THREE.Group(); mechCGrp.position.set(3,5.5,-23); scene.add(mechCGrp);
    box(1.2,0.7,1.2, MAT.mechC, 0,0.1,0, mechCGrp);       // 基座
    const hubC=new THREE.Mesh(new THREE.CylinderGeometry(0.34,0.4,1.0,8),MAT.mechCGlow);
    hubC.position.y=0.6; hubC.castShadow=true; mechCGrp.add(hubC);
    const rotorC=new THREE.Group(); rotorC.rotation.y=Math.PI/2; mechCGrp.add(rotorC); // 初始臂指向 -Z（朝内）
    box(5.6,0.35,1.0, MAT.mechC, 2.9,-0.25,0, rotorC);    // 长臂（local +X；rot=0 时桥面伸向光门）
    box(1.0,0.35,2.0, MAT.mechC, 5.2,-0.25,-1.0, rotorC); // L 短臂
    const orbC=new THREE.Mesh(new THREE.OctahedronGeometry(0.28),MAT.mechCGlow);
    orbC.position.y=1.35; mechCGrp.add(orbC);

    /* —— 光门 (8,6.5,-23)，门面朝X轴 —— */
    const doorGrp=new THREE.Group();
    doorGrp.position.set(8,6.5,-23); doorGrp.rotation.y=Math.PI/2; scene.add(doorGrp);
    box(0.35,4.2,0.35, MAT.doorFrame, -1.1,0,0, doorGrp);
    box(0.35,4.2,0.35, MAT.doorFrame,  1.1,0,0, doorGrp);
    box(2.55,0.35,0.35, MAT.doorFrame, 0,2.1,0, doorGrp);
    const doorPlane=new THREE.Mesh(new THREE.PlaneGeometry(1.85,3.9),MAT.door);
    doorGrp.add(doorPlane);
    const doorLight=new THREE.PointLight(0xffe890,3,12);
    doorLight.position.set(7.4,6.5,-23); scene.add(doorLight);

    /* —— 艾达（玩家）：白色胶囊体 + 圆锥帽，足底在组内 y=-0.6 —— */
    const playerGrp=new THREE.Group(); scene.add(playerGrp);
    const pBody=new THREE.Mesh(new THREE.CapsuleGeometry(0.22,0.5,6,12),MAT.player);
    pBody.position.y=-0.13; pBody.castShadow=true; playerGrp.add(pBody);
    const pHat=new THREE.Mesh(new THREE.ConeGeometry(0.18,0.45,10),MAT.player);
    pHat.position.y=0.52; pHat.castShadow=true; playerGrp.add(pHat);
    const pLight=new THREE.PointLight(0xffffff,0.5,3); pLight.position.y=0.4; playerGrp.add(pLight);

    /* ---------- 7. 路点 + 游戏状态 ---------- */
    const WPS=[
      {id:0,  pos:new THREE.Vector3(0,   0.75, 4)},     // 起点
      {id:1,  pos:new THREE.Vector3(0,   0.75, -1)},    // 起点边缘
      {id:2,  pos:new THREE.Vector3(0,   0.9,  -4)},    // 桥臂（mechA done 后可达）
      {id:3,  pos:new THREE.Vector3(0,   0.75, -7)},    // 对岸近端
      {id:4,  pos:new THREE.Vector3(-1,  0.75, -11)},   // 对岸深处
      {id:5,  pos:new THREE.Vector3(0,   1.85, -16)},   // stair1
      {id:6,  pos:new THREE.Vector3(1.5, 3.35, -18)},   // stair2
      {id:7,  pos:new THREE.Vector3(0,   4.85, -20)},   // stair3
      {id:8,  pos:new THREE.Vector3(0,   6.0,  -21.5)}, // 塔顶近端
      {id:9,  pos:new THREE.Vector3(3,   6.0,  -23)},   // 塔顶机关C旁
      {id:10, pos:new THREE.Vector3(6,   6.0,  -23)},   // 桥臂（mechC done 后可达）
      {id:11, pos:new THREE.Vector3(8,   6.5,  -23)},   // 光门 WIN
    ];
    const S={
      t:0, phase:0,           // phase: 0=开场 1=可玩 2=结尾
      wp:0, moving:false, over:false, running:true,
      mechA:false, mechB:false, mechC:false,
    };
    playerGrp.position.copy(WPS[0].pos);

    // 连接图：初始 0↔1, 3↔4, 5↔6↔7↔8↔9；机关接通后追加边
    function buildGraph(){
      const g={0:[1],1:[0],2:[],3:[4],4:[3],5:[6],6:[5,7],7:[6,8],8:[7,9],9:[8],10:[],11:[]};
      if(S.mechA){ g[1].push(2); g[2]=[1,3]; g[3].push(2); }
      if(S.mechB){ g[4].push(5); g[5].push(4); }
      if(S.mechC){ g[9].push(10); g[10]=[9,11]; g[11]=[10]; }
      return g;
    }
    // BFS 寻路
    function findPath(from,to){
      const g=buildGraph(), prev={}; prev[from]=-1;
      const q=[from];
      while(q.length){
        const c=q.shift();
        if(c===to) break;
        for(const n of g[c]) if(!(n in prev)){ prev[n]=c; q.push(n); }
      }
      if(!(to in prev)) return null;
      const path=[]; let c=to;
      while(c!==-1){ path.unshift(c); c=prev[c]; }
      return path;
    }

    /* ---------- 10. 补间动画系统 ---------- */
    const tweens=[];
    function tween(dur,onUpdate,onDone){
      tweens.push({t0:S.t,dur,onUpdate,onDone});
    }
    function easeInOutCubic(p){ return p<0.5 ? 4*p*p*p : 1-Math.pow(-2*p+2,3)/2; }

    /* ---------- 9. 音效：纯 WebAudio · G大调五声音阶 ---------- */
    const PENTA=[196,220,246.94,293.66,329.63]; // G3 A3 B3 D4 E4
    let actx=null, droneNodes=null;
    function ac(){
      try{
        if(!actx) actx=new (window.AudioContext||window.webkitAudioContext)();
        if(actx.state==='suspended') actx.resume();
        return actx;
      }catch(e){ return null; }
    }
    function note(freq,type,dur,vol,delay){
      try{
        const a=ac(); if(!a) return;
        const t=a.currentTime+(delay||0);
        const o=a.createOscillator(), g=a.createGain();
        o.type=type; o.frequency.value=freq;
        o.connect(g); g.connect(a.destination);
        g.gain.setValueAtTime(vol,t);
        g.gain.exponentialRampToValueAtTime(0.001,t+dur);
        o.start(t); o.stop(t+dur+0.02);
      }catch(e){}
    }
    function noisePulse(delay){
      try{
        const a=ac(); if(!a) return;
        const t=a.currentTime+delay;
        const buf=a.createBuffer(1,Math.floor(a.sampleRate*0.04),a.sampleRate);
        const d=buf.getChannelData(0);
        for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*(1-i/d.length);
        const s=a.createBufferSource(), f=a.createBiquadFilter(), g=a.createGain();
        f.type='bandpass'; f.frequency.value=900; f.Q.value=1.2;
        g.gain.value=0.22;
        s.buffer=buf; s.connect(f); f.connect(g); g.connect(a.destination);
        s.start(t);
      }catch(e){}
    }
    const SND={
      step(){ note(PENTA[Math.floor(Math.random()*5)]*2,'triangle',0.08,0.15); },          // 随机五声脚步
      ratchet(){ for(let i=0;i<3;i++) noisePulse(i*0.05); note(246.94*2,'triangle',0.16,0.2,0.18); }, // 3次棘轮+收尾B3
      snap(){ note(196*2,'sine',0.3,0.25); note(293.66*2,'sine',0.3,0.25,0.04); },          // G+D 双音落位
      deny(){ note(80,'sine',0.2,0.18); },                                                  // 80Hz 拒绝
      win(){ PENTA.concat([392]).forEach((f,i)=>note(f*2,'triangle',0.4,0.3,i*0.12)); },    // 上行五声琶音
      droneStart(){    // 持续低频环境音 48Hz + LFO
        try{
          const a=ac(); if(!a||droneNodes) return;
          const o=a.createOscillator(), f=a.createBiquadFilter(), g=a.createGain();
          const lfo=a.createOscillator(), lg=a.createGain();
          o.type='sawtooth'; o.frequency.value=48;
          f.type='lowpass'; f.frequency.value=180;
          lfo.type='sine'; lfo.frequency.value=0.15; lg.gain.value=40;
          lfo.connect(lg); lg.connect(f.frequency);
          o.connect(f); f.connect(g); g.connect(a.destination);
          g.gain.setValueAtTime(0.0001,a.currentTime);
          g.gain.exponentialRampToValueAtTime(0.06,a.currentTime+2);
          o.start(); lfo.start();
          droneNodes={o,lfo,g};
        }catch(e){}
      },
      droneStop(){
        try{
          if(!droneNodes) return;
          const a=ac();
          droneNodes.g.gain.exponentialRampToValueAtTime(0.0001,a.currentTime+1.2);
          const dn=droneNodes; droneNodes=null;
          setTimeout(()=>{ try{dn.o.stop();dn.lfo.stop();}catch(e){} },1400);
        }catch(e){}
      },
    };

    /* ---------- 8. 交互：射线检测 / 机关旋转 / 寻路移动 ---------- */
    // 机关表：rotor=旋转组 rot=当前角 dir=旋转方向 aligned=接通判定 dep=玩家站立时禁转的路点
    const mechs={
      A:{ rotor:rotorA, rot:0,         dir: 1, mat:MAT.mechAGlow,
          aligned:r=>Math.abs(Math.cos(r))<0.05, dep:[2],     flag:'mechA' },
      B:{ rotor:rotorB, rot:0,         dir: 1, mat:MAT.mechBGlow,
          aligned:r=>Math.abs(Math.cos(r))<0.05, dep:[],      flag:'mechB' },
      C:{ rotor:rotorC, rot:Math.PI/2, dir:-1, mat:MAT.mechCGlow,
          aligned:r=>Math.cos(r)>0.95&&Math.abs(Math.sin(r))<0.05, dep:[10,11], flag:'mechC' },
    };
    let rotating=false;
    function rotateMech(name){
      if(S.phase!==1||S.moving||S.over||rotating) return;
      const m=mechs[name];
      if(m.dep.indexOf(S.wp)>=0){ SND.deny(); return; }    // 玩家正站在该机关的桥上，禁转
      rotating=true;
      SND.ratchet();
      const from=m.rot, to=m.rot+m.dir*Math.PI/2;          // 每次点击旋转 90°
      tween(0.6,p=>{
        m.rotor.rotation.y=from+(to-from)*easeInOutCubic(p);
      },()=>{
        m.rot=to; m.rotor.rotation.y=to; rotating=false;
        const ok=m.aligned(to);
        if(ok&&!S[m.flag]){ S[m.flag]=true; SND.snap(); }  // 接通：咔哒落位音
        else if(!ok&&S[m.flag]) S[m.flag]=false;           // 转离：断开连接（可再转回）
      });
    }

    // 玩家按路点逐步行走：每步 0.6s + Y轴正弦弹跳
    function movePlayerTo(wpId){
      if(S.phase!==1||S.moving||S.over||rotating||wpId===S.wp) return;
      const path=findPath(S.wp,wpId);
      if(!path||path.length<2){ SND.deny(); return; }      // 不可达
      S.moving=true;
      let i=1;
      function stepOnce(){
        if(i>=path.length){
          S.moving=false;
          if(S.wp===11) setTimeout(doEnding,400);          // 抵达光门 → 结尾动画
          return;
        }
        const dst=WPS[path[i]].pos, src=playerGrp.position.clone();
        playerGrp.rotation.y=Math.atan2(dst.x-src.x,dst.z-src.z); // 朝向下一个路点
        SND.step();
        tween(0.6,p=>{
          const e=easeInOutCubic(p);
          playerGrp.position.lerpVectors(src,dst,e);
          playerGrp.position.y=src.y+(dst.y-src.y)*e+Math.sin(p*Math.PI)*0.35; // 弹跳弧线
        },()=>{
          playerGrp.position.copy(dst);
          S.wp=path[i]; i++; stepOnce();
        });
      }
      stepOnce();
    }

    // 不可见点击区：每个路点一个体块 + 每个机关一个体块
    const raycaster=new THREE.Raycaster();
    const ndc=new THREE.Vector2();
    const wpZones=WPS.map(w=>{
      const z=new THREE.Mesh(new THREE.BoxGeometry(2.8,1.8,2.8),MAT.hidden);
      z.position.copy(w.pos); z.position.y-=0.3; scene.add(z);
      z.userData.wpId=w.id; return z;
    });
    const mechZones=[['A',mechAGrp,1.0],['B',mechBGrp,1.2],['C',mechCGrp,0.7]].map(([name,grp,y])=>{
      const m=new THREE.Mesh(new THREE.BoxGeometry(2.6,2.8,2.6),MAT.hidden);
      m.position.set(0,y,0); grp.add(m);
      m.userData.mech=name; return m;
    });

    function pickNDC(e){
      const r=dom.getBoundingClientRect();
      const cx=(e.touches&&e.touches[0])?e.touches[0].clientX:e.clientX;
      const cy=(e.touches&&e.touches[0])?e.touches[0].clientY:e.clientY;
      ndc.x=((cx-r.left)/r.width)*2-1;
      ndc.y=-((cy-r.top)/r.height)*2+1;
      raycaster.setFromCamera(ndc,camera);
    }
    function onPointerDown(e){
      if(S.phase!==1) return;
      ac();                                                // 在用户手势内激活音频上下文
      pickNDC(e);
      const mh=raycaster.intersectObjects(mechZones,false);
      if(mh.length){ rotateMech(mh[0].object.userData.mech); return; } // 机关优先
      const wh=raycaster.intersectObjects(wpZones,false);
      if(wh.length) movePlayerTo(wh[0].object.userData.wpId);
    }
    // hover：机关辉光增强 + 指针手势
    let hoverMech=null;
    function onPointerMove(e){
      if(S.phase!==1||e.touches) return;
      pickNDC(e);
      const mh=raycaster.intersectObjects(mechZones,false);
      hoverMech=mh.length?mh[0].object.userData.mech:null;
      dom.style.cursor=hoverMech?'pointer':'default';
    }
    dom.addEventListener('pointerdown',onPointerDown);
    dom.addEventListener('pointermove',onPointerMove);

    /* ---------- 11. 后处理：Bloom + 调色/暗角/颗粒 ---------- */
    const rtScene=new THREE.WebGLRenderTarget(Math.floor(W*PR),Math.floor(H*PR),{type:THREE.HalfFloatType});
    const rtA=new THREE.WebGLRenderTarget(Math.floor(W*PR)>>1,Math.floor(H*PR)>>1,{type:THREE.HalfFloatType});
    const rtB=new THREE.WebGLRenderTarget(Math.floor(W*PR)>>1,Math.floor(H*PR)>>1,{type:THREE.HalfFloatType});

    const ppVert='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}';
    // Pass1a：高亮提取
    const brightMat=new THREE.ShaderMaterial({
      uniforms:{tDiffuse:{value:null}},
      vertexShader:ppVert,
      fragmentShader:
        'uniform sampler2D tDiffuse;varying vec2 vUv;'
        +'void main(){'
        +'  vec4 c=texture2D(tDiffuse,vUv);'
        +'  float lum=dot(c.rgb,vec3(0.299,0.587,0.114));'
        +'  gl_FragColor=lum>0.75?c*1.5:vec4(0.0);'
        +'}',
      depthTest:false,depthWrite:false,
    });
    // Pass1b：九抽头高斯模糊（双向各两轮）
    const blurMat=new THREE.ShaderMaterial({
      uniforms:{tDiffuse:{value:null},uDir:{value:new THREE.Vector2(1,0)}},
      vertexShader:ppVert,
      fragmentShader:
        'uniform sampler2D tDiffuse;uniform vec2 uDir;varying vec2 vUv;'
        +'void main(){'
        +'  float w0=0.227027,w1=0.1945946,w2=0.1216216,w3=0.054054,w4=0.016216;'
        +'  vec3 c=texture2D(tDiffuse,vUv).rgb*w0;'
        +'  c+=texture2D(tDiffuse,vUv+uDir).rgb*w1;     c+=texture2D(tDiffuse,vUv-uDir).rgb*w1;'
        +'  c+=texture2D(tDiffuse,vUv+uDir*2.0).rgb*w2; c+=texture2D(tDiffuse,vUv-uDir*2.0).rgb*w2;'
        +'  c+=texture2D(tDiffuse,vUv+uDir*3.0).rgb*w3; c+=texture2D(tDiffuse,vUv-uDir*3.0).rgb*w3;'
        +'  c+=texture2D(tDiffuse,vUv+uDir*4.0).rgb*w4; c+=texture2D(tDiffuse,vUv-uDir*4.0).rgb*w4;'
        +'  gl_FragColor=vec4(c,1.0);'
        +'}',
      depthTest:false,depthWrite:false,
    });
    // Pass2：合成 + ACES + 暖高光/冷暗部 + 暗角 + 颗粒
    const compMat=new THREE.ShaderMaterial({
      uniforms:{tDiffuse:{value:null},tBloom:{value:null},uTime:{value:0}},
      vertexShader:ppVert,
      fragmentShader:
        'uniform sampler2D tDiffuse;uniform sampler2D tBloom;uniform float uTime;varying vec2 vUv;'
        +'vec3 aces(vec3 x){return clamp((x*(2.51*x+0.03))/(x*(0.43*x+0.59)+0.14),0.0,1.0);}'
        +'void main(){'
        +'  vec3 c=texture2D(tDiffuse,vUv).rgb+texture2D(tBloom,vUv).rgb*0.6;' // bloom 加性叠加
        +'  c=aces(c);'                                                        // 色调映射（RT内未应用，手动补）
        +'  c=pow(c,vec3(1.0/2.2));'                                           // 线性 → sRGB
        +'  float lum=dot(c,vec3(0.299,0.587,0.114));'
        +'  float hi=smoothstep(0.55,1.0,lum);'
        +'  c.r*=1.0+0.06*hi;c.g*=1.0+0.02*hi;'                                // 暖高光
        +'  float lo=1.0-smoothstep(0.0,0.45,lum);'
        +'  c.b*=1.0+0.08*lo;'                                                 // 冷暗部
        +'  c*=1.0-distance(vUv,vec2(0.5))*0.5;'                               // 暗角
        +'  float g=fract(sin(dot(vUv,vec2(12.9898,78.233))+uTime*12345.0)*43758.5453);'
        +'  c+=(g-0.5)*0.03;'                                                  // 胶片颗粒
        +'  gl_FragColor=vec4(c,1.0);'
        +'}',
      depthTest:false,depthWrite:false,
    });
    const ppScene=new THREE.Scene();
    const ppCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    const ppQuad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),compMat);
    ppQuad.frustumCulled=false; ppScene.add(ppQuad);

    function renderFrame(){
      // 1) 场景 → rtScene
      renderer.setRenderTarget(rtScene);
      renderer.render(scene,camera);
      // 2) 高亮提取 → rtA（半分辨率）
      ppQuad.material=brightMat;
      brightMat.uniforms.tDiffuse.value=rtScene.texture;
      renderer.setRenderTarget(rtA); renderer.render(ppScene,ppCam);
      // 3) 高斯模糊两轮（H→rtB，V→rtA）
      ppQuad.material=blurMat;
      for(let i=0;i<2;i++){
        blurMat.uniforms.tDiffuse.value=rtA.texture;
        blurMat.uniforms.uDir.value.set(1/rtA.width,0);
        renderer.setRenderTarget(rtB); renderer.render(ppScene,ppCam);
        blurMat.uniforms.tDiffuse.value=rtB.texture;
        blurMat.uniforms.uDir.value.set(0,1/rtB.height);
        renderer.setRenderTarget(rtA); renderer.render(ppScene,ppCam);
      }
      // 4) 合成 → 屏幕
      ppQuad.material=compMat;
      compMat.uniforms.tDiffuse.value=rtScene.texture;
      compMat.uniforms.tBloom.value=rtA.texture;
      compMat.uniforms.uTime.value=S.t;
      renderer.setRenderTarget(null); renderer.render(ppScene,ppCam);
    }

    /* ---------- 窗口缩放 ---------- */
    function onResize(){
      W=ov.clientWidth||window.innerWidth; H=ov.clientHeight||window.innerHeight;
      renderer.setSize(W,H);
      const rw=Math.floor(W*PR), rh=Math.floor(H*PR);
      rtScene.setSize(rw,rh); rtA.setSize(rw>>1,rh>>1); rtB.setSize(rw>>1,rh>>1);
      applyCamera();
    }
    window.addEventListener('resize',onResize);

    /* ---------- 13. 开场动画（8秒） ---------- */
    const INTRO_DUR=8;
    let titleShown=false;
    function introTick(){
      const t=S.t;
      // t=0~5s：低仰角(el=0.08, dist=60) → 标准等距视角，easeInOutCubic
      const e=easeInOutCubic(Math.min(1,t/5));
      camEl  =0.08+(STD_EL-0.08)*e;
      camAz  =(STD_AZ-0.22)+0.22*e;
      camDist=60+(STD_DIST-60)*e;
      frus   =30+(STD_FRUS-30)*e;
      applyCamera();
      // t=5~7s：标准视角，建筑完全展开（保持静帧）
      // t=7~7.8s：标题卡淡入淡出
      if(t>=7&&!titleShown){ titleShown=true; titleCard.style.opacity='1'; }
      if(t>=7.8) titleCard.style.opacity='0';
      // t=8s：进入可交互
      if(t>=INTRO_DUR) startPlay();
    }
    function startPlay(){
      if(S.phase!==0) return;
      S.phase=1;
      camEl=STD_EL; camAz=STD_AZ; camDist=STD_DIST; frus=STD_FRUS;
      applyCamera();
      skipBtn.style.display='none';
      titleCard.style.opacity='0';
      hintEl.style.opacity='1';
      SND.droneStart();
      setTimeout(()=>{ hintEl.style.opacity='0'; },6000);
    }
    function onSkip(){ S.t=INTRO_DUR; startPlay(); }
    skipBtn.addEventListener('click',onSkip);

    /* ---------- 结尾动画 ---------- */
    function doEnding(){
      if(S.over) return;
      S.over=true; S.phase=2;
      // 1. 艾达走入光门：scale → 0（1s），门光急剧增强
      tween(1.0,p=>{
        playerGrp.scale.setScalar(Math.max(0.001,1-p));
        doorLight.intensity=3+p*14;
        MAT.door.emissiveIntensity=2.0+p*3;
      },()=>{
        // 2. 全屏白光 flash（CSS overlay）
        const flashCard=document.createElement('div');
        flashCard.style.cssText='position:absolute;inset:0;z-index:20;background:#fff;opacity:0;'
          +'transition:opacity .45s;display:flex;align-items:center;justify-content:center';
        flashCard.innerHTML='<span style="font:300 64px \'Songti SC\',\'STSong\',serif;color:rgba(50,38,24,0);'
          +'letter-spacing:.5em;text-indent:.5em;transition:color 1.5s">终</span>';
        ov.appendChild(flashCard);
        SND.droneStop();         // 通关前停掉环境低音
        SND.win();               // 4. 五声音阶上行琶音
        requestAnimationFrame(()=>{
          flashCard.style.opacity='1';
          // 3. 白光渐退至米白（1.5s）、"终"字 serif 大字居中淡入
          setTimeout(()=>{
            flashCard.style.transition='background 1.5s,opacity 1.5s';
            flashCard.style.background='#f5efe2';
            flashCard.firstChild.style.color='rgba(50,38,24,.88)';
          },500);
        });
        // 5. 2.8s 后：清理 → sfx.chime() → resolve
        setTimeout(()=>{
          cleanUp();
          try{ if(typeof sfx!=='undefined'&&sfx.chime) sfx.chime(); }catch(e){}
          resolve();
        },2800);
      });
    }

    /* ---------- 资源清理（防内存泄漏） ---------- */
    function cleanUp(){
      S.running=false;
      if(rafId) cancelAnimationFrame(rafId);
      dom.removeEventListener('pointerdown',onPointerDown);
      dom.removeEventListener('pointermove',onPointerMove);
      skipBtn.removeEventListener('click',onSkip);
      window.removeEventListener('resize',onResize);
      SND.droneStop();
      try{
        rtScene.dispose(); rtA.dispose(); rtB.dispose();
        scene.traverse(o=>{ if(o.geometry) o.geometry.dispose(); });
        Object.keys(MAT).forEach(k=>MAT[k].dispose());
        winMat.dispose(); brightMat.dispose(); blurMat.dispose(); compMat.dispose();
        ppQuad.geometry.dispose();
        renderer.dispose();
      }catch(e){}
      ov.remove();
    }

    /* ---------- 12. 主循环 ---------- */
    let rafId=0, lastTs=null;
    function tick(ts){
      if(!S.running) return;
      const dt=lastTs===null?0:Math.min((ts-lastTs)/1000,0.05);
      lastTs=ts; S.t+=dt;

      if(S.phase===0) introTick();

      // 推进所有补间
      for(let i=tweens.length-1;i>=0;i--){
        const tw=tweens[i];
        const p=Math.min(1,(S.t-tw.t0)/tw.dur);
        tw.onUpdate(p);
        if(p>=1){ tweens.splice(i,1); if(tw.onDone) tw.onDone(); }
      }

      // 待机呼吸（仅静止时，Y轴微浮动）
      if(!S.moving&&!S.over) playerGrp.position.y+=Math.sin(S.t*1.8)*0.004;

      // 光门脉动
      if(!S.over){
        doorLight.intensity=2.6+Math.sin(S.t*2.2)*0.6;
        MAT.door.emissiveIntensity=1.8+Math.sin(S.t*2.2)*0.35;
      }

      // 机关辉光：未接通时脉动，hover 时增强 1.5 倍
      [['A',MAT.mechAGlow,0],['B',MAT.mechBGlow,1.1],['C',MAT.mechCGlow,2.2]].forEach(([n,mat,ph])=>{
        let v=S[mechs[n].flag]?0.4:0.4+Math.sin(S.t*2.8+ph)*0.15;
        if(hoverMech===n) v*=1.5;
        mat.emissiveIntensity=v;
      });

      // 装饰浮动：宝石自转 + 云层漂移
      orbA.rotation.y=S.t*1.1; orbA.position.y=1.25+Math.sin(S.t*1.5)*0.06;
      gemB.rotation.y=S.t*0.8; gemB.rotation.x=S.t*0.4;
      orbC.rotation.y=S.t*1.3; orbC.position.y=1.35+Math.sin(S.t*1.7+1)*0.06;
      for(const c of clouds) c.m.position.x=c.baseX+Math.sin(S.t*c.sp+c.ph)*1.6;

      renderFrame();
      rafId=requestAnimationFrame(tick);
    }
    rafId=requestAnimationFrame(tick);
  });
}
