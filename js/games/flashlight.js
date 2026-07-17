/* ================= 第三晚 · 手电筒暗房（Three.js 版） =================
   真实聚光灯：光斑会呼吸、偶尔骤暗；五句低语是受光材质，
   被照到之前几乎与墙融为一体。计时与「旅馆施舍」宽恕逻辑与原版一致。 */
"use strict";
function flashlightGame(){
  return new Promise(resolve=>{
    setStage(`
      <div class="game-wrap">
        <div class="hud"><span id="fg-c">低语 0 / 5</span><span class="countdown" id="fg-t" style="font-size:22px;">60</span></div>
        <div id="flash-room"><canvas id="fgc" style="position:absolute;inset:0;width:100%;height:100%;display:block;"></canvas></div>
        <div class="game-tip">移动手电筒的光，把藏在黑暗里的五句低语全部照出来<br>守则补充：光熄灭前，必须找齐。</div>
      </div>
    `);
    heartbeat(true,85); sfx.drone(true);
    const room=$('flash-room'), cv=$('fgc');
    const rect=room.getBoundingClientRect();

    /* ---------- 场景：一面墙 + 手电 ---------- */
    const renderer=T3.makeView(cv,{pixel:false});
    const scene=new THREE.Scene();
    scene.background=new THREE.Color(0x030302);
    const aspect=rect.width/rect.height;
    const wallW=16, wallH=wallW/aspect;
    const FOV=46;
    const dist=(wallH/2)/Math.tan(FOV/2*Math.PI/180);
    const camera=new THREE.PerspectiveCamera(FOV, aspect, .1, 60);
    camera.position.set(0,0,dist);

    /* 像素坐标(房间内) ↔ 墙面世界坐标 */
    const toWorld=(pxX,pxY)=>({ x:(pxX/rect.width-.5)*wallW, y:(.5-pxY/rect.height)*wallH });

    /* 墙面：暗色灰泥 + 轻微噪点 */
    (()=>{
      const c=document.createElement('canvas'); c.width=c.height=256;
      const g=c.getContext('2d');
      g.fillStyle='#171310'; g.fillRect(0,0,256,256);
      for(let i=0;i<2600;i++){ g.fillStyle=`rgba(${20+Math.random()*26|0},${16+Math.random()*20|0},${10+Math.random()*14|0},.5)`;
        g.fillRect(Math.random()*256|0, Math.random()*256|0, 1, 1); }
      const tex=new THREE.CanvasTexture(c);
      tex.wrapS=tex.wrapT=THREE.RepeatWrapping; tex.repeat.set(3,2);
      const wall=new THREE.Mesh(new THREE.PlaneGeometry(wallW*1.1, wallH*1.1),
        new THREE.MeshLambertMaterial({map:tex, color:0xbfae8e}));
      scene.add(wall);
    })();

    scene.add(new THREE.AmbientLight(0xffffff, .05));

    /* 手电：聚光灯 + 握持晃动 */
    const spot=new THREE.SpotLight(0xffe9b8, 0, 30, .32, .55, 1.2);
    spot.position.set(0,0,dist*.98);
    const spotTarget=new THREE.Object3D(); scene.add(spotTarget);
    spot.target=spotTarget; scene.add(spot);

    /* ---------- 五句低语（受光材质，找到后自发光） ---------- */
    let found=0, time=60, overFlag=false;
    const spots=[];
    CONFIG.whispers.forEach((w,i)=>{
      const xPct=6+Math.random()*44, yPct=8+(i*17)+Math.random()*6;
      const {tex}=T3.textTexture(w,{size:30, color:'#d8c694', maxChars:13, lineHeight:1.7, pad:10});
      const img=tex.image;
      const scale=(rect.width*.4/img.width)*(wallW/rect.width);  /* 面片宽≈房间40% */
      const geo=new THREE.PlaneGeometry(img.width*scale, img.height*scale);
      const dim=new THREE.MeshLambertMaterial({map:tex, transparent:true, color:0x6a5c3c, depthWrite:false});
      const lit=new THREE.MeshBasicMaterial({map:tex, transparent:true, depthWrite:false});
      const mesh=new THREE.Mesh(geo, dim);
      /* 以文本左上角贴百分比坐标（与原DOM版一致） */
      const cx=xPct/100*rect.width + img.width*scale/2/(wallW/rect.width);
      const cy=yPct/100*rect.height + img.height*scale/2/(wallH/rect.height);
      const p=toWorld(cx,cy);
      mesh.position.set(p.x,p.y,.06);
      scene.add(mesh);
      spots.push({mesh, dim, lit, found:false, cx, cy});
    });
    window.__g={spots};                        /* 调试/自动化测试钩子 */

    /* 黑暗角落的眼睛 */
    const eyes=new THREE.Group();
    [-1,1].forEach(s=>{
      const e=new THREE.Mesh(new THREE.SphereGeometry(.075,8,8),
        new THREE.MeshBasicMaterial({color:0xcdb27a, transparent:true}));
      e.position.x=s*.16; eyes.add(e);
    });
    const eyePx={x:(60+Math.random()*30)/100*rect.width, y:(70+Math.random()*20)/100*rect.height};
    const ep=toWorld(eyePx.x, eyePx.y);
    eyes.position.set(ep.x, ep.y, .1);
    scene.add(eyes);
    let eyesGone=false, eyesFade=1;

    /* ---------- 手电控制 ---------- */
    let lx=-9999, ly=-9999, fl=0, t=0;
    function onMove(e){
      const r=room.getBoundingClientRect();
      lx=(e.touches?e.touches[0].clientX:e.clientX)-r.left;
      ly=(e.touches?e.touches[0].clientY:e.clientY)-r.top;
      if(!eyesGone && Math.hypot(eyePx.x-lx, eyePx.y-ly)<110){
        eyesGone=true;
        whisper("（那双眼睛……是在看你，还是在守着你？）");
      }
      spots.forEach(s=>{
        if(s.found) return;
        if(Math.hypot(s.cx-lx, s.cy-ly)<95){
          s.found=true; found++;
          s.mesh.material=s.lit;
          $('fg-c').textContent=`低语 ${found} / 5`;
          sfx.chime();
          const rr=room.getBoundingClientRect();
          burst(rr.left+s.cx, rr.top+s.cy, 10);
          if(found>=5 && !overFlag){ overFlag=true; finish(); }
        }
      });
    }
    room.addEventListener('pointermove',onMove);
    room.addEventListener('pointerdown',onMove);

    /* ---------- 渲染循环 ---------- */
    let raf=0;
    function loop(){
      t++;
      if(t%6===0) fl++;
      const dip=Math.random()<.004 ? .35 : 1;                   /* 偶尔骤暗 */
      if(lx>-999){
        spot.intensity=J.lerp(spot.intensity, 2.6*dip, .2);
        /* 握持微晃 */
        const wob=.06;
        const p=toWorld(lx+Math.sin(t/13)*wob*40, ly+Math.cos(t/17)*wob*40);
        spotTarget.position.set(p.x,p.y,0);
        const rPx=95+Math.sin(fl/7)*5;                          /* 光斑呼吸 */
        const rW=rPx*(wallW/rect.width);
        spot.angle=Math.atan(rW/dist)*1.15;
      }
      /* 眼睛：眨眼 + 被照到后淡出 */
      if(eyesGone){ eyesFade=Math.max(0,eyesFade-.02);
        eyes.children.forEach(e=>e.material.opacity=eyesFade);
        if(eyesFade<=0) eyes.visible=false;
      } else {
        const blink=(t%160)>150 ? .1 : 1;
        eyes.scale.y=blink;
      }
      renderer.render(scene,camera);
      if(!overFlag || eyesFade>0) raf=requestAnimationFrame(loop);
    }
    raf=requestAnimationFrame(loop);

    /* ---------- 计时与宽恕（与原版一致） ---------- */
    const timer=setInterval(()=>{
      if(overFlag) return;
      time--;
      $('fg-t').textContent=time;
      if(time===20){ redAlert(true); heartbeat(true,120); whisper("（光，在变弱……）"); }
      if(time<=10) $('fg-t').style.fontSize='30px';
      if(time<=0){ /* 不惩罚：旅馆"施舍"一次 */
        time=30; redAlert(false); heartbeat(true,85);
        shake(); screenTear();
        whisper("连体衣熊：「再来。这次我陪你一起找。」", true);
        spots.forEach(s=>{ if(!s.found){ s.dim.color.setHex(0xa08d5e); s.dim.opacity=.5; } });
      }
    },1000);

    function finish(){
      clearInterval(timer);
      redAlert(false); heartbeat(false); sfx.drone(false);
      room.style.cursor='default';
      /* 灯光全亮，墙上五句话都留在光里 */
      spot.intensity=0;
      scene.add(new THREE.AmbientLight(0xfff2d0, .9));
      renderer.render(scene,camera);
      sfx.chime(); burstCenter();
      delete window.__g;
      setTimeout(()=>{ cancelAnimationFrame(raf); T3.dispose(renderer,scene); resolve(); },1400);
    }
  });
}
