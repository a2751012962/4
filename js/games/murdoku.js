"use strict";
/* ================= 谜案集 · Murdoku ================= */
/* 上半部分：纯逻辑（不触碰 DOM，可在 node 中做唯一解校验） */

const MK_ROOM_PALETTE=['#22384a','#4a2f2b','#2f4130','#463c22','#3a2b46','#24424a','#44283a','#333a24'];
const MK_DIR_TEXT={N:'正北方（同一列、更靠上）',S:'正南方（同一列、更靠下）',E:'正东方（同一行、更靠右）',W:'正西方（同一行、更靠左）'};

function mkRoomIds(cs){ return [...new Set(cs.rooms.join(''))].sort(); }
function mkRoomAt(cs,r,c){ return cs.rooms[r][c]; }
function mkIsBlocked(cs,r,c){ return (cs.blocked||[]).some(b=>b[0]===r&&b[1]===c); }
function mkObjectAt(cs,r,c){ return (cs.objects||[]).find(o=>o.r===r&&o.c===c)||null; }
function mkPlaceable(cs,r,c){ return !mkIsBlocked(cs,r,c) && !mkObjectAt(cs,r,c); }
function mkObjectCells(cs,objId){ return (cs.objects||[]).filter(o=>o.id===objId).map(o=>[o.r,o.c]); }
function mkObjectName(cs,objId){ const o=(cs.objects||[]).find(o=>o.id===objId); return o?o.name:objId; }
function mkPerson(cs,id){ return cs.people.find(p=>p.id===id); }
function mkAdjacent(a,b){ return Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])===1; }

/* 房间成员：placement -> {roomId:[personId,...]} */
function mkRoomOccupants(cs,pos){
  const occ={};
  for(const id in pos){ const [r,c]=pos[id]; const rm=mkRoomAt(cs,r,c); (occ[rm]=occ[rm]||[]).push(id); }
  return occ;
}

/* 单条线索求值。pos 必须是完整摆放 {personId:[r,c],...} */
function mkEvalClue(clue,pos,cs){
  const p=pos[clue.person]; if(!p) return false;
  switch(clue.type){
    case 'row': return p[0]===clue.row;
    case 'col': return p[1]===clue.col;
    case 'inRoom': return mkRoomAt(cs,p[0],p[1])===clue.room;
    case 'notInRoom': return mkRoomAt(cs,p[0],p[1])!==clue.room;
    case 'besideObject': return mkObjectCells(cs,clue.object).some(oc=>mkAdjacent(p,oc));
    case 'notBesideObject': return !mkObjectCells(cs,clue.object).some(oc=>mkAdjacent(p,oc));
    /* 人与人相对位置：因“每行每列各一人”，同行/同列/紧邻均不可能，故只能用相邻行列 */
    case 'rowAbove': { const q=pos[clue.other]; return !!q && p[0]===q[0]-1; }
    case 'rowBelow': { const q=pos[clue.other]; return !!q && p[0]===q[0]+1; }
    case 'colLeftOf': { const q=pos[clue.other]; return !!q && p[1]===q[1]-1; }
    case 'colRightOf': { const q=pos[clue.other]; return !!q && p[1]===q[1]+1; }
    case 'dir': {
      /* other 只能是家具 id（人与人同行/同列不可能）；多格家具任一格成立即可 */
      const targets = mkObjectCells(cs,clue.other);
      return targets.some(t=>{
        if(clue.dir==='N') return p[1]===t[1] && p[0]<t[0];
        if(clue.dir==='S') return p[1]===t[1] && p[0]>t[0];
        if(clue.dir==='W') return p[0]===t[0] && p[1]<t[1];
        if(clue.dir==='E') return p[0]===t[0] && p[1]>t[1];
        return false;
      });
    }
    case 'sameRoom': { const q=pos[clue.other]; return !!q && mkRoomAt(cs,p[0],p[1])===mkRoomAt(cs,q[0],q[1]); }
    case 'diffRoom': { const q=pos[clue.other]; return !!q && mkRoomAt(cs,p[0],p[1])!==mkRoomAt(cs,q[0],q[1]); }
    case 'aloneWith': {
      const q=pos[clue.other]; if(!q) return false;
      const rm=mkRoomAt(cs,p[0],p[1]);
      if(mkRoomAt(cs,q[0],q[1])!==rm) return false;
      return mkRoomOccupants(cs,pos)[rm].length===2;
    }
    case 'aloneInRoom': { const rm=mkRoomAt(cs,p[0],p[1]); return mkRoomOccupants(cs,pos)[rm].length===1; }
    case 'edge': { const n=cs.size; return p[0]===0||p[0]===n-1||p[1]===0||p[1]===n-1; }
    case 'corner': { const n=cs.size; return (p[0]===0||p[0]===n-1)&&(p[1]===0||p[1]===n-1); }
    default: return false;
  }
}

/* 线索 -> 中文文本。asRecord=true 时以“被害者”为主语（现场记录），否则第一人称证词 */
function mkClueText(clue,cs,asRecord){
  const S=asRecord?'被害者':'我';
  const name=id=>{ const q=mkPerson(cs,id); return q?q.name:mkObjectName(cs,id); };
  switch(clue.type){
    case 'row': return `${S}当时在从上往下第${clue.row+1}行。`;
    case 'col': return clue.col===0?`${S}在最左边那一列。`:(clue.col===cs.size-1?`${S}在最右边那一列。`:`${S}在从左数第${clue.col+1}列。`);
    case 'inRoom': return `${S}一直待在${cs.roomNames[clue.room]}里。`;
    case 'notInRoom': return `${S}绝对没进过${cs.roomNames[clue.room]}。`;
    case 'besideObject': return `${S}就在${mkObjectName(cs,clue.object)}旁边（上下左右紧挨着）。`;
    case 'notBesideObject': return `${S}离${mkObjectName(cs,clue.object)}远得很，挨都没挨着。`;
    case 'rowAbove': return `${S}在${name(clue.other)}上面那一行。`;
    case 'rowBelow': return `${S}在${name(clue.other)}下面那一行。`;
    case 'colLeftOf': return `${S}在${name(clue.other)}左边那一列。`;
    case 'colRightOf': return `${S}在${name(clue.other)}右边那一列。`;
    case 'dir': return `${S}在${name(clue.other)}的${MK_DIR_TEXT[clue.dir]}。`;
    case 'sameRoom': return `${S}和${name(clue.other)}待在同一个房间。`;
    case 'diffRoom': return `${S}和${name(clue.other)}不在同一个房间。`;
    case 'aloneWith': return `那个房间里，只有${S}和${name(clue.other)}两个人。`;
    case 'aloneInRoom': return asRecord?'被害者所在的房间里，再没有第二个人的脚印。':'我独自待着——没人打扰，也没人能作证。';
    case 'edge': return `${S}靠着旅馆的外墙（平面图最外圈）。`;
    case 'corner': return `${S}正好在旅馆平面图的一个角上。`;
    default: return '（证词模糊不清……）';
  }
}

/* 完整摆放校验：ok + 未通过的线索下标 */
function mkCheckPlacement(pos,cs){
  const failed=[];
  cs.clues.forEach((cl,i)=>{ if(!mkEvalClue(cl,pos,cs)) failed.push(i); });
  return { ok:failed.length===0, failed };
}

/* 与被害者单独同处一室的嫌疑人（游戏取 [0]；校验器断言长度为 1） */
function mkFindMurderer(pos,cs){
  const v=pos[cs.victim]; if(!v) return [];
  const rm=mkRoomAt(cs,v[0],v[1]);
  const occ=mkRoomOccupants(cs,pos)[rm]||[];
  if(occ.length!==2) return [];
  return occ.filter(id=>id!==cs.victim);
}

/* 暴力求解：人->行 的排列 × 行->列 的排列，N<=6 时瞬间完成 */
function mkPerms(arr){
  if(arr.length<=1) return [arr.slice()];
  const out=[];
  arr.forEach((v,i)=>{
    const rest=arr.slice(0,i).concat(arr.slice(i+1));
    mkPerms(rest).forEach(p=>out.push([v].concat(p)));
  });
  return out;
}
function mkSolve(cs,limit=2){
  const n=cs.size, ids=cs.people.map(p=>p.id);
  const colPerms=mkPerms([...Array(n).keys()]).filter(cp=>cp.every((c,r)=>mkPlaceable(cs,r,c)));
  const found=[];
  for(const order of mkPerms(ids)){
    for(const cp of colPerms){
      const pos={};
      order.forEach((id,r)=>pos[id]=[r,cp[r]]);
      if(mkCheckPlacement(pos,cs).ok){
        found.push(pos);
        if(found.length>=limit) return found;
      }
    }
  }
  return found;
}

/* 开发期校验：结构 + 官方解成立 + 唯一解 + 凶手唯一。可在浏览器控制台或 node 调用 */
function mkVerifyAllCases(){
  const lines=[];
  MURDOKU_CASES.forEach(cs=>{
    const errs=[];
    const n=cs.size;
    try{
      if(cs.rooms.length!==n || cs.rooms.some(row=>row.length!==n)) errs.push('rooms 尺寸错误');
      if(cs.people.length!==n) errs.push(`people 数量 ${cs.people.length} ≠ ${n}`);
      if(!mkPerson(cs,cs.victim)) errs.push('victim id 不存在');
      mkRoomIds(cs).forEach(rid=>{ if(!cs.roomNames[rid]) errs.push(`房间 ${rid} 缺少名称`); });
      cs.clues.forEach((cl,i)=>{
        if(!mkPerson(cs,cl.person)) errs.push(`线索${i}: person 无效`);
        if(cl.room && !cs.roomNames[cl.room]) errs.push(`线索${i}: room 无效`);
        if(cl.object && !mkObjectCells(cs,cl.object).length) errs.push(`线索${i}: object 无效`);
        if(cl.type==='dir'){
          if(mkPerson(cs,cl.other)) errs.push(`线索${i}: dir 不能指向人物（同行/同列不可能）`);
          else if(!mkObjectCells(cs,cl.other).length) errs.push(`线索${i}: dir 目标家具无效`);
        } else if(cl.other && !mkPerson(cs,cl.other)) errs.push(`线索${i}: other 应为人物 id`);
      });
      cs.people.forEach(p=>{ if(!cs.clues.some(cl=>cl.person===p.id)) errs.push(`${p.name} 没有任何线索`); });
      /* 官方解 */
      const sol=cs.solution;
      const rows=new Set(), cols=new Set();
      cs.people.forEach(p=>{
        const s=sol[p.id];
        if(!s){ errs.push(`solution 缺少 ${p.id}`); return; }
        if(!mkPlaceable(cs,s[0],s[1])) errs.push(`solution: ${p.id} 位置不可站人`);
        rows.add(s[0]); cols.add(s[1]);
      });
      if(rows.size!==n||cols.size!==n) errs.push('solution 行/列冲突');
      if(!errs.length){
        const chk=mkCheckPlacement(sol,cs);
        if(!chk.ok) errs.push(`官方解不满足线索: ${chk.failed.join(',')}`);
        const sols=mkSolve(cs,2);
        if(sols.length===0) errs.push('无解');
        if(sols.length>1) errs.push(`多解！另一解: ${JSON.stringify(sols.find(s=>cs.people.some(p=>String(s[p.id])!==String(sol[p.id])))||sols[1])}`);
        if(sols.length===1 && cs.people.some(p=>String(sols[0][p.id])!==String(sol[p.id]))) errs.push(`唯一解与官方解不同: ${JSON.stringify(sols[0])}`);
        const m=mkFindMurderer(sol,cs);
        if(m.length!==1) errs.push(`凶手不唯一/不存在: [${m.join(',')}]（需恰好一名嫌疑人与被害者单独同室）`);
        else if(m[0]!==cs.murderer) errs.push(`凶手应为 ${m[0]}，数据写的是 ${cs.murderer}`);
      }
    }catch(e){ errs.push('异常: '+e.message); }
    lines.push(errs.length?`FAIL ${cs.id} ${cs.title} — ${errs.join('；')}`:`PASS ${cs.id} ${cs.title}`);
  });
  return lines.join('\n');
}

/* ================= 下半部分：界面 ================= */

/* ---------- 进度存档（与主线存档分离） ---------- */
const MK_SAVE_KEY='acorn_hotel_murdoku';
function mkLoad(){
  try{ const s=JSON.parse(localStorage.getItem(MK_SAVE_KEY)||'null'); return (s&&typeof s==='object')?{done:s.done||{},guideSeen:!!s.guideSeen}:{done:{},guideSeen:false}; }
  catch(e){ return {done:{},guideSeen:false}; }
}
function mkSave(s){ try{ localStorage.setItem(MK_SAVE_KEY,JSON.stringify(s)); }catch(e){} }
function mkMarkDone(id){ const s=mkLoad(); s.done[id]=true; mkSave(s); }
function mkDoneCount(){ return Object.keys(mkLoad().done).length; }

/* ---------- 棋盘渲染（游戏与教程共用） ---------- */
function mkRoomColor(cs,rid){ return MK_ROOM_PALETTE[mkRoomIds(cs).indexOf(rid)%MK_ROOM_PALETTE.length]; }
function mkBuildBoard(cs,boardEl){
  const n=cs.size;
  boardEl.style.setProperty('--n',n);
  boardEl.innerHTML='';
  const corner=document.createElement('div'); corner.className='mk-lab'; boardEl.appendChild(corner);
  for(let c=0;c<n;c++){ const l=document.createElement('div'); l.className='mk-lab'; l.textContent=c+1; boardEl.appendChild(l); }
  const cells={};
  for(let r=0;r<n;r++){
    const l=document.createElement('div'); l.className='mk-lab'; l.textContent=r+1; boardEl.appendChild(l);
    for(let c=0;c<n;c++){
      const d=document.createElement('div'); d.className='mk-cell';
      d.dataset.r=r; d.dataset.c=c;
      const rid=mkRoomAt(cs,r,c);
      d.style.background=mkRoomColor(cs,rid)+'66';
      /* 房间边界：与相邻格房间不同（或到图边）时，画一道金色内描边 */
      const sh=[];
      const bcol='rgba(205,178,122,.45)';
      if(r===0||mkRoomAt(cs,r-1,c)!==rid) sh.push(`inset 0 2px 0 0 ${bcol}`);
      if(r===n-1||mkRoomAt(cs,r+1,c)!==rid) sh.push(`inset 0 -2px 0 0 ${bcol}`);
      if(c===0||mkRoomAt(cs,r,c-1)!==rid) sh.push(`inset 2px 0 0 0 ${bcol}`);
      if(c===n-1||mkRoomAt(cs,r,c+1)!==rid) sh.push(`inset -2px 0 0 0 ${bcol}`);
      if(sh.length) d.style.boxShadow=sh.join(',');
      if(mkIsBlocked(cs,r,c)){ d.classList.add('mk-blk'); d.title='墙'; }
      const obj=mkObjectAt(cs,r,c);
      if(obj){ d.classList.add('mk-obj'); d.innerHTML=`<span class="mk-obj-g">${obj.glyph}</span><span class="mk-obj-n">${obj.name}</span>`; d.title=obj.name; }
      boardEl.appendChild(d);
      cells[r+','+c]=d;
    }
  }
  return cells;
}
function mkChipHTML(p,extra){ return `<div class="mk-chip ${extra||''}" data-p="${p.id}"><span class="mk-chip-g">${p.glyph}</span><span class="mk-chip-n">${p.name}</span></div>`; }
function mkLegendHTML(cs){
  return `<div class="mk-legend">${mkRoomIds(cs).map(rid=>
    `<span class="mk-leg"><i style="background:${mkRoomColor(cs,rid)}"></i>${cs.roomNames[rid]}</span>`).join('')}</div>`;
}

/* ---------- 模式入口 ---------- */
async function murdokuMode(){
  if(!mkLoad().guideSeen){
    await mkGuide();
    const s=mkLoad(); s.guideSeen=true; mkSave(s);
  }
  while(true){
    const pick=await mkCaseSelect();
    if(pick===null) return;
    if(pick==='guide'){ await mkGuide(); continue; }
    await mkPlayCase(pick);
  }
}

/* ---------- 新手教程 ---------- */
function mkGuide(){
  return new Promise(resolve=>{
    /* 教程用 3×3 迷你案例（已填好正确答案） */
    const demo={
      size:3,
      rooms:["AAB","ABB","ABB"],
      roomNames:{A:'大堂',B:'餐厅'},
      objects:[{id:'piano',name:'钢琴',glyph:'🎹',r:0,c:1}],
      blocked:[],
      people:[
        {id:'gull',name:'海鸥小姐',glyph:'🕊️'},
        {id:'crab',name:'螃蟹先生',glyph:'🦀'},
        {id:'sailor',name:'水手熊',glyph:'⚓'}
      ],
      victim:'gull', clues:[],
      solution:{sailor:[0,0],gull:[1,2],crab:[2,1]}
    };
    setStage(`
      <div class="game-wrap mk-guide">
        <div class="chapter" style="font-size:24px;">侦 探 手 册</div>
        <p class="sub" style="margin-top:8px;">—— 谜案集 · 怎么玩 ——</p>
        <div class="mk-g-sec">
          <div class="mk-g-t">① 案发现场是一张平面图</div>
          <p>棋盘就是旅馆的平面图。<b>同一种颜色 = 同一个房间</b>，金色细线是房间的墙。
          格子里的<b>家具</b>🎹和<b>墙壁</b>▨上不能站人。</p>
        </div>
        <div class="mk-g-sec">
          <div class="mk-g-t">② 把每个人放回现场</div>
          <p>案发时刻，每个人都站在某个格子上，并且——<br>
          <b>每一行恰好一人，每一列也恰好一人。</b><br>
          点选下方的人物，再点格子放置；点已放置的人物可以收回重放。</p>
        </div>
        <div class="mk-g-sec">
          <div class="mk-g-t">③ 所有证词都必须成立</div>
          <p>每个人（包括被害者的现场记录）都留下了证词，<b>没有人说谎</b>。
          「旁边」指上下左右紧挨着的格子；「正北方」指同一列、更靠上（正南、正东、正西同理）。
          全部放好后，若有证词对不上，对应的证词会变红——挪一挪，再想想。</p>
        </div>
        <div class="mk-g-sec">
          <div class="mk-g-t">④ 指认凶手</div>
          <p>摆放全部正确后，看被害者所在的房间：<b>与被害者单独同处一室的那个人，就是凶手。</b>
          比如下面这个小现场——餐厅里只有海鸥小姐（被害）和螃蟹先生两个人，水手熊独自在大堂。凶手就是……🦀</p>
          <div id="mk-demo-board" class="mk-board mk-demo"></div>
          ${mkLegendHTML(demo)}
        </div>
        <button class="btn show" id="mk-g-ok">我 明 白 了</button>
      </div>
    `);
    const cells=mkBuildBoard(demo,$('mk-demo-board'));
    demo.people.forEach((p,i)=>{
      const cell=cells[demo.solution[p.id].join(',')];
      cell.insertAdjacentHTML('beforeend',mkChipHTML(p,'placed'+(p.id===demo.victim?' victim':'')+(p.id==='crab'?' mk-accusable':'')));
      cell.lastElementChild.style.animationDelay=(0.6+i*0.5)+'s';
    });
    /* 分段浮现动画 */
    document.querySelectorAll('.mk-g-sec').forEach((s,i)=>{ s.style.animationDelay=(i*0.22)+'s'; });
    $('mk-g-ok').onclick=()=>{ sfx.chime(); resolve(); };
  });
}

/* ---------- 案件选择 ---------- */
function mkCaseSelect(){
  return new Promise(resolve=>{
    const done=mkLoad().done;
    setStage(`
      <div class="game-wrap">
        <div class="chapter" style="font-size:26px;">谜 案 集</div>
        <p class="sub" style="margin-top:8px;">旅馆的登记簿背后，夹着九页没人认领的旧案。<br>已侦破 ${Object.keys(done).length} / ${MURDOKU_CASES.length}</p>
        <div class="mk-cases" id="mk-cases">
          ${MURDOKU_CASES.map((cs,i)=>`
            <button class="mk-case${done[cs.id]?' done':''}" data-i="${i}" style="animation-delay:${i*0.07}s">
              <span class="mk-case-no">${String(i+1).padStart(2,'0')}</span>
              <span class="mk-case-t">${cs.title.split('·')[1]||cs.title}</span>
              <span class="mk-case-s">${cs.sizeTag}${done[cs.id]?' · ✓ 已侦破':''}</span>
            </button>`).join('')}
        </div>
        <div class="game-tip">每行每列各站一人 · 所有证词必须成立<br>与被害者单独同处一室的人，就是凶手</div>
        <div class="mk-sel-btns">
          <button class="btn show" id="mk-guide-btn" style="margin-top:18px;">怎 么 玩</button>
          <button class="btn show" id="mk-back" style="margin-top:18px;">返 回 大 门</button>
        </div>
      </div>
    `);
    document.querySelectorAll('.mk-case').forEach(b=>{
      b.onclick=()=>{ sfx.thud(); resolve(MURDOKU_CASES[+b.dataset.i]); };
    });
    $('mk-guide-btn').onclick=()=>{ sfx.tick(); resolve('guide'); };
    $('mk-back').onclick=()=>{ sfx.tick(); resolve(null); };
  });
}

/* ---------- 单局游戏 ---------- */
function mkPlayCase(cs){
  return new Promise(resolve=>{
    const n=cs.size;
    setStage(`
      <div class="game-wrap">
        <div class="hud"><span>${cs.title}</span><span id="mk-quit" title="返回案件列表">✕ 放弃</span></div>
        <p class="sub mk-brief">${cs.brief}</p>
        <div id="mk-board" class="mk-board"></div>
        ${mkLegendHTML(cs)}
        <div id="mk-tray"></div>
        <div id="mk-clues"></div>
        <div class="game-tip" id="mk-tip">点选人物 → 点击格子放置 · 点击已放置的人可收回<br>每行、每列恰好一人 · 家具与墙上不能站人</div>
        <div id="mk-reveal"></div>
      </div>
    `);
    const cells=mkBuildBoard(cs,$('mk-board'));
    const tray=$('mk-tray'), cluesEl=$('mk-clues'), tip=$('mk-tip');
    const placed={};                 /* personId -> [r,c] */
    let sel=null, phase='place', over=false;

    /* 人物栏 */
    cs.people.forEach((p,i)=>{
      tray.insertAdjacentHTML('beforeend',mkChipHTML(p,p.id===cs.victim?'victim':''));
      const chip=tray.lastElementChild;
      chip.style.animationDelay=(i*0.08)+'s';
      chip.onclick=()=>{
        if(phase!=='place') return;
        if(sel===p.id){ sel=null; chip.classList.remove('sel'); return; }
        tray.querySelectorAll('.mk-chip').forEach(c=>c.classList.remove('sel'));
        sel=p.id; chip.classList.add('sel'); sfx.tick();
      };
    });

    /* 证词卡 */
    cs.people.forEach((p,i)=>{
      const isV=p.id===cs.victim;
      const texts=cs.clues.map((cl,ci)=>({cl,ci})).filter(x=>x.cl.person===p.id)
        .map(x=>`<div class="mk-clue-line" data-ci="${x.ci}">${isV?'':'「'}${mkClueText(x.cl,cs,isV)}${isV?'':'」'}</div>`).join('');
      cluesEl.insertAdjacentHTML('beforeend',`
        <div class="mk-clue" id="mkc-${p.id}" style="animation-delay:${0.2+i*0.08}s">
          <span class="mk-clue-who">${p.glyph} ${isV?`现场记录 · ${p.name}（被害）`:p.name}</span>${texts}
        </div>`);
    });

    function trayChip(id){ return tray.querySelector(`.mk-chip[data-p="${id}"]`); }
    function flashConflict(id){
      const el=document.querySelector(`.mk-cell .mk-chip[data-p="${id}"]`);
      if(el){ el.classList.remove('mk-conflict'); void el.offsetWidth; el.classList.add('mk-conflict'); }
    }
    function clearBad(){
      cluesEl.querySelectorAll('.mk-clue.bad').forEach(e=>e.classList.remove('bad'));
      cluesEl.querySelectorAll('.mk-clue-line.bad').forEach(e=>e.classList.remove('bad'));
    }

    function tryComplete(){
      if(Object.keys(placed).length<n) return;
      const chk=mkCheckPlacement(placed,cs);
      if(!chk.ok){
        shake();
        chk.failed.forEach(ci=>{
          const line=cluesEl.querySelector(`.mk-clue-line[data-ci="${ci}"]`);
          if(line){ line.classList.add('bad'); line.closest('.mk-clue').classList.add('bad'); }
        });
        tip.innerHTML='变红的证词对不上。收回一个人，再想想。';
        return;
      }
      /* 摆放全部正确 → 指认阶段 */
      phase='accuse';
      sfx.chime(); redAlert(true); setTimeout(()=>redAlert(false),1100);
      heartbeat(true,90);
      tip.innerHTML='所有证词都成立了。<br><b>点击棋盘上的凶手</b> —— 与被害者单独同处一室的那个人。';
      tray.classList.add('mk-hide');
      cluesEl.classList.add('mk-dim');
      document.querySelectorAll('.mk-cell .mk-chip').forEach(el=>{
        if(el.dataset.p!==cs.victim) el.classList.add('mk-accusable');
      });
    }

    function place(id,r,c){
      placed[id]=[r,c];
      const chip=trayChip(id);
      chip.classList.remove('sel');
      chip.classList.add('mk-hide');
      cells[r+','+c].insertAdjacentHTML('beforeend',mkChipHTML(mkPerson(cs,id),'placed pop'+(id===cs.victim?' victim':'')));
      sel=null; sfx.tick(); clearBad();
      if(Object.keys(placed).length===n) tryComplete();
      else tip.innerHTML='点选人物 → 点击格子放置 · 点击已放置的人可收回<br>每行、每列恰好一人 · 家具与墙上不能站人';
    }
    function unplace(id){
      const [r,c]=placed[id]; delete placed[id];
      const el=cells[r+','+c].querySelector('.mk-chip');
      if(el) el.remove();
      trayChip(id).classList.remove('mk-hide');
      sfx.tick(); clearBad();
    }

    $('mk-board').addEventListener('click',e=>{
      if(over) return;
      const chipEl=e.target.closest('.mk-cell .mk-chip');
      if(chipEl){
        const id=chipEl.dataset.p;
        if(phase==='place'){ unplace(id); return; }
        if(phase==='accuse'){
          if(id===cs.victim){ whisper('（他们已经无法回答了……）'); sfx.thud(); return; }
          if(id===mkFindMurderer(placed,cs)[0]) win(id);
          else{
            shake(); sfx.thud();
            whisper('（不……这个位置，说明不了什么。）');
            chipEl.classList.remove('mk-conflict'); void chipEl.offsetWidth; chipEl.classList.add('mk-conflict');
          }
          return;
        }
        return;
      }
      const cell=e.target.closest('.mk-cell');
      if(!cell || phase!=='place' || sel===null) return;
      const r=+cell.dataset.r, c=+cell.dataset.c;
      if(!mkPlaceable(cs,r,c)){ shake(); return; }
      const rowOcc=Object.keys(placed).find(id=>placed[id][0]===r);
      const colOcc=Object.keys(placed).find(id=>placed[id][1]===c);
      if(rowOcc||colOcc){ shake(); if(rowOcc)flashConflict(rowOcc); if(colOcc)flashConflict(colOcc); tip.innerHTML='每一行、每一列只能站一个人。'; return; }
      place(sel,r,c);
    });

    function win(murdererId){
      over=true; phase='done';
      heartbeat(false);
      const m=mkPerson(cs,murdererId), v=mkPerson(cs,cs.victim);
      const room=cs.roomNames[mkRoomAt(cs,placed[murdererId][0],placed[murdererId][1])];
      sfx.chime(); burstCenter(); screenTear();
      const mEl=document.querySelector(`.mk-cell .mk-chip[data-p="${murdererId}"]`);
      document.querySelectorAll('.mk-cell .mk-chip').forEach(el=>el.classList.remove('mk-accusable'));
      if(mEl) mEl.classList.add('mk-guilty');
      /* 高亮案发房间 */
      const vRoom=mkRoomAt(cs,placed[cs.victim][0],placed[cs.victim][1]);
      for(let r=0;r<n;r++)for(let c=0;c<n;c++){
        if(mkRoomAt(cs,r,c)===vRoom) cells[r+','+c].classList.add('mk-scene');
      }
      mkMarkDone(cs.id);
      tip.innerHTML='';
      $('mk-reveal').innerHTML=`
        <div class="mk-reveal-in">
          <div class="mk-reveal-t">真 相 大 白</div>
          <p>凶手是 <b>${m.glyph} ${m.name}</b>。<br>${room}里，只有${m.name}和${v.name}两个人。</p>
          <button class="btn show" id="mk-done-btn">收 录 此 案</button>
        </div>`;
      $('mk-done-btn').onclick=()=>{ sfx.chime(); resolve(); };
    }

    $('mk-quit').onclick=()=>{ if(over) return; heartbeat(false); redAlert(false); sfx.tick(); resolve(); };
  });
}
