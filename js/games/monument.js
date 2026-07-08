"use strict";
/* ============================================================
   第二晚 · 《珊瑚之塔》—— Monument Valley 风格 3D 解谜关卡
   依赖：全局 THREE（CDN r160）、可选全局 sfx（sfx.chime）
   导出：monumentGame() -> Promise（通关后 resolve）
   ============================================================ */
function monumentGame(){
  return new Promise(resolve=>{

    /* ---------- 1. 环境检查 ---------- */
    if(typeof THREE==='undefined'){ resolve(); return; }

    /* ---------- 2. overlay + UI ---------- */
    const ov=document.createElement('div');
    ov.style.cssText='position:fixed;inset:0;z-index:900;background:#040812;overflow:hidden';   /* 低于#errbox(999)：关卡内报错仍可见 */
    document.body.appendChild(ov);

    const skipBtn=document.createElement('div');
    skipBtn.textContent='跳过 ›';
    skipBtn.style.cssText='position:absolute;top:16px;right:20px;color:rgba(255,255,255,.4);'
      +'font:14px/1 sans-serif;cursor:pointer;z-index:10;letter-spacing:.12em;padding:8px 12px;user-select:none';
    ov.appendChild(skipBtn);

    const hintEl=document.createElement('div');
    hintEl.textContent='点击地面移动 · 点击发光机关旋转';
    hintEl.style.cssText='position:absolute;bottom:18px;left:50%;transform:translateX(-50%);'
      +'color:rgba(200,195,180,.45);font:13px/1 sans-serif;letter-spacing:.14em;'
      +'pointer-events:none;z-index:10;white-space:nowrap;opacity:0;transition:opacity 1.2s';
    ov.appendChild(hintEl);

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
    try{ renderer=new THREE.WebGLRenderer({antialias:true}); }
    catch(e){ ov.remove(); resolve(); return; }
    const PR=Math.min(window.devicePixelRatio||1,2);
    renderer.setPixelRatio(PR);
    renderer.setSize(W,H);
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.domElement.style.cssText='position:absolute;inset:0;width:100%;height:100%';
    ov.insertBefore(renderer.domElement,ov.firstChild);
    const dom=renderer.domElement;

    const scene=new THREE.Scene();
    scene.background=new THREE.Color(0x040812);
    scene.fog=new THREE.FogExp2(0x040812,0.018);

    const camTarget=new THREE.Vector3(0,3,-12);
    const STD_AZ=Math.PI/4, STD_EL=Math.PI/5, STD_DIST=40, STD_FRUS=26;
    let camAz=STD_AZ-0.22, camEl=0.08, camDist=60, frus=30;
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

    /* ---------- 4. 光照：月光主光 + 强冷补 + 低环境 + 月球点光 ---------- */
    const sun=new THREE.DirectionalLight(0xffe0a0,1.1);
    sun.position.set(6,18,4);
    sun.target.position.set(0,0,-12);
    sun.castShadow=true;
    sun.shadow.mapSize.set(2048,2048);
    sun.shadow.camera.left=-28; sun.shadow.camera.right=28;
    sun.shadow.camera.top=28; sun.shadow.camera.bottom=-28;
    sun.shadow.camera.near=1; sun.shadow.camera.far=120;
    sun.shadow.bias=-0.0004;
    scene.add(sun); scene.add(sun.target);

    const fill=new THREE.DirectionalLight(0x8090ff,0.5);
    fill.position.set(-10,8,-15); scene.add(fill);
    scene.add(new THREE.AmbientLight(0x4455aa,0.4));

    const moonLight=new THREE.PointLight(0xd0e0ff,0.4,120);
    moonLight.position.set(-28,30,-45); scene.add(moonLight);

    /* ---------- 5. 材质表（深夜暖灯配色） ---------- */
    const MAT={
      islandTop : new THREE.MeshLambertMaterial({color:0x4a5e68}),
      islandSide: new THREE.MeshLambertMaterial({color:0x28383e}),
      shoreTop  : new THREE.MeshLambertMaterial({color:0x5a4a6a}),
      shoreSide : new THREE.MeshLambertMaterial({color:0x382840}),
      stair1    : new THREE.MeshLambertMaterial({color:0x7a6858}),
      stair2    : new THREE.MeshLambertMaterial({color:0x685848}),
      stair3    : new THREE.MeshLambertMaterial({color:0x584838}),
      towerTop  : new THREE.MeshLambertMaterial({color:0x386a58}),
      towerBody : new THREE.MeshLambertMaterial({color:0x284838}),
      towerEave : new THREE.MeshLambertMaterial({color:0x305a48}),
      cloud     : new THREE.MeshLambertMaterial({color:0x6070a0,transparent:true,opacity:0.3}),
      cloudMid  : new THREE.MeshLambertMaterial({color:0x9098c0,transparent:true,opacity:0.4}),
      cloudHi   : new THREE.MeshLambertMaterial({color:0xd0d8f0,transparent:true,opacity:0.5}),
      mechA     : new THREE.MeshLambertMaterial({color:0xff6b35}),
      mechAGlow : new THREE.MeshLambertMaterial({color:0xff6b35,emissive:0xff4500,emissiveIntensity:0.6}),
      mechB     : new THREE.MeshLambertMaterial({color:0xffaa20}),
      mechBGlow : new THREE.MeshLambertMaterial({color:0xffaa20,emissive:0xff8800,emissiveIntensity:0.6}),
      mechC     : new THREE.MeshLambertMaterial({color:0x00d490}),
      mechCGlow : new THREE.MeshLambertMaterial({color:0x00d490,emissive:0x00a860,emissiveIntensity:0.6}),
      door      : new THREE.MeshLambertMaterial({color:0xfff5c0,emissive:0xffe840,emissiveIntensity:2.4,
                    transparent:true,opacity:0.92,side:THREE.DoubleSide}),
      doorFrame : new THREE.MeshLambertMaterial({color:0x4a5e68}),
      player    : new THREE.MeshLambertMaterial({color:0xfff8e8,emissive:0xfff8e8,emissiveIntensity:0.3}),
      hidden    : new THREE.MeshBasicMaterial({visible:false}),
      skirt1    : new THREE.MeshLambertMaterial({color:0x1a2830}),
      skirt2    : new THREE.MeshLambertMaterial({color:0x18161e}),
      edge      : new THREE.MeshLambertMaterial({color:0x5a7080}),
      edgeShore : new THREE.MeshLambertMaterial({color:0x6a5878}),
      win2      : new THREE.MeshLambertMaterial({color:0x0a0c10}),
      water     : new THREE.MeshLambertMaterial({color:0x0a1828,emissive:0x081828,emissiveIntensity:0.3,
                    transparent:true,opacity:0.75}),
    };

    /* ---------- 6. 场景几何辅助函数 ---------- */
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

    /* —— 天穹（全球内面，ShaderMaterial三段渐变） —— */
    const skyGeo=new THREE.SphereGeometry(180,32,16);
    const skyMat=new THREE.ShaderMaterial({
      side:THREE.BackSide, depthWrite:false,
      vertexShader:'varying vec3 vPos;void main(){vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader:
        'varying vec3 vPos;'
        +'void main(){'
        +'  float h=normalize(vPos).y;'
        +'  vec3 top=vec3(0.016,0.031,0.055);'
        +'  vec3 hor=vec3(0.071,0.031,0.102);'
        +'  vec3 low=vec3(0.125,0.047,0.031);'
        +'  vec3 col=mix(low,hor,smoothstep(-0.3,0.15,h));'
        +'  col=mix(col,top,smoothstep(0.15,0.8,h));'
        +'  gl_FragColor=vec4(col,1.0);'
        +'}',
    });
    scene.add(new THREE.Mesh(skyGeo,skyMat));

    /* —— 星场（1200粒，两种尺寸） —— */
    const starCount=1200;
    const starGeo=new THREE.BufferGeometry();
    const starPos=new Float32Array(starCount*3);
    for(let i=0;i<starCount;i++){
      const theta=Math.random()*Math.PI*2;
      const phi=Math.acos(0.1+Math.random()*0.9);
      const r=155+Math.random()*20;
      starPos[i*3]  =r*Math.sin(phi)*Math.cos(theta);
      starPos[i*3+1]=r*Math.abs(Math.cos(phi));
      starPos[i*3+2]=r*Math.sin(phi)*Math.sin(theta);
    }
    starGeo.setAttribute('position',new THREE.BufferAttribute(starPos,3));
    const starMat=new THREE.PointsMaterial({color:0xfff5e8,size:0.55,sizeAttenuation:false});
    const starMesh=new THREE.Points(starGeo,starMat);
    scene.add(starMesh);

    /* —— 月球 —— */
    const moonGeo=new THREE.SphereGeometry(2.5,16,16);
    const moonMat=new THREE.MeshLambertMaterial({color:0xfff0d8,emissive:0xfff5d0,emissiveIntensity:1.8});
    const moonMesh=new THREE.Mesh(moonGeo,moonMat);
    moonMesh.position.set(-28,30,-45); scene.add(moonMesh);

    /* —— 水面（两岛之间，顶点动画） —— */
    const waterGeo=new THREE.PlaneGeometry(16,5,32,16);
    waterGeo.rotateX(-Math.PI/2);
    const waterAttr=waterGeo.attributes.position;
    const waterBaseY=[];
    for(let i=0;i<waterAttr.count;i++) waterBaseY.push(waterAttr.getY(i));
    const waterMesh=new THREE.Mesh(waterGeo,MAT.water);
    waterMesh.position.set(0,-0.12,-4);
    waterMesh.receiveShadow=true; scene.add(waterMesh);

    /* —— 平台 —— */
    platform(0,-0.75,2,  10,1.5,10, MAT.islandTop, MAT.islandSide);
    platform(0,-0.75,-9,  8,1.5, 8, MAT.shoreTop,  MAT.shoreSide);
    box(3,1.2,3, MAT.stair1, 0,0.6,-16);
    box(3,1.2,3, MAT.stair2, 1.5,2.1,-18);
    box(3,1.2,3, MAT.stair3, 0,3.6,-20);
    platform(0,4.75,-23, 9,1.5,9, MAT.towerTop, MAT.towerBody);
    box(3,8,3, MAT.towerBody, 0,4.0,-18);

    /* 三层飞檐 + 尖柱 */
    box(5.0,0.35,5.0, MAT.towerEave, 0,8.25,-18);
    box(4.2,0.30,4.2, MAT.towerEave, 0,9.55,-18);
    box(3.4,0.25,3.4, MAT.towerEave, 0,10.75,-18);
    const spire=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.15,2.5,8),MAT.towerEave);
    spire.position.set(0,12.0,-18); spire.castShadow=true; scene.add(spire);

    /* 窗洞 */
    box(0.6,1.1,0.08, MAT.win2, 0,6.2,-16.46);
    box(0.08,1.1,0.6, MAT.win2, 1.54,5.0,-18);
    /* 塔顶矮护墙 */
    box(9,0.5,0.3, MAT.towerTop, 0,5.95,-27.35);
    box(0.3,0.5,7, MAT.towerTop, -4.35,5.95,-23.5);

    /* 起点岛边缘装饰条 */
    box(10.12,0.12,0.18, MAT.edge,  0,0.375, 7.06);
    box(10.12,0.12,0.18, MAT.edge,  0,0.375,-3.06);
    box(0.18,0.12,10.12, MAT.edge,  5.06,0.375, 2);
    box(0.18,0.12,10.12, MAT.edge, -5.06,0.375, 2);
    /* 河对岸边缘装饰条 */
    box(8.12,0.12,0.18, MAT.edgeShore,  0,0.375,-5.06);
    box(8.12,0.12,0.18, MAT.edgeShore,  0,0.375,-12.94);
    box(0.18,0.12,8.12, MAT.edgeShore,  4.06,0.375,-9);
    box(0.18,0.12,8.12, MAT.edgeShore, -4.06,0.375,-9);

    /* 底部裙摆（修复原材质泄漏：改用 MAT.skirt1/skirt2） */
    box(10.6,0.4,10.6, MAT.skirt1, 0,-1.75,2);
    box(8.6, 0.4, 8.6, MAT.skirt2, 0,-1.75,-9);

    /* —— 灯笼辅助：每盏4几何体 + 1 PointLight —— */
    const extraMats=[];
    const lanternLights=[];
    let _lanternIdx=0;
    function makeLantern(x,y,z,col){
      const grp=new THREE.Group(); grp.position.set(x,y,z); scene.add(grp);
      const bodyMat=new THREE.MeshLambertMaterial({color:col,emissive:col,emissiveIntensity:1.2});
      const capMat =new THREE.MeshLambertMaterial({color:0x4a3020});
      extraMats.push(bodyMat,capMat);
      const body=new THREE.Mesh(new THREE.CylinderGeometry(0.14,0.14,0.28,8),bodyMat);
      grp.add(body);
      const cap=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.10,0.10,8),capMat);
      cap.position.y=0.19; grp.add(cap);
      const tassel=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.08,0.18,6),capMat);
      tassel.position.y=-0.23; grp.add(tassel);
      const pl=new THREE.PointLight(col,1.0,4.5);
      grp.add(pl);
      lanternLights.push({pl,idx:_lanternIdx++});
    }
    /* 塔身最下飞檐四角 */
    makeLantern(-2.3,8.55,-15.7, 0xff8820);
    makeLantern( 2.3,8.55,-15.7, 0xff8820);
    makeLantern(-2.3,8.55,-20.3, 0xff8820);
    makeLantern( 2.3,8.55,-20.3, 0xff8820);
    /* 起点岛四角 */
    makeLantern(-4.6,-0.3,-0.3, 0xffaa40);
    makeLantern( 4.6,-0.3,-0.3, 0xffaa40);
    makeLantern(-4.6,-0.3, 4.3, 0xffaa40);
    makeLantern( 4.6,-0.3, 4.3, 0xffaa40);

    /* —— 云层（12朵，每朵3-5个盒子叠加） —— */
    const clouds=[];
    [[-10,-5,0],[13,-6,-3],[-15,-4,-10],[16,-5,-17],
     [-8,-7,-22],[13,-4,-27],[-13,-6,-30],[6,-8,-33],
     [-20,-5,-8],[18,-7,-20],[-6,-9,-38],[20,-6,-35]]
    .forEach(([cx,cy,cz],i)=>{
      const grp=new THREE.Group(); grp.position.set(cx,cy,cz); scene.add(grp);
      const layers=[MAT.cloud,MAT.cloudMid,MAT.cloudHi];
      const n=3+i%3;
      for(let j=0;j<n;j++){
        const bx=new THREE.Mesh(
          new THREE.BoxGeometry(4+(i%3)*2+(j*0.8), 0.8+(j*0.35), 2.5+(i%2)*1.5+(j*0.5)),
          layers[j%3]);
        bx.position.set((j-1)*0.8, j*0.3, 0);
        grp.add(bx);
      }
      clouds.push({grp,baseX:cx,ph:i*1.7,sp:0.12+(i%3)*0.05});
    });

    /* —— 萤火虫粒子（300个） —— */
    const ffCount=300;
    const ffGeo=new THREE.BufferGeometry();
    const ffPos=new Float32Array(ffCount*3);
    const ffVel=new Float32Array(ffCount);
    const ffPh =new Float32Array(ffCount);
    for(let i=0;i<ffCount;i++){
      ffPos[i*3]  =(Math.random()-0.5)*30;
      ffPos[i*3+1]=-1+Math.random()*9;
      ffPos[i*3+2]=-38+Math.random()*45;
      ffVel[i]=0.3+Math.random()*0.3;
      ffPh[i] =Math.random()*Math.PI*2;
    }
    ffGeo.setAttribute('position',new THREE.BufferAttribute(ffPos,3));
    const ffMat=new THREE.PointsMaterial({color:0xc8ff80,size:0.05,transparent:true,opacity:0.8,sizeAttenuation:true});
    const ffMesh=new THREE.Points(ffGeo,ffMat);
    scene.add(ffMesh);

    /* —— 机关A「珊瑚柱」(0,0,-4) —— */
    const mechAGrp=new THREE.Group(); mechAGrp.position.set(0,0,-4); scene.add(mechAGrp);
    box(1.0,5,1.0, MAT.mechA, 0,-2.7,0, mechAGrp);
    const rotorA=new THREE.Group(); mechAGrp.add(rotorA);
    box(6,0.3,1.1, MAT.mechA, 0,0.15,0, rotorA);
    box(1.1,0.3,2.6, MAT.mechA, 0,0.15,0, rotorA);
    const hubA=new THREE.Mesh(new THREE.CylinderGeometry(0.42,0.48,0.9,8),MAT.mechAGlow);
    hubA.position.y=0.55; hubA.castShadow=true; rotorA.add(hubA);
    /* 莲花底座法碗 */
    const lotusA=new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.6,0.15,6),MAT.mechAGlow);
    lotusA.position.y=-0.1; mechAGrp.add(lotusA);
    const orbA=new THREE.Mesh(new THREE.OctahedronGeometry(0.3),MAT.mechAGlow);
    orbA.position.y=1.25; mechAGrp.add(orbA);

    /* —— 机关B「琥珀盘」(-3,0,-13) —— */
    const mechBGrp=new THREE.Group(); mechBGrp.position.set(-3,0,-13); scene.add(mechBGrp);
    box(1.4,1.0,1.4, MAT.mechB, 0,0.5,0, mechBGrp);
    /* 三支腿 */
    for(let i=0;i<3;i++){
      const ang=i*Math.PI*2/3;
      const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.1,0.4,6),MAT.mechB);
      leg.position.set(Math.cos(ang)*0.55,0.75,Math.sin(ang)*0.55);
      mechBGrp.add(leg);
    }
    const rotorB=new THREE.Group(); rotorB.position.y=1.2; mechBGrp.add(rotorB);
    const discB=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.5,0.45,6),MAT.mechBGlow);
    discB.castShadow=true; rotorB.add(discB);
    box(4.6,1.5,0.55, MAT.mechB, 2.6,0.45,0, rotorB);
    box(0.55,2.0,0.55, MAT.mechB, 4.7,0.7,0, rotorB);
    const gemB=new THREE.Mesh(new THREE.OctahedronGeometry(0.45),MAT.mechBGlow);
    gemB.position.y=2.0; mechBGrp.add(gemB);

    /* —— 机关C「翡翠臂」(3,5.5,-23) —— */
    const mechCGrp=new THREE.Group(); mechCGrp.position.set(3,5.5,-23); scene.add(mechCGrp);
    box(1.2,0.7,1.2, MAT.mechC, 0,0.1,0, mechCGrp);
    const hubC=new THREE.Mesh(new THREE.CylinderGeometry(0.34,0.4,1.0,8),MAT.mechCGlow);
    hubC.position.y=0.6; hubC.castShadow=true; mechCGrp.add(hubC);
    /* 刻纹装饰环 */
    const ringC=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.55,0.08,16),MAT.mechCGlow);
    ringC.position.y=0.3; mechCGrp.add(ringC);
    const rotorC=new THREE.Group(); rotorC.rotation.y=Math.PI/2; mechCGrp.add(rotorC);
    box(5.6,0.35,1.0, MAT.mechC, 2.9,-0.25,0, rotorC);
    box(1.0,0.35,2.0, MAT.mechC, 5.2,-0.25,-1.0, rotorC);
    const orbC=new THREE.Mesh(new THREE.OctahedronGeometry(0.28),MAT.mechCGlow);
    orbC.position.y=1.35; mechCGrp.add(orbC);

    /* —— 光门 (8,6.5,-23) —— */
    const doorGrp=new THREE.Group();
    doorGrp.position.set(8,6.5,-23); doorGrp.rotation.y=Math.PI/2; scene.add(doorGrp);
    box(0.35,4.2,0.35, MAT.doorFrame, -1.1,0,0, doorGrp);
    box(0.35,4.2,0.35, MAT.doorFrame,  1.1,0,0, doorGrp);
    box(2.55,0.35,0.35, MAT.doorFrame, 0,2.1,0, doorGrp);
    const doorPlane=new THREE.Mesh(new THREE.PlaneGeometry(1.85,3.9),MAT.door);
    doorGrp.add(doorPlane);
    const doorLight=new THREE.PointLight(0xffe840,3,12);
    doorLight.position.set(7.4,6.5,-23); scene.add(doorLight);

    /* —— 艾达（玩家） —— */
    const playerGrp=new THREE.Group(); scene.add(playerGrp);
    const pBody=new THREE.Mesh(new THREE.CapsuleGeometry(0.22,0.5,6,12),MAT.player);
    pBody.position.y=-0.13; pBody.castShadow=true; playerGrp.add(pBody);
    const pHat=new THREE.Mesh(new THREE.ConeGeometry(0.18,0.45,10),MAT.player);
    pHat.position.y=0.52; pHat.castShadow=true; playerGrp.add(pHat);
    const pLight=new THREE.PointLight(0xffffff,0.5,3); pLight.position.y=0.4; playerGrp.add(pLight);

    /* ---------- 7. 路点 + 游戏状态（坐标勿改） ---------- */
    const WPS=[
      {id:0,  pos:new THREE.Vector3(0,   0.75, 4)},
      {id:1,  pos:new THREE.Vector3(0,   0.75,-1)},
      {id:2,  pos:new THREE.Vector3(0,   0.9, -4)},
      {id:3,  pos:new THREE.Vector3(0,   0.75,-7)},
      {id:4,  pos:new THREE.Vector3(-1,  0.75,-11)},
      {id:5,  pos:new THREE.Vector3(0,   1.85,-16)},
      {id:6,  pos:new THREE.Vector3(1.5, 3.35,-18)},
      {id:7,  pos:new THREE.Vector3(0,   4.85,-20)},
      {id:8,  pos:new THREE.Vector3(0,   6.0, -21.5)},
      {id:9,  pos:new THREE.Vector3(3,   6.0, -23)},
      {id:10, pos:new THREE.Vector3(6,   6.0, -23)},
      {id:11, pos:new THREE.Vector3(8,   6.5, -23)},
    ];
    const S={t:0,phase:0,wp:0,moving:false,over:false,running:true,mechA:false,mechB:false,mechC:false};
    playerGrp.position.copy(WPS[0].pos);

    function buildGraph(){
      const g={0:[1],1:[0],2:[],3:[4],4:[3],5:[6],6:[5,7],7:[6,8],8:[7,9],9:[8],10:[],11:[]};
      if(S.mechA){ g[1].push(2); g[2]=[1,3]; g[3].push(2); }
      if(S.mechB){ g[4].push(5); g[5].push(4); }
      if(S.mechC){ g[9].push(10); g[10]=[9,11]; g[11]=[10]; }
      return g;
    }
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

    /* ---------- 补间动画系统 ---------- */
    const tweens=[];
    function tween(dur,onUpdate,onDone){ tweens.push({t0:S.t,dur,onUpdate,onDone}); }
    function easeInOutCubic(p){ return p<0.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2; }

    /* ---------- 音效（纯 WebAudio · G大调五声） ---------- */
    const PENTA=[196,220,246.94,293.66,329.63];
    let actx=null, droneNodes=null;
    function ac(){
      try{
        if(typeof sfx!=='undefined' && sfx.isOn && !sfx.isOn()) return null;   /* 尊重全局静音开关 */
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
        f.type='bandpass'; f.frequency.value=900; f.Q.value=1.2; g.gain.value=0.22;
        s.buffer=buf; s.connect(f); f.connect(g); g.connect(a.destination); s.start(t);
      }catch(e){}
    }
    const SND={
      step(){ note(PENTA[Math.floor(Math.random()*5)]*2,'triangle',0.08,0.15); },
      ratchet(){ for(let i=0;i<3;i++) noisePulse(i*0.05); note(246.94*2,'triangle',0.16,0.2,0.18); },
      snap(){ note(196*2,'sine',0.3,0.25); note(293.66*2,'sine',0.3,0.25,0.04); },
      deny(){ note(80,'sine',0.2,0.18); },
      win(){ PENTA.concat([392]).forEach((f,i)=>note(f*2,'triangle',0.4,0.3,i*0.12)); },
      droneStart(){
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
          o.start(); lfo.start(); droneNodes={o,lfo,g};
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

    /* ---------- 交互：机关旋转 / 寻路移动 ---------- */
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
      if(m.dep.indexOf(S.wp)>=0){ SND.deny(); return; }
      rotating=true; SND.ratchet();
      const from=m.rot, to=m.rot+m.dir*Math.PI/2;
      tween(0.6,p=>{ m.rotor.rotation.y=from+(to-from)*easeInOutCubic(p); },()=>{
        m.rot=to; m.rotor.rotation.y=to; rotating=false;
        const ok=m.aligned(to);
        if(ok&&!S[m.flag]){ S[m.flag]=true; SND.snap(); }
        else if(!ok&&S[m.flag]) S[m.flag]=false;
      });
    }
    function movePlayerTo(wpId){
      if(S.phase!==1||S.moving||S.over||rotating||wpId===S.wp) return;
      const path=findPath(S.wp,wpId);
      if(!path||path.length<2){ SND.deny(); return; }
      S.moving=true; let i=1;
      function stepOnce(){
        if(i>=path.length){ S.moving=false; if(S.wp===11) setTimeout(doEnding,400); return; }
        const dst=WPS[path[i]].pos, src=playerGrp.position.clone();
        playerGrp.rotation.y=Math.atan2(dst.x-src.x,dst.z-src.z);
        SND.step();
        tween(0.6,p=>{
          const e=easeInOutCubic(p);
          playerGrp.position.lerpVectors(src,dst,e);
          playerGrp.position.y=src.y+(dst.y-src.y)*e+Math.sin(p*Math.PI)*0.35;
        },()=>{ playerGrp.position.copy(dst); S.wp=path[i]; i++; stepOnce(); });
      }
      stepOnce();
    }

    const raycaster=new THREE.Raycaster(), ndc=new THREE.Vector2();
    const wpZones=WPS.map(w=>{
      const z=new THREE.Mesh(new THREE.BoxGeometry(2.8,1.8,2.8),MAT.hidden);
      z.position.copy(w.pos); z.position.y-=0.3; scene.add(z);
      z.userData.wpId=w.id; return z;
    });
    const mechZones=[['A',mechAGrp,1.0],['B',mechBGrp,1.2],['C',mechCGrp,0.7]].map(([name,grp,y])=>{
      const m=new THREE.Mesh(new THREE.BoxGeometry(2.6,2.8,2.6),MAT.hidden);
      m.position.set(0,y,0); grp.add(m); m.userData.mech=name; return m;
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
      ac(); pickNDC(e);
      const mh=raycaster.intersectObjects(mechZones,false);
      if(mh.length){ rotateMech(mh[0].object.userData.mech); return; }
      const wh=raycaster.intersectObjects(wpZones,false);
      if(wh.length) movePlayerTo(wh[0].object.userData.wpId);
    }
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

    /* ---------- 后处理：Bloom + 深暖调色/暗角/颗粒 ---------- */
    const rtScene=new THREE.WebGLRenderTarget(Math.floor(W*PR),Math.floor(H*PR),{type:THREE.HalfFloatType});
    const rtA=new THREE.WebGLRenderTarget(Math.floor(W*PR)>>1,Math.floor(H*PR)>>1,{type:THREE.HalfFloatType});
    const rtB=new THREE.WebGLRenderTarget(Math.floor(W*PR)>>1,Math.floor(H*PR)>>1,{type:THREE.HalfFloatType});

    const ppVert='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}';
    const brightMat=new THREE.ShaderMaterial({
      uniforms:{tDiffuse:{value:null}},
      vertexShader:ppVert,
      fragmentShader:
        'uniform sampler2D tDiffuse;varying vec2 vUv;'
        +'void main(){'
        +'  vec4 c=texture2D(tDiffuse,vUv);'
        +'  float lum=dot(c.rgb,vec3(0.299,0.587,0.114));'
        +'  gl_FragColor=lum>0.65?c*1.8:vec4(0.0);'
        +'}',
      depthTest:false,depthWrite:false,
    });
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
    const compMat=new THREE.ShaderMaterial({
      uniforms:{tDiffuse:{value:null},tBloom:{value:null},uTime:{value:0}},
      vertexShader:ppVert,
      fragmentShader:
        'uniform sampler2D tDiffuse;uniform sampler2D tBloom;uniform float uTime;varying vec2 vUv;'
        +'vec3 aces(vec3 x){return clamp((x*(2.51*x+0.03))/(x*(0.43*x+0.59)+0.14),0.0,1.0);}'
        +'void main(){'
        +'  vec3 c=texture2D(tDiffuse,vUv).rgb+texture2D(tBloom,vUv).rgb*0.85;'
        +'  c=aces(c);'
        +'  c=pow(c,vec3(1.0/2.2));'
        +'  float lum=dot(c,vec3(0.299,0.587,0.114));'
        +'  float hi=smoothstep(0.55,1.0,lum);'
        +'  c.r*=1.0+0.08*hi; c.g*=1.0+0.03*hi;'
        +'  float lo=1.0-smoothstep(0.0,0.45,lum);'
        +'  c.b*=1.0+0.12*lo; c.r*=1.0-0.04*lo;'
        +'  c*=1.0-distance(vUv,vec2(0.5))*0.65;'
        +'  float g=fract(sin(dot(vUv,vec2(12.9898,78.233))+uTime*12345.0)*43758.5453);'
        +'  c+=(g-0.5)*0.044;'
        +'  gl_FragColor=vec4(c,1.0);'
        +'}',
      depthTest:false,depthWrite:false,
    });
    const ppScene=new THREE.Scene();
    const ppCam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    const ppQuad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),compMat);
    ppQuad.frustumCulled=false; ppScene.add(ppQuad);

    function renderFrame(){
      renderer.setRenderTarget(rtScene); renderer.render(scene,camera);
      ppQuad.material=brightMat;
      brightMat.uniforms.tDiffuse.value=rtScene.texture;
      renderer.setRenderTarget(rtA); renderer.render(ppScene,ppCam);
      ppQuad.material=blurMat;
      for(let i=0;i<2;i++){
        blurMat.uniforms.tDiffuse.value=rtA.texture;
        blurMat.uniforms.uDir.value.set(1/rtA.width,0);
        renderer.setRenderTarget(rtB); renderer.render(ppScene,ppCam);
        blurMat.uniforms.tDiffuse.value=rtB.texture;
        blurMat.uniforms.uDir.value.set(0,1/rtB.height);
        renderer.setRenderTarget(rtA); renderer.render(ppScene,ppCam);
      }
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

    /* ---------- 开场动画（8秒） ---------- */
    const INTRO_DUR=8;
    let titleShown=false;
    function introTick(){
      const t=S.t;
      const e=easeInOutCubic(Math.min(1,t/5));
      camEl  =0.08+(STD_EL-0.08)*e;
      camAz  =(STD_AZ-0.22)+0.22*e;
      camDist=60+(STD_DIST-60)*e;
      frus   =30+(STD_FRUS-30)*e;
      applyCamera();
      if(t>=7&&!titleShown){ titleShown=true; titleCard.style.opacity='1'; }
      if(t>=7.8) titleCard.style.opacity='0';
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
      hoverMech=null;
      tween(1.0,p=>{
        playerGrp.scale.setScalar(Math.max(0.001,1-p));
        doorLight.intensity=3+p*14;
        MAT.door.emissiveIntensity=2.4+p*3;
      },()=>{
        const flashCard=document.createElement('div');
        flashCard.style.cssText='position:absolute;inset:0;z-index:20;background:#fff;opacity:0;'
          +'transition:opacity .45s;display:flex;align-items:center;justify-content:center';
        flashCard.innerHTML='<span style="font:300 64px \'Songti SC\',\'STSong\',serif;color:rgba(50,38,24,0);'
          +'letter-spacing:.5em;text-indent:.5em;transition:color 1.5s">终</span>';
        ov.appendChild(flashCard);
        SND.droneStop(); SND.win();
        requestAnimationFrame(()=>{
          flashCard.style.opacity='1';
          setTimeout(()=>{
            flashCard.style.transition='background 1.5s,opacity 1.5s';
            flashCard.style.background='#f5efe2';
            flashCard.firstChild.style.color='rgba(50,38,24,.88)';
          },500);
        });
        setTimeout(()=>{
          cleanUp();
          try{ if(typeof sfx!=='undefined'&&sfx.chime) sfx.chime(); }catch(e){}
          resolve();
        },2800);
      });
    }

    /* ---------- 资源清理 ---------- */
    function cleanUp(){
      S.running=false;
      if(rafId) cancelAnimationFrame(rafId);
      dom.removeEventListener('pointerdown',onPointerDown);
      dom.removeEventListener('pointermove',onPointerMove);
      skipBtn.removeEventListener('click',onSkip);
      window.removeEventListener('resize',onResize);
      SND.droneStop();
      setTimeout(()=>{ try{ if(actx) actx.close(); }catch(e){} },1600);   /* 等droneStop淡出结束后释放AudioContext */
      try{
        sun.shadow.dispose();   /* 2048²阴影贴图不在renderer.dispose()覆盖范围内 */
        rtScene.dispose(); rtA.dispose(); rtB.dispose();
        scene.traverse(o=>{ if(o.geometry) o.geometry.dispose(); });
        Object.keys(MAT).forEach(k=>MAT[k].dispose());
        skyMat.dispose(); starMat.dispose(); moonMat.dispose(); ffMat.dispose();
        extraMats.forEach(m=>{ try{m.dispose();}catch(e){} });
        brightMat.dispose(); blurMat.dispose(); compMat.dispose();
        ppQuad.geometry.dispose();
        renderer.dispose();
      }catch(e){}
      ov.remove();
    }

    /* ---------- 主循环 ---------- */
    let rafId=0, lastTs=null;
    function tick(ts){
      if(!S.running) return;
      const dt=lastTs===null?0:Math.min((ts-lastTs)/1000,0.05);
      lastTs=ts; S.t+=dt;

      if(S.phase===0) introTick();

      for(let i=tweens.length-1;i>=0;i--){
        const tw=tweens[i];
        const p=Math.min(1,(S.t-tw.t0)/tw.dur);
        tw.onUpdate(p);
        if(p>=1){ tweens.splice(i,1); if(tw.onDone) tw.onDone(); }
      }

      if(!S.moving&&!S.over) playerGrp.position.y+=Math.sin(S.t*1.8)*0.004;

      if(!S.over){
        doorLight.intensity=2.6+Math.sin(S.t*2.2)*0.6;
        MAT.door.emissiveIntensity=2.0+Math.sin(S.t*2.2)*0.35;
      }

      [['A',MAT.mechAGlow,0],['B',MAT.mechBGlow,1.1],['C',MAT.mechCGlow,2.2]].forEach(([n,mat,ph])=>{
        let v=S[mechs[n].flag]?0.4:0.4+Math.sin(S.t*2.8+ph)*0.15;
        if(hoverMech===n) v*=1.5;
        mat.emissiveIntensity=v;
      });

      orbA.rotation.y=S.t*1.1; orbA.position.y=1.25+Math.sin(S.t*1.5)*0.06;
      gemB.rotation.y=S.t*0.8; gemB.rotation.x=S.t*0.4;
      orbC.rotation.y=S.t*1.3; orbC.position.y=1.35+Math.sin(S.t*1.7+1)*0.06;
      for(const c of clouds) c.grp.position.x=c.baseX+Math.sin(S.t*c.sp+c.ph)*1.6;

      /* 星场慢转 */
      starMesh.rotation.y+=0.00005;

      /* 水面顶点波浪 */
      for(let i=0;i<waterAttr.count;i++){
        const x=waterAttr.getX(i);
        waterAttr.setY(i, Math.sin(x*0.8+S.t*1.2)*0.08+Math.cos(x*0.5+S.t*0.7)*0.04);
      }
      waterAttr.needsUpdate=true;

      /* 萤火虫上升 */
      const fp=ffGeo.attributes.position;
      for(let i=0;i<ffCount;i++){
        let y=fp.getY(i)+ffVel[i]*dt;
        let x=fp.getX(i)+Math.sin(S.t*0.8+ffPh[i])*0.008;
        if(y>9){ y=-1.5; x=(Math.random()-0.5)*30; }
        fp.setXYZ(i,x,y,fp.getZ(i));
      }
      fp.needsUpdate=true;

      /* 灯笼脉动 */
      for(const l of lanternLights){
        l.pl.intensity=0.85+Math.sin(S.t*1.8+l.idx*0.7)*0.2;
      }

      renderFrame();
      rafId=requestAnimationFrame(tick);
    }
    rafId=requestAnimationFrame(tick);
  });
}
