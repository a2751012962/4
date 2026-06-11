/* ================= 基础原语 ================= */
function setStage(html){ stage.innerHTML = `<div class="fade-in" style="width:100%;display:flex;flex-direction:column;align-items:center;">${html}</div>`; }
function shake(){ sfx.thud(); document.body.classList.add('shake'); setTimeout(()=>document.body.classList.remove('shake'),500); }
function whisper(text, cute=false){
  const w=document.createElement('div'); w.className='whisper'+(cute?' acorn-say':''); w.textContent=text;
  const c=[[8,12],[8,72],[72,14],[66,70]][Math.floor(Math.random()*4)];
  w.style.left=c[0]+'vw'; w.style.top=c[1]+'vh';
  document.body.appendChild(w); setTimeout(()=>w.remove(),4200);
}
async function typeInto(el, lines, speed=62){
  el.classList.add('cursor');
  /* 点击任意处：跳过打字动画，文字立即全部显示 */
  let skip=false;
  const onTap=()=>{ skip=true; };
  stage.addEventListener('pointerdown', onTap);
  try{
    for(const line of lines){
      const p=document.createElement('div'); el.appendChild(p);
      for(const ch of line){
        p.textContent+=ch;
        if(!skip){ sfx.tick(); await sleep(/[。？！—]/.test(ch)?speed*4:speed); }
      }
      if(!skip) await sleep(380);
    }
  } finally {
    stage.removeEventListener('pointerdown', onTap);
    el.classList.remove('cursor');
  }
}
function waitClick(btn){ return new Promise(res=>{ btn.classList.add('show'); btn.onclick=()=>res(); }); }
async function screenType(lines, btnLabel="继 续", speed=62){
  setStage(`<div class="type-area" id="ta"></div><button class="btn" id="cb">${btnLabel}</button>`);
  await typeInto($('ta'), lines, speed);
  await waitClick($('cb'));
}
async function chapterCard(title, sub, iconIdx){
  const icon = (typeof iconIdx==='number') ? ART.chapterIcon(iconIdx) : '';
  setStage(`<div class="chapter-card">
    ${icon}
    <div class="chapter">${glitchHTML(title,true)}</div>
    <div class="deco"></div>
    <p class="sub">${sub}</p>
    <button class="btn" id="cb">进 入</button>
  </div>`);
  sfx.thud(); screenTear(); await sleep(800); await waitClick($('cb'));
}
async function blackoutSay(lines){
  const bo=$('blackout');
  for(const t of lines){ bo.innerHTML=t; bo.classList.add('on'); sfx.thud(); await sleep(2400); }
  bo.classList.remove('on');
}
function addFragment(){ fragments++; $('fragments').textContent=`记忆碎片 ${fragments} / 4`; sfx.chime(); }
function setNight(n){ $('night-badge').textContent = n; }

/* 统计与彩蛋 */
const STATS = { wrong:0, eggs:[false,false,false,false], start:Date.now() };
function eggCount(){ return STATS.eggs.filter(Boolean).length; }
function plantEgg(i, container){
  if(STATS.eggs[i]) return;
  const e=document.createElement('div');
  e.className='egg'; e.title='？';
  e.innerHTML=`<svg viewBox="0 0 40 46"><ellipse cx="20" cy="26" rx="11" ry="13" fill="#cf9352" stroke="#8a5a28" stroke-width="2"/><path d="M7 19 q13 -15 26 0 q-13 5 -26 0 z" fill="#7a4e26"/><rect x="18.5" y="6" width="3" height="6" rx="1.5" fill="#5b3a1c"/></svg>`;
  e.style.left=(12+Math.random()*70)+'%';
  e.style.top=(64+Math.random()*22)+'%';
  e.onclick=()=>{ STATS.eggs[i]=true; sfx.chime();
    burst(e.getBoundingClientRect().left+14, e.getBoundingClientRect().top+16, 12);
    e.remove();
    whisper(`（你捡到了一颗小橡子……${eggCount()}/4。它好像不属于这家旅馆。）`);
  };
  container.appendChild(e);
}

const norm = s => (s||"").toLowerCase().replace(/[\s。，、．.\-—_·,!！?？:：;；'"“”‘’()（）]/g,"");
function matches(input, answers){
  const v=norm(input); if(!v) return false;
  return answers.some(a=>{ const t=norm(a); return v===t || (t.length>=2 && v.includes(t)); });
}

/* 输入解谜：答错→旅馆变暗+低语；3次后给提示；5次后可跳过 */
async function askInput({question, answers, hint, successLines}){
  setStage(`
    <div class="type-area" id="ta"></div>
    <input class="ans-input" id="ai" autocomplete="off" placeholder="输入你的答案">
    <div class="ans-feedback" id="af"></div>
    <button class="btn show" id="cb" style="margin-top:10px;">确 认</button>
    <button class="btn" id="skip" style="font-size:13px;padding:8px 22px;">让旅馆原谅我（跳过）</button>
  `);
  let wrong=0;
  const wrongLines=[
    "（旅馆的灯，暗了一格。）",
    "（走廊深处传来翻动纸张的声音——登记簿在记录你的错误。）",
    "（低语：再想想……那一天，你真的忘了吗？）",
    "（笃笃从墙缝探出头：宿主别慌！再想想嘛！）",
    "（突突小声说：答不出也没关系，它不会怪你的。）"
  ];
  /* 先绑定处理器再打字：问题还没打完时，确认/回车也已可用 */
  const done=new Promise(res=>{
    const submit=()=>{
      const v=$('ai').value;
      if(!norm(v)){ $('ai').focus(); return; }
      if(matches(v,answers)){
        sfx.chime(); $('af').className='ans-feedback';
        $('af').textContent="（咔哒。某个上了四年锁的东西，开了。）";
        setTimeout(res,1600);
      } else {
        wrong++; STATS.wrong++; shake();
        $('af').className='ans-feedback bad';
        $('af').textContent=wrongLines[Math.min(wrong-1,wrongLines.length-1)];
        if(wrong===3){ $('af').textContent+="\n"+hint; $('af').style.whiteSpace='pre-line'; }
        if(wrong>=5){ $('skip').classList.add('show'); }
        $('ai').value=""; $('ai').focus();
      }
    };
    $('cb').onclick=submit;
    $('ai').addEventListener('keydown',e=>{ if(e.key==='Enter') submit(); });
    $('skip').onclick=()=>{ sfx.chime(); res(); };
  });
  await typeInto($('ta'), question.split("\n"), 52);
  const ai=$('ai'); if(ai) ai.focus();
  return done;
}

async function memoryScene(night){
  const m=CONFIG.nights[night];
  setStage(`
    <div class="photo-frame">📷<br>${m.photoCaption}</div>
    <div class="type-area" id="ta" style="min-height:140px;"></div>
    <button class="btn" id="cb">收 起 碎 片</button>
  `);
  await typeInto($('ta'), [...m.memoryText, `—— 记忆碎片 ${night+1} / 4 已收回 ——`], 52);
  addFragment();
  await waitClick($('cb'));
}

async function collectorNote(i){
  const n=CONFIG.collectorNotes[i];
  setStage(`
    <p class="sub" style="margin-bottom:20px;">门缝下面，被塞进来一张纸条。</p>
    <div class="note-paper">
      ${n.slice(0,-1).map(l=>`<div>${l}</div>`).join("")}
      <div class="sig">${n[n.length-1]}</div>
      <div class="corner-char">${CONFIG.finalCornerChars[i]}</div>
    </div>
    <p class="sub" style="margin-top:18px;font-size:12px;">（右下角……有一个很小的字）</p>
    <button class="btn" id="cb">收 好 纸 条</button>
  `);
  sfx.thud();
  plantEgg(i, stage.firstElementChild);
  await sleep(600); await waitClick($('cb'));
}

/* ============ 同伴HUD ============ */
const COMPANIONS = ['sailor','hiker','onesie','acorns'];
function initHud(owned=[]){
  let hud=$('hud-companions');
  if(!hud){ hud=document.createElement('div'); hud.id='hud-companions'; document.body.appendChild(hud); }
  hud.innerHTML='';
  COMPANIONS.forEach(k=>{
    const s=document.createElement('div');
    s.className='comp-slot'+(owned.includes(k)?' owned':''); s.id='comp-'+k;
    s.innerHTML=`<div class="comp-svg">${k==='acorns'?ART.acorns():ART.bear(k)}</div>`;
    hud.appendChild(s);
  });
}
function gainCompanion(k){
  const s=$('comp-'+k);
  if(s && !s.classList.contains('owned')){
    s.classList.add('owned','pop'); sfx.chime();
    setTimeout(()=>s.classList.remove('pop'),1000);
  }
}

/* ============ 存档 ============ */
const SAVE_KEY='acorn_hotel_save';
function saveProgress(stage){
  try{ localStorage.setItem(SAVE_KEY, JSON.stringify({
    stage, fragments, name: CONFIG._signedName||'',
    eggs: STATS.eggs, wrong: STATS.wrong })); }catch(e){}
}
function loadProgress(){
  try{ return JSON.parse(localStorage.getItem(SAVE_KEY)||'null'); }catch(e){ return null; }
}
function clearProgress(){ try{ localStorage.removeItem(SAVE_KEY); }catch(e){} }
