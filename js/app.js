"use strict";
/* ---------- 启动 ---------- */
async function main(){
  const startAt=await mainMenu();
  initHud(OWNED_BY_STAGE[startAt]);
  for(let i=startAt;i<STAGES.length;i++){
    saveProgress(i);
    await STAGES[i]();
  }
}
main();
