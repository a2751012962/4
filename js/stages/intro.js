"use strict";
/* ---------- 序章 ---------- */
async function stageIntro(){
  sfx.drone(true);
  await screenType([
    "四周年纪念日这晚，我住进了一家偷回忆的旅馆。",
    "守则一共八条。第〇条被人撕走了。",
    "退房的时候我才知道——",
    "撕走它的人，等了我四年。"
  ], "？？？", 75);

  /* 邀请函（信封） */
  setStage(`
    <div class="envelope">
      <div class="seal">栎</div>
      <div class="type-area" id="ta" style="font-size:16px;min-height:200px;text-align:left;"></div>
    </div>
    <button class="btn" id="cb">拆 开 守 则</button>
  `);
  await typeInto($('ta'),[
    "事情要从这封信说起。",
    "「恭喜您。您已被选为橡子旅馆的第 4 位住客。」",
    "我没有预订过任何旅馆。",
    `但落款的日期，是${CONFIG.anniversaryText}。`,
    "我们在一起的那一天。",
    "寄信人栏写着：",
    "「 你 最 熟 悉 的 陌 生 人 」"
  ],62);
  await waitClick($('cb'));

  /* 守则 */
  await (async ()=>{
    setStage(`
      <div class="paper">
        <h2>住 客 守 则</h2>
        <div class="rule"><b>规则一</b>旅馆只有四个房间。但走廊里有五扇门。多出来的那一扇，请不要追问是给谁准备的。</div>
        <div class="rule"><b>规则二</b>本旅馆没有员工。所有替您完成的服务，请不要追问是谁做的。</div>
        <div class="rule"><b>规则三</b>海员熊的房间永远有海浪声。如果海浪声停了，别怕——那是它在听你说话。</div>
        <div class="rule"><b>规则四</b>徒步熊每天清晨出门，傍晚回来。它的登山杖若是干的，今天没有下雨。若是湿的，也没有。</div>
        <div class="rule"><b>规则五</b>穿连体衣的熊只在熄灯后说话。它说的都是真话，<span id="r5">包括最后一句。</span></div>
        <div class="rule"><b>规则六</b>如果有一颗橡果向你眨眼，那是笃笃。如果两颗都眨，请微笑回应——它们只是太想见到你了。</div>
        <div class="rule"><b>规则七</b>如果在走廊遇到「和你长得一样的住客」，不要和她说话。她只是回来取一件落下的东西。</div>
        <div class="rule"><b>规则〇</b><span style="color:#5a523f;">（本条已被撕去。撕口的毛边，已经很旧了。）</span></div>
      </div>
      <button class="btn" id="cb">在登记簿上签名</button>
    `);
    const rules=document.querySelectorAll('.rule');
    for(const r of rules){ r.classList.add('show'); sfx.tick(); await sleep(900); }
    await sleep(800);
    const t=$('r5'); t.parentElement.classList.add('glitching'); shake();
    t.textContent="除了最后一句。";
    await sleep(1100); t.parentElement.classList.remove('glitching');
    whisper("（守则自己改了字。墨迹还没干。）");
    await sleep(1200);
    await waitClick($('cb'));
  })();

  /* 登记簿签名 */
  await (async ()=>{
    setStage(`
      <div class="paper" style="max-width:480px;">
        <h2>住 客 登 记 簿</h2>
        <div class="registry-row"><span>第1位住客</span><span style="filter:blur(4px);">？？？</span><span>三年前</span></div>
        <div class="registry-row"><span>第2位住客</span><span style="filter:blur(4px);">？？？</span><span>两年前</span></div>
        <div class="registry-row"><span>第3位住客</span><span style="filter:blur(4px);">？？？</span><span>一年前</span></div>
        <div class="registry-row hers"><span>第4位住客</span><span id="signspot">（请签名）</span><span>今天</span></div>
      </div>
      <input class="ans-input" id="ai" placeholder="写下你的名字" autocomplete="off">
      <button class="btn show" id="cb" style="margin-top:14px;">签 名</button>
      <div class="ans-feedback" id="af"></div>
    `);
    await new Promise(res=>{
      $('cb').onclick=()=>{
        const v=$('ai').value.trim()||CONFIG.herName;
        $('signspot').textContent=v; CONFIG._signedName=v;
        $('ai').style.display='none'; $('cb').style.display='none';
        shake();
        $('af').textContent="（墨迹落下的一瞬，前三行模糊的名字亮了一下。起笔的弧度——和你的一模一样。）";
        setTimeout(res,3800);
      };
    });
    await screenType([
      "签完名，大堂安静得能听见墨水变干。",
      "走廊尽头，电梯「叮」了一声，门开了。",
      "你没有按过电梯。"
    ], "走 进 去");
  })();
}
