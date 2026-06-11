"use strict";
/* ---------- 第一晚 · 海之房 ---------- */
async function stageNight1(){
  setNight("第一晚 · 海之房");
  await chapterCard("第 一 晚","海 之 房 · 五扇门的走廊",0);

  /* 电梯 */
  await (async ()=>{
    await screenType([
      "大堂尽头只有一部电梯。",
      "门开着，像是专门在等你。",
      "你走进去，回头看按钮——",
      "1、2、3、5、B4。",
      "没有 4 层。"
    ],"看 按 钮",58);
    setStage(`
      <div class="type-area" id="ta" style="min-height:70px;">电梯按钮在昏黄的灯下泛着旧铜色。</div>
      <div class="lift-panel">
        <button class="lift-btn" data-f="1">1</button>
        <button class="lift-btn" data-f="2">2</button>
        <button class="lift-btn" data-f="3">3</button>
        <button class="lift-btn ghost" data-f="5">5</button>
        <button class="lift-btn" data-f="B4" style="grid-column:1/3;width:100%;border-radius:32px;">B4 · 保管库</button>
      </div>
    `);
    const lines={
      "1":"按钮亮了一下，又灭了。电梯纹丝不动。",
      "2":"按钮陷下去就没有弹起来。你听见电梯井深处，有人轻轻咳嗽了一声。",
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
            $('ta').innerHTML="「5」字闪烁了几下，变成了「伍」。<br>电梯广播响了，是个很温柔的声音：<br>「该楼层不存在。请不要，再按了。」";
            whisper("（广播的声音……为什么有点耳熟？）");
          } else {
            b.classList.add('dead');
            $('ta').innerHTML=lines[f];
            if(f==="B4") whisper("笃笃：嘿嘿，这把锁，回头我们给你开！", true);
          }
          pressed++;
          if(pressed>=2 && !lifted){
            lifted=true;
            await sleep(2600);
            $('ta').innerHTML="——突然，所有按钮同时亮起。<br>电梯自己动了。<br>显示器上的数字不是楼层，是一个倒着走的年份：2026…2025…2024…";
            document.querySelectorAll('.lift-btn').forEach(x=>x.classList.add('lit'));
            sfx.thud(); await sleep(3600);
            await blackoutSay(["「叮。」","「一层到了。访客您好——欢迎回到，故事开始的地方。」"]);
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
      1:"门后是一面镜子。镜子里的走廊，只有四扇门。",
      2:"门把手是温的。像是刚刚有谁握过。但守则说——旅馆没有员工。",
      4:"门缝里飘出一张字条：「不是这扇。快回去。」字迹很着急，也很熟悉。",
      5:"第五扇门。门牌是空白的。你听见门后传来很轻很轻的、布料摩擦的声音。"
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
          $('ta').innerHTML="门把手冰凉，纹丝不动。<br>但门后传来了——海浪声。<br>这座旅馆，离海有四百公里。";
          setTimeout(()=>sfx.waves(false),3500); return;
        }
        wrong++; shake(); d.classList.add('dead');
        $('ta').innerHTML=doorLines[i];
        whisper("（有什么东西在看你……不，在守着你。）");
        if(i===5) whisper("笃笃：别数了别数了！这扇晚点再说！", true);
        if(wrong>=2 && !bearTriggered){
          bearTriggered=true;
          await sleep(2200);
          await blackoutSay(["灯，全灭了。","黑暗里，有什么毛茸茸的东西，轻轻牵住了你的手。"]);
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
            "它穿着海员服，帽徽擦得发亮。",
            "「别怕。我找这座旅馆，找了四年。」",
            "「我的帽徽会指向真的门。跟我来。」"
          ],58);
          await waitClick($('cb'));
          sfx.waves(false);
          setStage(`
            <div class="type-area" id="ta" style="min-height:80px;">海员熊的帽徽轻轻转动，最后停住——<br>指向第三扇门。门上泛起微光。</div>
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
      "走廊很长。灯一盏一盏地暗下去。",
      "规则一说，旅馆只有四个房间。",
      "可你数了数——一、二、三、四、五。",
      "……你刚才，是第几遍数？"
    ],50);
    await done;
  })();

  /* 夜海行船 */
  await screenType([
    "你推开第三扇门——",
    "门后没有房间。",
    "是一整片深夜的海。",
    "海员熊跳上一艘小木船，朝你伸出爪子。",
    "「上船。你的回忆之光，沉在这片海里。」",
    "「小心暗礁。它们是旅馆的牙齿。」"
  ],"上 船",58);
  await boatGame();
  await screenType([
    "四盏回忆之光，稳稳落进船舱。",
    "海面安静下来。海员熊收起帆，看着你。",
    "「现在，回答它们。」"
  ],"继 续",58);
  sfx.chime();
  await askInput({ question: CONFIG.nights[0].question, answers: CONFIG.nights[0].answers, hint: CONFIG.nights[0].hint });
  await memoryScene(0);

  await screenType([
    "离开房间时，你在床底发现一页撕下来的登记簿。",
    "「第1位住客 · 三年前入住 · 退房时遗失物品：一段关于『开始』的记忆。」",
    "遗失物品……是可以被旅馆收走的吗？"
  ],"继 续",55);
  await collectorNote(0);
  await screenType([
    "回房路上，你看见徒步熊正从楼梯上下来。",
    "它的登山杖，是湿的。",
    "今晚，没有下过雨。"
  ],"第 二 晚 →",65);
}
