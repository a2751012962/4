"use strict";
/* ---------- 第一晚 · 海之房 ---------- */
async function stageNight1(){
  setNight("第一晚 · 海之房");
  await chapterCard("第 一 晚","海 之 房 · 五扇门的走廊",0);

  /* 电梯 */
  await (async ()=>{
    await screenType([
      "电梯里很干净，地毯上还留着吸尘器走过的纹路。",
      "守则二说，本旅馆没有员工。",
      "你回头看按钮——",
      "1、2、3、5、B4。",
      "没有 4 层。"
    ],"看 按 钮",58);
    setStage(`
      <div class="type-area" id="ta" style="min-height:70px;">按钮泛着旧铜色。只有「5」的漆是新的，像后来才装上去的。</div>
      <div class="lift-panel">
        <button class="lift-btn" data-f="1">1</button>
        <button class="lift-btn" data-f="2">2</button>
        <button class="lift-btn" data-f="3">3</button>
        <button class="lift-btn ghost" data-f="5">5</button>
        <button class="lift-btn" data-f="B4" style="grid-column:1/3;width:100%;border-radius:32px;">B4 · 保管库</button>
      </div>
    `);
    const lines={
      "1":"按钮亮了一下，又灭了。身后的大堂里，登记簿哗啦翻过了一页。",
      "2":"按钮陷下去，没有弹起来。电梯井深处，有谁极轻地咳了一声。",
      "3":"灯闪了闪。楼层显示器上跳出一个字：「早」。现在是深夜。",
      "B4":"按钮是锁着的。锁孔的形状——像两颗并排的橡子。"
    };
    let pressed=0, lifted=false;
    await new Promise(res=>{
      document.querySelectorAll('.lift-btn').forEach(b=>{
        b.onclick=async ()=>{
          if(lifted) return;
          const f=b.dataset.f;
          if(f==="5"){
            shake(); screenTear(); b.classList.add('dead');
            $('ta').innerHTML="「5」字闪了几下，变成了「伍」。<br>电梯广播响了，是个很温柔的声音：<br>「该楼层暂未对您开放。请不要，再按了。」";
            whisper("（这个声音……你在哪里听过？）");
          } else {
            b.classList.add('dead');
            $('ta').innerHTML=lines[f];
            if(f==="B4") whisper("笃笃：嘿嘿，这把锁！回头我们俩给你开！", true);
          }
          pressed++;
          if(pressed>=2 && !lifted){
            lifted=true;
            await sleep(2600);
            $('ta').innerHTML="——所有按钮同时亮起。<br>电梯自己动了。<br>显示器上的数字不是楼层，是一个倒着走的年份：2026…2025…2024…";
            document.querySelectorAll('.lift-btn').forEach(x=>x.classList.add('lit'));
            sfx.thud(); await sleep(3600);
            await blackoutSay(["「叮。为您停靠——第 一 晚。」","「祝您，找回愉快。」"]);
            res();
          }
        };
      });
    });
  })();

  /* 五扇门 */
  await (async ()=>{
    setStage(`
      <div class="type-area" id="ta" style="min-height:80px;"></div>
      <div id="doors-box"></div>
    `);
    const doorLines={
      1:"门后是一面镜子。镜子里的走廊——只有四扇门。",
      2:"门把手是温的。像是有谁，刚刚替你握过。守则说，本旅馆没有员工。",
      4:"门缝里塞出一张字条：「不是这扇。回去。」字迹很急。急得有点眼熟。",
      5:"第五扇门。门牌是空白的。门后有很轻很轻的声音——一根线，正穿过一块布。"
    };
    const box=$('doors-box');
    let wrong=0, hasBear=false, bearTriggered=false, resolve;
    const done=new Promise(r=>resolve=r);
    for(let i=1;i<=5;i++){
      const d=document.createElement('div'); d.className='door';
      d.textContent=['壹','贰','叁','肆','伍'][i-1];
      d.onclick=async ()=>{
        if(i===3){
          if(hasBear){ resolve(); return; }
          sfx.waves(true);
          $('ta').innerHTML="门把手冰凉，纹丝不动。<br>门后传来了海浪声。<br>这座旅馆，离最近的海，有四百公里。";
          setTimeout(()=>sfx.waves(false),3500); return;
        }
        wrong++; shake(); d.classList.add('dead');
        $('ta').innerHTML=doorLines[i];
        whisper("（有什么东西在看你……不，在替你着急。）");
        if(i===5) whisper("笃笃：别问别问！这扇门要最后才开！", true);
        if(wrong>=2 && !bearTriggered){
          bearTriggered=true;
          await sleep(2200);
          await blackoutSay(["灯，全灭了。","黑暗里，一只毛茸茸的爪子牵住了你——掌心带着旧绳茧。"]);
          hasBear=true;
          setStage(`
            <div class="toy-svg">${ART.bear('sailor')}</div>
            <div class="item-toast">获得同伴 · 海员熊「罗盘」</div>
            <div class="type-area" id="bt" style="margin-top:24px;"></div>
            <button class="btn" id="cb">跟 它 走</button>
          `);
          gainCompanion('sailor');
          sfx.waves(true);
          await typeInto($('bt'),[
            "它穿着海员服。开口之前，先擦了一下帽徽。",
            "「别怕。风大而已。」",
            "「这片海我找了四年。今晚，到你了。」",
            "「帽徽指真门。跟我走。」"
          ],58);
          await waitClick($('cb'));
          sfx.waves(false);
          setStage(`
            <div class="type-area" id="ta" style="min-height:80px;">帽徽转了半圈，停住——<br>第三扇门。门缝里透出潮湿的光。</div>
            <div id="doors-box2"></div>
          `);
          const b2=$('doors-box2'); b2.style.cssText="display:flex;gap:clamp(8px,2vw,22px);margin-top:36px;";
          for(let k=1;k<=5;k++){
            const dd=document.createElement('div'); dd.className='door'+(k===3?' beacon':' dead');
            dd.textContent=['壹','贰','叁','肆','伍'][k-1];
            if(k===3) dd.onclick=()=>resolve();
            b2.appendChild(dd);
          }
        }
      };
      box.appendChild(d);
    }
    await typeInto($('ta'),[
      "走廊很长。灯一盏一盏地暗下去，像在给你让路。",
      "守则一说，旅馆只有四个房间。",
      "你数了数门——一、二、三、四、五。",
      "……你是从哪一头开始数的？"
    ],50);
    await done;
  })();

  /* 夜海行船 */
  await screenType([
    "你推开第三扇门——",
    "门后没有房间。",
    "是一整片深夜的海。",
    "海员熊跳上一艘小木船，朝你伸出爪子。",
    "「上船。你的回忆之光，沉在这儿。四盏。」",
    "「小心暗礁。那是旅馆的牙——它护食。」"
  ],"上 船",58);
  await boatGame();
  sfx.waves(true);
  await screenType([
    "四盏光稳稳落进船舱，海面一下子平了。",
    "海员熊收了帆，又擦了一下帽徽。",
    "「现在，回答它们。」"
  ],"继 续",58);
  sfx.waves(false);
  await screenType([
    "——海浪声，停了。",
    "守则三：那是它在听你说话。",
    "整座旅馆，在等你的答案。"
  ],"回 答",62);
  sfx.chime();
  await askInput({ question: CONFIG.nights[0].question, answers: CONFIG.nights[0].answers, hint: CONFIG.nights[0].hint });
  await memoryScene(0);

  await screenType([
    "离开房间时，你发现床底压着一页撕下来的登记簿。",
    "「第1位住客 · 三年前入住 · 退房时遗失：一段关于『开始』的记忆。」",
    "页脚有一行备注，字很小：",
    "「已妥善保管。」"
  ],"继 续",55);
  await collectorNote(0);
  await screenType([
    "回房的路上，你迎面遇见徒步熊。",
    "它挨着墙根走，登山杖拄得很轻，像是怕吵醒谁。",
    "杖尖在地毯上，洇出一小片深色的湿痕。",
    "今晚，没有下过雨。"
  ],"第 二 晚 →",65);
}
