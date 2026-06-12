"use strict";
/* ---------- 主菜单 ---------- */
const STAGES=[stageIntro, stageNight1, stageNight2, stageNight3, stageNight4];
const STAGE_NAMES=["序章","第一晚 · 海之房","第二晚 · 山之房","第三晚 · 夜之房","第四晚 · 保管库"];
const OWNED_BY_STAGE=[[],[],['sailor'],['sailor','hiker'],['sailor','hiker','onesie']];

async function mainMenu(){
  const save=loadProgress();
  const scene=document.createElement('div');
  scene.id='menu-scene';
  scene.style.zIndex='15';   /* 内联兜底：必须压过 #stage(z10)，否则空舞台层挡住菜单按钮（防旧缓存CSS） */
  scene.innerHTML=ART.hotelScene();
  document.body.appendChild(scene);
  ART.makeRain(scene);

  const ui=document.createElement('div');
  ui.id='menu-ui';
  ui.innerHTML=`
    <div class="menu-title">橡子旅馆守则</div>
    <p class="menu-sub">四周年 · 互动悬疑</p>
    <div class="menu-btns">
      <button class="btn show" id="m-new">${save&&save.stage>0?'重 新 开 始':'收 信 · 入 住'}</button>
      ${save&&save.stage>0?`<button class="btn show" id="m-cont">继续 · ${STAGE_NAMES[save.stage]}</button>`:''}
    </div>
    <p class="menu-sub" style="margin-top:22px;font-size:11px;">建议佩戴耳机 · 右上角 ♪ 开关音效 · 时长约20分钟</p>
  `;
  scene.appendChild(ui);

  return new Promise(res=>{
    const begin=(stageIdx)=>{
      let soundOn=false;
      try{ soundOn=sfx.enable(); }catch(e){}
      STATS.start=Date.now();
      if(soundOn){ $('sound-btn').style.color='#cdb27a'; $('sound-btn').style.borderColor='#cdb27a88'; }
      scene.style.transition='opacity 1.6s'; scene.style.opacity=0;
      setTimeout(()=>{ scene.remove(); res(stageIdx); },1600);
    };
    $('m-new').onclick=()=>{ clearProgress(); fragments=0; begin(0); };
    const c=$('m-cont');
    if(c) c.onclick=()=>{
      fragments=Math.max(0,save.stage-1);
      if(fragments>0) $('fragments').textContent=`记忆碎片 ${fragments} / 4`;
      CONFIG._signedName=save.name||'';
      if(Array.isArray(save.eggs)) save.eggs.forEach((v,i)=>STATS.eggs[i]=!!v);
      if(typeof save.wrong==='number') STATS.wrong=save.wrong;
      begin(save.stage);
    };
  });
}
