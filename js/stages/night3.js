"use strict";
/* ---------- 第三晚 · 夜之房 ---------- */
async function stageNight3(){
  setNight("第三晚 · 夜之房");
  await chapterCard("第 三 晚","夜 之 房 · 熄灯后的真话",2);

  await (async ()=>{
    await screenType([
      "第三晚，整层楼的灯都熄了。",
      "黑暗里，有个软软的东西爬上你的床头。",
      "「嘘——别开灯。」",
      "「我只在熄灯后说话。守则说，我说的都是真话，除了最后一句。」"
    ],"听 它 说",60);
    setStage(`
      <div class="toy-svg">${ART.bear('onesie')}</div>
      <div class="item-toast">获得同伴 · 连体衣熊「翻译低语的耳朵」</div>
      <div class="type-area" id="ta" style="margin-top:20px;min-height:60px;"></div>
      <button class="btn" id="cb">举 起 手 电</button>
    `);
    gainCompanion('onesie');
    await typeInto($('ta'),[
      "「今晚，旅馆把五句低语藏进了黑暗里。」",
      "「四句是真话。一句是假话。」",
      "「先用光把它们全部找出来——在光熄灭之前。」"
    ],52);
    await waitClick($('cb'));
    await flashlightGame();

    setStage(`
      <div class="type-area" id="ta" style="min-height:60px;"></div>
      <div id="paths"></div>
    `);
    await typeInto($('ta'),["五句低语都被照亮了。","连体衣熊贴着你的耳朵：「现在——哪一句，是假话？」"],52);
    const box=$('paths');
    let resolve; const done=new Promise(r=>resolve=r);
    CONFIG.whispers.forEach((w,i)=>{
      const b=document.createElement('button'); b.className='path-btn'; b.textContent=(i+1)+"． "+w;
      b.onclick=async ()=>{
        if(i===CONFIG.whisperLieIndex){
          sfx.chime(); burstCenter();
          box.innerHTML='';
          $('ta').innerHTML="连体衣熊点了点头。<br>「对。这是唯一的假话。」<br>「他从来没有忘过。一天都没有。」<br>「——剩下那四句，每一句，你可以慢慢找他求证。」";
          await sleep(6000); resolve();
        } else {
          shake(); b.classList.add('lie');
          $('ta').innerHTML="「这句是真的。」连体衣熊轻轻说。<br>（它顿了顿）「……真话有时候也很吓人，对吧。」";
          whisper("笃笃：呜哇，这句居然是真的！", true);
        }
      };
      box.appendChild(b);
    });
    await done;
  })();

  /* 八音盒调音 */
  await (async ()=>{
    await screenType([
      "墙壁深处，传来一段八音盒的声音。",
      "是那首歌。但它走调了——和广播里一样。",
      "连体衣熊把爪子贴在墙上：",
      "「这是旅馆的心跳。它已经走调很久了。」",
      "「帮它调回来。它会告诉你一个秘密。」"
    ],"打 开 墙 板",58);
    const NOTES=[262,294,330,392,440];
    const NAMES=["do","re","mi","sol","la"];
    const target=[2,4,3,1];
    const cur=[0,0,0,0];
    setStage(`
      <div class="type-area" id="ta" style="min-height:60px;">墙板后是一台小小的八音盒，四枚音齿被人掰歪了。<br>点击音齿调整音高，让它和原曲一致。</div>
      <div class="mbox" id="mbox"></div>
      <div class="mbox-ctrl">
        <button class="btn show" id="mb-orig" style="margin-top:14px;">听 原 曲</button>
        <button class="btn show" id="mb-play" style="margin-top:14px;">转 动 发 条</button>
      </div>
      <div class="ans-feedback" id="af"></div>
    `);
    const box=$('mbox');
    cur.forEach((c,i)=>{
      const d=document.createElement('div'); d.className='mbox-slot';
      d.innerHTML=`<span>♪</span><span class="pitch">${NAMES[c]}</span>`;
      d.onclick=()=>{ cur[i]=(cur[i]+1)%NOTES.length;
        d.querySelector('.pitch').textContent=NAMES[cur[i]];
        sfx.note(NOTES[cur[i]],.4); };
      box.appendChild(d);
    });
    const playSeq=async seq=>{ for(const n of seq){ sfx.note(NOTES[n],.55); await sleep(560);} };
    let fails=0;
    const muteHint=()=>{ if(!sfx.isOn()){
      $('af').className='ans-feedback';
      $('af').textContent="（一点声音都没有……右上角的 ♪ 可以打开音效。）";
      return true; } return false; };
    await new Promise(res=>{
      $('mb-orig').onclick=()=>{ if(muteHint()) return; playSeq(target); };
      $('mb-play').onclick=async ()=>{
        muteHint();
        await playSeq(cur);
        if(cur.every((c,i)=>c===target[i])){
          document.querySelectorAll('.mbox-slot').forEach(x=>x.classList.add('good'));
          sfx.chime(); burstCenter();
          $('af').textContent="八音盒重新唱了起来。整面墙都松了一口气。";
          await sleep(2200); res();
        } else {
          fails++; STATS.wrong++; shake();
          $('af').className='ans-feedback bad';
          $('af').textContent= fails>=3
            ? "（提示：原曲是「mi → la → sol → re」。）"
            : "还是不对。墙里传来一声叹息，像是它自己也很着急。";
        }
      };
    });
    await screenType([
      "调准的一瞬间，八音盒里弹出一张卷起来的小纸条：",
      "「曲子是它守的。歌词是他改的。」",
      "「他改了七遍。第一遍在四年前，最后一遍在昨天。」"
    ],"收 好",58);
  })();

  await askInput({ question: CONFIG.nights[2].question, answers: CONFIG.nights[2].answers, hint: CONFIG.nights[2].hint });
  await memoryScene(2);

  await screenType([
    "天快亮的时候，你在枕头下面摸到第三页登记簿。",
    "「第3位住客 · 一年前入住 · 遗失物品：一段关于『难关』的记忆。」",
    "这一页的背面有退房留言，笔迹是你的：",
    "「明年的我，还会回来吗？」"
  ],"继 续",55);
  await collectorNote(2);
  await screenType([
    "你把三页登记簿拼在一起。",
    "三位住客。三年。三段被「收走」的记忆。",
    "入住日期都是同一天——你们的纪念日。",
    "笔迹都是同一个人的——你的。",
    "明天就是第四晚。",
    "保管库，该去看看了。"
  ],"最 终 晚 →",62);
}
