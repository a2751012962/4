/* ================= 创意环节 · 水墨流云（忠实移植自 airbate/shuimo-liuyun · WebGL2 Stable-Fluids 水拓画）
   速度场：Stable Fluids（平流 → 涡度 → 投影）；墨色场以吸光度累积，显示按 宣纸色 × exp(-A) 减法混色。
   原站为永久运行的全屏 IIFE；此处封装为返回 Promise 的 inkwashGame()：点「收笔 · 继续」即停循环、销毁 GL、移除浮层并 resolve。
   ================= */
"use strict";
function inkwashGame(){
  return new Promise(resolve=>{
    const C = (CONFIG.inkwash||{});

    /* ---- 全屏沉浸层 ---- */
    const root=document.createElement('div'); root.id='ink-stage';
    root.innerHTML=`
      <canvas id="ink-c" width="2560" height="1440"></canvas>
      <div class="ink-title"><h1>水墨流韵</h1><div class="sub">SHUI MO LIU YUN · Sumi-e on Water</div></div>
      <div class="ink-seal">墨韵</div>
      <div class="ink-poem"><span>坐看云起时</span><span>行到水穷处</span><span class="poem-en">Sit, watch clouds rise · Walk till waters end</span></div>
      <div class="ink-hint" id="ink-hint">${C.hint||C.tip||"拖 动 落 墨 · D R A G   T O   P A I N T"}</div>
      <div class="ink-dock" role="toolbar" aria-label="Ink Tools">
        <div class="inks" id="ink-inks">
          <button class="ink ink-lun" data-ink="lun" aria-pressed="true"><span class="lbl">循环</span></button>
          <button class="ink ink-mo" data-ink="mo" aria-pressed="false"><span class="lbl">玄墨</span></button>
          <button class="ink ink-dai" data-ink="dai" aria-pressed="false"><span class="lbl">黛青</span></button>
          <button class="ink ink-zhu" data-ink="zhu" aria-pressed="false"><span class="lbl">朱砂</span></button>
          <button class="ink ink-zhuq" data-ink="zhuq" aria-pressed="false"><span class="lbl">竹青</span></button>
          <button class="ink ink-teng" data-ink="teng" aria-pressed="false"><span class="lbl">藤黄</span></button>
        </div>
        <div class="sep"></div>
        <button class="act" id="ink-auto" aria-pressed="true"><span class="dot"></span>自动演墨</button>
        <button class="act" id="ink-fan">作漆扇</button>
        <button class="act" id="ink-wash">涤净</button>
        <div class="sep"></div>
        <button class="act ink-done" id="ink-done"><span class="dot"></span>收笔 · 继续</button>
      </div>
      <div class="ink-fanOverlay" id="ink-fanOverlay" hidden>
        <div class="fanWrap">
          <canvas id="ink-fanCanvas" width="1600" height="1080"></canvas>
          <div class="fanCaption">扇 成</div>
          <div class="fanActs"><button class="act" id="ink-fanSave">存为图片</button><button class="act" id="ink-fanClose">收起</button></div>
        </div>
      </div>`;
    document.body.appendChild(root);
    /* 进入时隐藏会穿透的游戏浮层 */
    const hidden=['night-badge','fragments','hud-companions'].map(id=>$(id)).filter(Boolean);
    hidden.forEach(el=>{ el.dataset._inkDisp=el.style.display; el.style.display='none'; });
    sfx.drone(true);

    let rafId=0, ended=false, sinceNote=0;
    function teardown(){
      if(ended) return; ended=true;
      cancelAnimationFrame(rafId);
      removeEventListener('resize', resize);
      try{ const lc=gl.getExtension('WEBGL_lose_context'); if(lc) lc.loseContext(); }catch(e){}
      hidden.forEach(el=>{ el.style.display=el.dataset._inkDisp||''; });
      sfx.chime(); sfx.drone(false);
      root.style.transition='opacity 1s'; root.style.opacity=0;
      setTimeout(()=>{ root.remove(); resolve(); },1000);
    }

    /* ═════════ 以下为原站 WebGL 流体模拟（仅把 document.getElementById 等指向本浮层内元素） ═════════ */
    const config = { SIM_RES:256, DYE_RES:1280, PRESSURE_ITER:26,
      VEL_DISSIPATION:0.16, DYE_DISSIPATION:0.14, CURL:14, SPLAT_RADIUS:0.0026, SPLAT_FORCE:5200 };
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const INKS = {
      mo:[0x1c/255,0x1c/255,0x22/255], dai:[0x1c/255,0x4b/255,0x7d/255],
      zhu:[0xc2/255,0x3b/255,0x2e/255], zhuq:[0x3a/255,0x7d/255,0x5d/255], teng:[0xc9/255,0x94/255,0x1a/255] };
    const INK_KEYS = Object.keys(INKS);
    const PAPER = [0xf2/255,0xec/255,0xdf/255];
    function inkAbsorption(c, strength){ const e=0.012;
      return [-Math.log(Math.max(c[0],e))*strength, -Math.log(Math.max(c[1],e))*strength, -Math.log(Math.max(c[2],e))*strength]; }

    const canvas = root.querySelector('#ink-c');
    const params = { alpha:false, depth:false, stencil:false, antialias:false, preserveDrawingBuffer:false };
    let gl = canvas.getContext('webgl2', params);
    const isWebGL2 = !!gl;
    if (!gl) gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);
    if (!gl){
      root.querySelector('#ink-hint').textContent='此设备不支持 WebGL，可直接「收笔」继续';
      root.querySelector('#ink-hint').classList.remove('gone');
      root.querySelector('#ink-done').addEventListener('click', teardown);
      return;
    }

    let halfFloat, supportLinear;
    if (isWebGL2){ gl.getExtension('EXT_color_buffer_float'); supportLinear=!!gl.getExtension('OES_texture_float_linear'); }
    else { halfFloat=gl.getExtension('OES_texture_half_float'); supportLinear=!!gl.getExtension('OES_texture_half_float_linear'); }
    if (!isWebGL2 && !halfFloat){   /* WebGL1且无半浮点纹理：走无WebGL的收笔兜底，不能抛错卡死章节流程 */
      root.querySelector('#ink-hint').textContent='此设备不支持 WebGL，可直接「收笔」继续';
      root.querySelector('#ink-hint').classList.remove('gone');
      root.querySelector('#ink-done').addEventListener('click', teardown);
      return;
    }
    const HALF_FLOAT = isWebGL2 ? gl.HALF_FLOAT : halfFloat.HALF_FLOAT_OES;

    function getFormat(internal, format){
      if(!isWebGL2) return { internal:gl.RGBA, format:gl.RGBA };
      if(renderable(internal,format)) return { internal, format };
      if(internal===gl.R16F && renderable(gl.RG16F,gl.RG)) return { internal:gl.RG16F, format:gl.RG };
      return { internal:gl.RGBA16F, format:gl.RGBA };
    }
    function renderable(internal, format){
      const tex=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,tex);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D,0,internal,4,4,0,format,HALF_FLOAT,null);
      const fbo=gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);
      const ok=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;
      gl.deleteFramebuffer(fbo); gl.deleteTexture(tex); return ok;
    }
    const fmtRGBA = isWebGL2 ? getFormat(gl.RGBA16F,gl.RGBA) : { internal:gl.RGBA, format:gl.RGBA };
    const fmtRG   = isWebGL2 ? getFormat(gl.RG16F,gl.RG)     : { internal:gl.RGBA, format:gl.RGBA };
    const fmtR    = isWebGL2 ? getFormat(gl.R16F,gl.RED)     : { internal:gl.RGBA, format:gl.RGBA };

    const VERT=`precision highp float; attribute vec2 aPosition; varying vec2 vUv,vL,vR,vT,vB; uniform vec2 texelSize;
      void main(){ vUv=aPosition*0.5+0.5; vL=vUv-vec2(texelSize.x,0.0); vR=vUv+vec2(texelSize.x,0.0);
      vT=vUv+vec2(0.0,texelSize.y); vB=vUv-vec2(0.0,texelSize.y); gl_Position=vec4(aPosition,0.0,1.0); }`;
    const FRAG_FADE=`precision mediump float; precision mediump sampler2D; varying vec2 vUv; uniform sampler2D uTexture; uniform float value;
      void main(){ gl_FragColor=value*texture2D(uTexture,vUv); }`;
    const FRAG_SPLAT=`precision highp float; precision highp sampler2D; varying vec2 vUv; uniform sampler2D uTarget;
      uniform float aspectRatio,radius; uniform vec3 color; uniform vec2 point;
      void main(){ vec2 p=vUv-point; p.x*=aspectRatio; vec3 splat=exp(-dot(p,p)/radius)*color;
      vec3 base=texture2D(uTarget,vUv).xyz; gl_FragColor=vec4(base+splat,1.0); }`;
    const FRAG_ADVECT=`precision highp float; precision highp sampler2D; varying vec2 vUv;
      uniform sampler2D uVelocity,uSource; uniform vec2 texelSize,dyeTexelSize; uniform float dt,dissipation;
      #ifdef MANUAL_FILTERING
      vec4 bilerp(sampler2D sam, vec2 uv, vec2 tsize){ vec2 st=uv/tsize-0.5; vec2 iuv=floor(st),fuv=fract(st);
        vec4 a=texture2D(sam,(iuv+vec2(0.5,0.5))*tsize); vec4 b=texture2D(sam,(iuv+vec2(1.5,0.5))*tsize);
        vec4 c=texture2D(sam,(iuv+vec2(0.5,1.5))*tsize); vec4 d=texture2D(sam,(iuv+vec2(1.5,1.5))*tsize);
        return mix(mix(a,b,fuv.x),mix(c,d,fuv.x),fuv.y); }
      #endif
      void main(){
      #ifdef MANUAL_FILTERING
        vec2 coord=vUv-dt*bilerp(uVelocity,vUv,texelSize).xy*texelSize; vec4 result=bilerp(uSource,coord,dyeTexelSize);
      #else
        vec2 coord=vUv-dt*texture2D(uVelocity,vUv).xy*texelSize; vec4 result=texture2D(uSource,coord);
      #endif
        gl_FragColor=result/(1.0+dissipation*dt); }`;
    const FRAG_DIVERGENCE=`precision mediump float; precision mediump sampler2D; varying vec2 vUv,vL,vR,vT,vB; uniform sampler2D uVelocity;
      void main(){ float L=texture2D(uVelocity,vL).x; float R=texture2D(uVelocity,vR).x; float T=texture2D(uVelocity,vT).y; float B=texture2D(uVelocity,vB).y;
      vec2 C=texture2D(uVelocity,vUv).xy; if(vL.x<0.0)L=-C.x; if(vR.x>1.0)R=-C.x; if(vT.y>1.0)T=-C.y; if(vB.y<0.0)B=-C.y;
      gl_FragColor=vec4(0.5*(R-L+T-B),0.0,0.0,1.0); }`;
    const FRAG_CURL=`precision mediump float; precision mediump sampler2D; varying vec2 vUv,vL,vR,vT,vB; uniform sampler2D uVelocity;
      void main(){ float L=texture2D(uVelocity,vL).y; float R=texture2D(uVelocity,vR).y; float T=texture2D(uVelocity,vT).x; float B=texture2D(uVelocity,vB).x;
      gl_FragColor=vec4(R-L-T+B,0.0,0.0,1.0); }`;
    const FRAG_VORTICITY=`precision highp float; precision highp sampler2D; varying vec2 vUv,vL,vR,vT,vB; uniform sampler2D uVelocity,uCurl; uniform float curl,dt;
      void main(){ float L=texture2D(uCurl,vL).x; float R=texture2D(uCurl,vR).x; float T=texture2D(uCurl,vT).x; float B=texture2D(uCurl,vB).x; float C=texture2D(uCurl,vUv).x;
      vec2 force=0.5*vec2(abs(T)-abs(B),abs(R)-abs(L)); force/=length(force)+0.0001; force*=curl*C; force.y*=-1.0;
      vec2 velocity=texture2D(uVelocity,vUv).xy+force*dt; velocity=clamp(velocity,-1000.0,1000.0); gl_FragColor=vec4(velocity,0.0,1.0); }`;
    const FRAG_PRESSURE=`precision mediump float; precision mediump sampler2D; varying vec2 vUv,vL,vR,vT,vB; uniform sampler2D uPressure,uDivergence;
      void main(){ float L=texture2D(uPressure,vL).x; float R=texture2D(uPressure,vR).x; float T=texture2D(uPressure,vT).x; float B=texture2D(uPressure,vB).x;
      float divergence=texture2D(uDivergence,vUv).x; gl_FragColor=vec4((L+R+B+T-divergence)*0.25,0.0,0.0,1.0); }`;
    const FRAG_GRADIENT=`precision mediump float; precision mediump sampler2D; varying vec2 vUv,vL,vR,vT,vB; uniform sampler2D uPressure,uVelocity;
      void main(){ float L=texture2D(uPressure,vL).x; float R=texture2D(uPressure,vR).x; float T=texture2D(uPressure,vT).x; float B=texture2D(uPressure,vB).x;
      vec2 velocity=texture2D(uVelocity,vUv).xy-vec2(R-L,T-B); gl_FragColor=vec4(velocity,0.0,1.0); }`;
    const FRAG_DISPLAY=`precision highp float; precision highp sampler2D; varying vec2 vUv; uniform sampler2D uDye; uniform vec3 paper; uniform vec2 res;
      float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      void main(){ vec3 A=texture2D(uDye,vUv).rgb; vec3 col=paper*exp(-A);
      float grain=(hash(vUv*res)-0.5)*0.018; float fiber=(hash(floor(vUv*res*vec2(0.5,3.0)))-0.5)*0.008; col+=grain+fiber;
      vec2 d=vUv*(1.0-vUv); float vig=smoothstep(0.0,0.06,min(d.x,d.y)*2.2); col*=mix(0.96,1.0,vig); gl_FragColor=vec4(col,1.0); }`;

    function compile(type,src,defines){ if(defines) src=defines.map(d=>'#define '+d).join('\n')+'\n'+src;
      const sh=gl.createShader(type); gl.shaderSource(sh,src); gl.compileShader(sh);
      if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(sh)); return sh; }
    function makeProgram(fragSrc,defines){ const prog=gl.createProgram();
      gl.attachShader(prog,compile(gl.VERTEX_SHADER,VERT)); gl.attachShader(prog,compile(gl.FRAGMENT_SHADER,fragSrc,defines));
      gl.linkProgram(prog); if(!gl.getProgramParameter(prog,gl.LINK_STATUS)) console.error(gl.getProgramInfoLog(prog));
      const uniforms={}; const n=gl.getProgramParameter(prog,gl.ACTIVE_UNIFORMS);
      for(let i=0;i<n;i++){ const name=gl.getActiveUniform(prog,i).name; uniforms[name]=gl.getUniformLocation(prog,name); }
      return { prog, uniforms, bind(){ gl.useProgram(prog); } }; }

    const blit=(()=>{ const buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,-1,1,1,1,1,-1]),gl.STATIC_DRAW);
      const idx=gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,idx);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array([0,1,2,0,2,3]),gl.STATIC_DRAW);
      gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0); gl.enableVertexAttribArray(0);
      return (target)=>{ if(target==null){ gl.viewport(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight); gl.bindFramebuffer(gl.FRAMEBUFFER,null); }
        else { gl.viewport(0,0,target.width,target.height); gl.bindFramebuffer(gl.FRAMEBUFFER,target.fbo); }
        gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0); }; })();

    const progFade=makeProgram(FRAG_FADE), progSplat=makeProgram(FRAG_SPLAT);
    const progAdvect=makeProgram(FRAG_ADVECT, supportLinear?null:['MANUAL_FILTERING']);
    const progDivergence=makeProgram(FRAG_DIVERGENCE), progCurl=makeProgram(FRAG_CURL), progVorticity=makeProgram(FRAG_VORTICITY);
    const progPressure=makeProgram(FRAG_PRESSURE), progGradient=makeProgram(FRAG_GRADIENT), progDisplay=makeProgram(FRAG_DISPLAY);

    function createFBO(w,h,fmt,filter){ const tex=gl.createTexture(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,tex);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,filter); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,filter);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D,0,fmt.internal,w,h,0,fmt.format,HALF_FLOAT,null);
      const fbo=gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);
      gl.viewport(0,0,w,h); gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT);
      return { tex,fbo,width:w,height:h,texelSizeX:1/w,texelSizeY:1/h,
        attach(id){ gl.activeTexture(gl.TEXTURE0+id); gl.bindTexture(gl.TEXTURE_2D,tex); return id; } }; }
    function createDoubleFBO(w,h,fmt,filter){ let a=createFBO(w,h,fmt,filter), b=createFBO(w,h,fmt,filter);
      return { width:w,height:h,texelSizeX:1/w,texelSizeY:1/h, get read(){return a;}, get write(){return b;}, swap(){ const t=a; a=b; b=t; } }; }
    function getResolution(base){ let aspect=gl.drawingBufferWidth/gl.drawingBufferHeight; if(aspect<1)aspect=1/aspect;
      const min=Math.round(base),max=Math.round(base*aspect);
      return (gl.drawingBufferWidth>gl.drawingBufferHeight)?{width:max,height:min}:{width:min,height:max}; }

    let velocity,dye,pressure,divergence,curlFBO;
    const FILTER = supportLinear ? gl.LINEAR : gl.NEAREST;
    function initFBOs(){ const sim=getResolution(config.SIM_RES), dyeRes=getResolution(config.DYE_RES);
      velocity=createDoubleFBO(sim.width,sim.height,fmtRG,FILTER); dye=createDoubleFBO(dyeRes.width,dyeRes.height,fmtRGBA,FILTER);
      pressure=createDoubleFBO(sim.width,sim.height,fmtR,gl.NEAREST); divergence=createFBO(sim.width,sim.height,fmtR,gl.NEAREST); curlFBO=createFBO(sim.width,sim.height,fmtR,gl.NEAREST); }
    function resize(){ const dpr=Math.min(devicePixelRatio||1,2); const w=Math.floor(canvas.clientWidth*dpr), h=Math.floor(canvas.clientHeight*dpr);
      if(canvas.width!==w||canvas.height!==h){ canvas.width=w; canvas.height=h; initFBOs(); } }
    resize(); addEventListener('resize', resize);

    function correctRadius(r){ const aspect=canvas.width/canvas.height; return aspect>1?r*aspect:r; }
    function splatVelocity(x,y,dx,dy){ progSplat.bind(); gl.uniform1i(progSplat.uniforms.uTarget,velocity.read.attach(0));
      gl.uniform1f(progSplat.uniforms.aspectRatio,canvas.width/canvas.height); gl.uniform2f(progSplat.uniforms.point,x,y);
      gl.uniform3f(progSplat.uniforms.color,dx,dy,0); gl.uniform1f(progSplat.uniforms.radius,correctRadius(config.SPLAT_RADIUS)); blit(velocity.write); velocity.swap(); }
    function splatDye(x,y,absorb,radiusScale){ progSplat.bind(); gl.uniform1i(progSplat.uniforms.uTarget,dye.read.attach(0));
      gl.uniform1f(progSplat.uniforms.aspectRatio,canvas.width/canvas.height); gl.uniform2f(progSplat.uniforms.point,x,y);
      gl.uniform3f(progSplat.uniforms.color,absorb[0],absorb[1],absorb[2]); gl.uniform1f(progSplat.uniforms.radius,correctRadius(config.SPLAT_RADIUS*(radiusScale||1))); blit(dye.write); dye.swap(); }

    let currentInk='lun', cycleT=Math.PI*0.3;
    function lerp3(a,b,t){ return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]; }
    function pickColor(){ if(currentInk!=='lun') return INKS[currentInk]; const n=INK_KEYS.length; const t=(cycleT%1)*n;
      const i=Math.floor(t)%n, j=(i+1)%n; return lerp3(INKS[INK_KEYS[i]],INKS[INK_KEYS[j]],t-i); }

    const pointers=new Map(); const hint=root.querySelector('#ink-hint'); let interacted=false;
    function dismissHint(){ if(!interacted){ interacted=true; hint.classList.add('gone'); } }
    canvas.addEventListener('pointerdown',e=>{ canvas.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId,{x:e.clientX/canvas.clientWidth,y:1-e.clientY/canvas.clientHeight,down:true}); dismissHint();
      const p=pointers.get(e.pointerId); splatDye(p.x,p.y,inkAbsorption(pickColor(),0.85),4.5); lastActive=performance.now(); });
    canvas.addEventListener('pointermove',e=>{ const x=e.clientX/canvas.clientWidth, y=1-e.clientY/canvas.clientHeight;
      let p=pointers.get(e.pointerId); if(!p){ pointers.set(e.pointerId,{x,y,down:false}); return; }
      const dx=(x-p.x)*config.SPLAT_FORCE, dy=(y-p.y)*config.SPLAT_FORCE;
      if(p.down){ splatVelocity(x,y,dx,dy); splatDye(x,y,inkAbsorption(pickColor(),0.34),1); dismissHint();
        if(sinceNote++%30===0) sfx.note(392+Math.random()*160,.5,.04); }
      else { splatVelocity(x,y,dx*0.22,dy*0.22); } p.x=x; p.y=y; lastActive=performance.now(); });
    const endPointer=e=>{ const p=pointers.get(e.pointerId); if(p) p.down=false; };
    canvas.addEventListener('pointerup',endPointer); canvas.addEventListener('pointercancel',endPointer);
    canvas.addEventListener('pointerleave',e=>pointers.delete(e.pointerId));

    let autoOn=!reducedMotion, lastActive=0, nextDrop=performance.now()+900, nextCurrent=performance.now()+2600;
    function autoDrop(now){ const x=0.15+Math.random()*0.7, y=0.2+Math.random()*0.6, c=pickColor();
      splatDye(x,y,inkAbsorption(c,0.4+Math.random()*0.35),2+Math.random()*5);
      const a=Math.random()*Math.PI*2; splatVelocity(x,y,Math.cos(a)*180,Math.sin(a)*180); nextDrop=now+2600+Math.random()*4200; }
    function autoCurrent(now){ const y0=0.25+Math.random()*0.5, dir=Math.random()<0.5?1:-1, amp=0.05+Math.random()*0.12, steps=14;
      for(let i=0;i<=steps;i++){ const t=i/steps, x=dir>0?t:1-t, y=y0+Math.sin(t*Math.PI*2+Math.random())*amp;
        splatVelocity(x,y,dir*540*(0.4+Math.sin(t*Math.PI)),Math.cos(t*6.0)*160); } nextCurrent=now+4200+Math.random()*5200; }

    let washUntil=0;
    root.querySelector('#ink-wash').addEventListener('click',()=>{ washUntil=performance.now()+3200;
      for(let i=0;i<5;i++){ const a=Math.random()*Math.PI*2; splatVelocity(Math.random(),Math.random(),Math.cos(a)*800,Math.sin(a)*800); } dismissHint(); });

    /* ── 漆扇 ── */
    const fanOverlay=root.querySelector('#ink-fanOverlay'), fanCanvas=root.querySelector('#ink-fanCanvas'), fctx=fanCanvas.getContext('2d');
    function drawFan(){ const W=fanCanvas.width,H=fanCanvas.height, cx=W/2, cy=H*0.86, R=H*0.78, r=R*0.24, half=Math.PI*65/180;
      const a0=-Math.PI/2-half, a1=-Math.PI/2+half; fctx.clearRect(0,0,W,H);
      const fanPath=()=>{ fctx.beginPath(); fctx.arc(cx,cy,R,a0,a1); fctx.arc(cx,cy,r,a1,a0,true); fctx.closePath(); };
      fctx.save(); fanPath(); fctx.clip();
      const bx=cx-R, by=cy-R, bw=R*2, bh=R*1.3, srcAspect=canvas.width/canvas.height; let dw=bw, dh=dw/srcAspect; if(dh<bh){ dh=bh; dw=dh*srcAspect; }
      fctx.drawImage(canvas, bx+(bw-dw)/2, by+(bh-dh)/2, dw, dh);
      const sheen=fctx.createLinearGradient(0,by,0,cy); sheen.addColorStop(0,'rgba(255,250,238,.16)'); sheen.addColorStop(.5,'rgba(255,250,238,0)'); sheen.addColorStop(1,'rgba(60,40,20,.10)');
      fctx.fillStyle=sheen; fctx.fillRect(bx,by,bw,R); fctx.restore();
      const RIBS=13; for(let i=0;i<RIBS;i++){ const a=a0+(a1-a0)*i/(RIBS-1), edge=(i===0||i===RIBS-1);
        fctx.beginPath(); fctx.moveTo(cx+Math.cos(a)*(edge?0:r),cy+Math.sin(a)*(edge?0:r)); fctx.lineTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R);
        fctx.strokeStyle=edge?'rgba(58,38,22,.85)':'rgba(58,38,22,.22)'; fctx.lineWidth=edge?9:3; fctx.lineCap='round'; fctx.stroke(); }
      fanPath(); fctx.strokeStyle='rgba(58,38,22,.5)'; fctx.lineWidth=4; fctx.stroke();
      fctx.beginPath(); fctx.arc(cx,cy,11,0,Math.PI*2); fctx.fillStyle='#3a2616'; fctx.fill();
      fctx.beginPath(); fctx.arc(cx-3,cy-3,4,0,Math.PI*2); fctx.fillStyle='rgba(255,240,210,.55)'; fctx.fill();
      const sx=cx+Math.cos(a1-0.09)*R*0.82, sy=cy+Math.sin(a1-0.09)*R*0.82; fctx.save(); fctx.translate(sx,sy); fctx.rotate(-0.06);
      fctx.fillStyle='rgba(157,43,32,.92)'; const s=44; fctx.beginPath(); if(fctx.roundRect) fctx.roundRect(-s/2,-s/2,s,s,7); else fctx.rect(-s/2,-s/2,s,s); fctx.fill();
      fctx.fillStyle='#f6efe2'; fctx.font='19px "Ma Shan Zheng", serif'; fctx.textAlign='center'; fctx.fillText('墨',0,-2); fctx.fillText('韵',0,17); fctx.restore(); }
    root.querySelector('#ink-fan').addEventListener('click',()=>{ for(let i=0;i<3;i++){ const a=Math.random()*Math.PI*2;
        splatVelocity(0.3+Math.random()*0.4,0.3+Math.random()*0.4,Math.cos(a)*500,Math.sin(a)*500); }
      render(); drawFan(); fanOverlay.hidden=false; requestAnimationFrame(()=>fanOverlay.classList.add('show')); sfx.chime(); dismissHint(); });
    function closeFan(){ fanOverlay.classList.remove('show'); setTimeout(()=>{ fanOverlay.hidden=true; },600); }
    root.querySelector('#ink-fanClose').addEventListener('click',closeFan);
    fanOverlay.addEventListener('click',e=>{ if(e.target===fanOverlay) closeFan(); });
    root.querySelector('#ink-fanSave').addEventListener('click',()=>{ const a=document.createElement('a'); a.download='sumi-fan.png'; a.href=fanCanvas.toDataURL('image/png'); a.click(); });

    const autoBtn=root.querySelector('#ink-auto'); autoBtn.setAttribute('aria-pressed',String(autoOn));
    autoBtn.addEventListener('click',()=>{ autoOn=!autoOn; autoBtn.setAttribute('aria-pressed',String(autoOn)); });
    root.querySelector('#ink-inks').addEventListener('click',e=>{ const btn=e.target.closest('.ink'); if(!btn) return; currentInk=btn.dataset.ink;
      for(const b of root.querySelectorAll('.ink')) b.setAttribute('aria-pressed',String(b===btn)); });
    root.querySelector('#ink-done').addEventListener('click',teardown);

    let lastTime=performance.now();
    function step(dt){ gl.disable(gl.BLEND);
      progCurl.bind(); gl.uniform2f(progCurl.uniforms.texelSize,velocity.texelSizeX,velocity.texelSizeY); gl.uniform1i(progCurl.uniforms.uVelocity,velocity.read.attach(0)); blit(curlFBO);
      progVorticity.bind(); gl.uniform2f(progVorticity.uniforms.texelSize,velocity.texelSizeX,velocity.texelSizeY); gl.uniform1i(progVorticity.uniforms.uVelocity,velocity.read.attach(0));
      gl.uniform1i(progVorticity.uniforms.uCurl,curlFBO.attach(1)); gl.uniform1f(progVorticity.uniforms.curl,config.CURL); gl.uniform1f(progVorticity.uniforms.dt,dt); blit(velocity.write); velocity.swap();
      progDivergence.bind(); gl.uniform2f(progDivergence.uniforms.texelSize,velocity.texelSizeX,velocity.texelSizeY); gl.uniform1i(progDivergence.uniforms.uVelocity,velocity.read.attach(0)); blit(divergence);
      progFade.bind(); gl.uniform1i(progFade.uniforms.uTexture,pressure.read.attach(0)); gl.uniform1f(progFade.uniforms.value,0.8); blit(pressure.write); pressure.swap();
      progPressure.bind(); gl.uniform2f(progPressure.uniforms.texelSize,velocity.texelSizeX,velocity.texelSizeY); gl.uniform1i(progPressure.uniforms.uDivergence,divergence.attach(0));
      for(let i=0;i<config.PRESSURE_ITER;i++){ gl.uniform1i(progPressure.uniforms.uPressure,pressure.read.attach(1)); blit(pressure.write); pressure.swap(); }
      progGradient.bind(); gl.uniform2f(progGradient.uniforms.texelSize,velocity.texelSizeX,velocity.texelSizeY); gl.uniform1i(progGradient.uniforms.uPressure,pressure.read.attach(0)); gl.uniform1i(progGradient.uniforms.uVelocity,velocity.read.attach(1)); blit(velocity.write); velocity.swap();
      progAdvect.bind(); gl.uniform2f(progAdvect.uniforms.texelSize,velocity.texelSizeX,velocity.texelSizeY);
      if(!supportLinear) gl.uniform2f(progAdvect.uniforms.dyeTexelSize,velocity.texelSizeX,velocity.texelSizeY);
      gl.uniform1i(progAdvect.uniforms.uVelocity,velocity.read.attach(0)); gl.uniform1i(progAdvect.uniforms.uSource,velocity.read.attach(0)); gl.uniform1f(progAdvect.uniforms.dt,dt); gl.uniform1f(progAdvect.uniforms.dissipation,config.VEL_DISSIPATION); blit(velocity.write); velocity.swap();
      const washing=performance.now()<washUntil;
      if(!supportLinear) gl.uniform2f(progAdvect.uniforms.dyeTexelSize,dye.texelSizeX,dye.texelSizeY);
      gl.uniform1i(progAdvect.uniforms.uVelocity,velocity.read.attach(0)); gl.uniform1i(progAdvect.uniforms.uSource,dye.read.attach(1)); gl.uniform1f(progAdvect.uniforms.dissipation,washing?2.4:config.DYE_DISSIPATION); blit(dye.write); dye.swap(); }
    function render(){ progDisplay.bind(); gl.uniform2f(progDisplay.uniforms.texelSize,1/canvas.width,1/canvas.height); gl.uniform1i(progDisplay.uniforms.uDye,dye.read.attach(0));
      gl.uniform3f(progDisplay.uniforms.paper,PAPER[0],PAPER[1],PAPER[2]); gl.uniform2f(progDisplay.uniforms.res,canvas.width,canvas.height); blit(null); }
    function frame(now){ if(ended) return; const dt=Math.min((now-lastTime)/1000,1/30); lastTime=now; cycleT+=dt*0.05;
      const idle=now-lastActive>1800; if(autoOn&&idle&&!reducedMotion){ if(now>=nextDrop) autoDrop(now); if(now>=nextCurrent) autoCurrent(now); }
      step(dt); render(); rafId=requestAnimationFrame(frame); }

    if(!reducedMotion){ splatDye(0.38,0.58,inkAbsorption(INKS.mo,0.8),7); splatVelocity(0.38,0.58,320,-140);
      splatDye(0.62,0.42,inkAbsorption(INKS.dai,0.6),5); splatVelocity(0.62,0.42,-260,180); }
    rafId=requestAnimationFrame(frame);
  });
}
