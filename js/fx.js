/* ================= 夸张特效 ================= */
let heartbeatTimer=null, heartbeatBpm=0;
function heartbeat(on, bpm=80){
  if(on && heartbeatTimer && heartbeatBpm===bpm) return;   /* 同节奏重复调用（如每帧）不重建定时器 */
  if(heartbeatTimer){ clearInterval(heartbeatTimer); heartbeatTimer=null; }
  heartbeatBpm=on?bpm:0;
  if(on){ heartbeatTimer=setInterval(()=>sfx.thud(), 60000/bpm); }
}
function redAlert(on){ $('redpulse').classList.toggle('on', on); }
function screenTear(){ document.body.classList.add('tearing'); setTimeout(()=>document.body.classList.remove('tearing'),1600); }
function burst(x,y,n=22){
  for(let i=0;i<n;i++){
    const p=document.createElement('div'); p.className='particle';
    const s=3+Math.random()*5; p.style.width=p.style.height=s+'px';
    p.style.left=x+'px'; p.style.top=y+'px';
    const a=Math.random()*Math.PI*2, d=60+Math.random()*140;
    p.style.setProperty('--dx', Math.cos(a)*d+'px');
    p.style.setProperty('--dy', Math.sin(a)*d-40+'px');
    document.body.appendChild(p); setTimeout(()=>p.remove(),1700);
  }
}
function burstCenter(){ burst(innerWidth/2, innerHeight/2, 30); }
function glitchHTML(text, hard=false){ return `<span class="glitch${hard?' hard':''}" data-t="${text}">${text}</span>`; }
