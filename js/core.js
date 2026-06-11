"use strict";
const $ = id => document.getElementById(id);
const stage = $('stage');
const sleep = ms => new Promise(r=>setTimeout(r,ms));
let fragments = 0;

/* ================= 音效 ================= */
const sfx = (()=> {
  let ctx=null, on=false, waveGain=null, droneOsc=null;
  const ensure=()=>{ if(!ctx) ctx=new (window.AudioContext||window.webkitAudioContext)(); };
  const tick=()=>{ if(!on||!ctx)return; const o=ctx.createOscillator(),g=ctx.createGain();
    o.frequency.value=2600+Math.random()*600; g.gain.value=.012; o.connect(g); g.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime+.015); };
  const thud=()=>{ if(!on||!ctx)return; const o=ctx.createOscillator(),g=ctx.createGain();
    o.type='sine'; o.frequency.setValueAtTime(70,ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(35,ctx.currentTime+.4);
    g.gain.setValueAtTime(.5,ctx.currentTime); g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.6);
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime+.65); };
  const chime=()=>{ if(!on||!ctx)return; [523.25,659.25,783.99].forEach((f,i)=>{
    const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.value=f;
    g.gain.setValueAtTime(0,ctx.currentTime+i*.18); g.gain.linearRampToValueAtTime(.08,ctx.currentTime+i*.18+.05);
    g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+i*.18+1.6);
    o.connect(g); g.connect(ctx.destination); o.start(ctx.currentTime+i*.18); o.stop(ctx.currentTime+i*.18+1.7); }); };
  const waves=(start)=>{ if(!ctx)return;
    if(start && !waveGain){ const len=ctx.sampleRate*4, buf=ctx.createBuffer(1,len,ctx.sampleRate), d=buf.getChannelData(0);
      for(let i=0;i<len;i++) d[i]=Math.random()*2-1;
      const src=ctx.createBufferSource(); src.buffer=buf; src.loop=true;
      const f=ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=420;
      waveGain=ctx.createGain(); waveGain.gain.value=.06;
      const lfo=ctx.createOscillator(),lg=ctx.createGain(); lfo.frequency.value=.12; lg.gain.value=.05;
      lfo.connect(lg); lg.connect(waveGain.gain);
      src.connect(f); f.connect(waveGain); waveGain.connect(ctx.destination); src.start(); lfo.start();
    } else if(!start && waveGain){ waveGain.gain.linearRampToValueAtTime(0,ctx.currentTime+1.5); waveGain=null; } };
  const drone=(start)=>{ if(!ctx)return;
    if(start && !droneOsc){ droneOsc=ctx.createOscillator(); const g=ctx.createGain();
      droneOsc.type='sawtooth'; droneOsc.frequency.value=48; g.gain.value=.016;
      const f=ctx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=120;
      droneOsc.connect(f); f.connect(g); g.connect(ctx.destination); droneOsc.start(); droneOsc._g=g;
    } else if(!start && droneOsc){ droneOsc._g.gain.linearRampToValueAtTime(0,ctx.currentTime+2);
      droneOsc.stop(ctx.currentTime+2.1); droneOsc=null; } };
  const note=(freq,dur=.5,vol=.12)=>{ if(!on||!ctx)return;
    const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.value=freq;
    const o2=ctx.createOscillator(),g2=ctx.createGain(); o2.type='triangle'; o2.frequency.value=freq*2; g2.gain.value=vol*.25;
    g.gain.setValueAtTime(vol,ctx.currentTime); g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+dur);
    g2.gain.setValueAtTime(vol*.3,ctx.currentTime); g2.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+dur*.8);
    o.connect(g); g.connect(ctx.destination); o2.connect(g2); g2.connect(ctx.destination);
    o.start(); o.stop(ctx.currentTime+dur+.05); o2.start(); o2.stop(ctx.currentTime+dur); };
  return { toggle(){ensure(); on=!on; if(!on){waves(false);drone(false);} return on;},
    enable(){ try{ ensure(); if(ctx.state==='suspended')ctx.resume(); on=true; }catch(e){ on=false; } },
    tick,thud,chime,waves,drone,note };
})();
function toggleSound(){ const on=sfx.toggle();
  $('sound-btn').style.color = on?'#cdb27a':'#7d7060';
  $('sound-btn').style.borderColor = on?'#cdb27a88':'#3c352644'; }

/* ============ 全局错误可视化（排查用） ============ */
function showErr(msg){
  let box=document.getElementById('errbox');
  if(!box){ box=document.createElement('div'); box.id='errbox';
    box.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:999;background:#5e2018;color:#f0c0b0;font-size:12px;padding:8px 14px;font-family:monospace;max-height:30vh;overflow:auto;';
    document.body.appendChild(box); }
  const d=document.createElement('div'); d.textContent='⚠ '+msg; box.appendChild(d);
}
addEventListener('error',e=>showErr((e.message||'脚本错误')+' @'+(e.filename||'').split('/').pop()+':'+e.lineno));
addEventListener('unhandledrejection',e=>showErr('Promise: '+(e.reason&&e.reason.message||e.reason)));
