"use strict";
/* ---------- 主菜单 ---------- */
const STAGES=[stageIntro, stageInkwash, stageNight1, stageNight2, stageNight3, stageNight4];
const STAGE_NAMES=["序章","创意环节 · 水墨流云","第一晚 · 海之房","第二晚 · 山之房","第三晚 · 夜之房","第四晚 · 保管库"];
const OWNED_BY_STAGE=[[],[],[],['sailor'],['sailor','hiker'],['sailor','hiker','onesie']];

async function mainMenu(){
  let save=loadProgress();
  /* v1旧存档写于「水墨流云」插入STAGES之前：晚间章节下标整体+1，迁移后再校验 */
  if(save && !save.v && Number.isInteger(save.stage) && save.stage>=1) save.stage+=1;
  /* 损坏/越界的存档一律当没有：否则「继续 · undefined」点下去是永久黑屏 */
  if(!(save && Number.isInteger(save.stage) && save.stage>=1 && save.stage<STAGES.length)) save=null;
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
    let started=false;
    const begin=(stageIdx)=>{
      if(started) return; started=true;
      ui.style.pointerEvents='none';   /* 淡出期间锁菜单：晚到的第二次点击会清档/重置碎片 */
      let soundOn=false;
      try{ soundOn=sfx.enable(); }catch(e){}
      STATS.start=Date.now();
      setSoundUI(soundOn);
      scene.style.transition='opacity 1.6s'; scene.style.opacity=0;
      setTimeout(()=>{ scene.remove(); res(stageIdx); },1600);
    };
    $('m-new').onclick=()=>{ clearProgress(); setFragments(0); begin(0); };
    const c=$('m-cont');
    if(c) c.onclick=()=>{
      setFragments(Number.isInteger(save.fragments)?save.fragments:Math.max(0,save.stage-2));   /* night1=下标2起，每过一晚+1枚碎片 */
      CONFIG._signedName=save.name||'';
      if(Array.isArray(save.eggs)) save.eggs.forEach((v,i)=>STATS.eggs[i]=!!v);
      if(typeof save.wrong==='number') STATS.wrong=save.wrong;
      begin(save.stage);
    };
  });
}
