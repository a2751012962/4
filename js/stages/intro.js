"use strict";
/* ---------- 序章 ---------- */
async function stageIntro(){
  sfx.drone(true);
  await screenType([
    "四周年纪念日这晚，",
    "我住进了一家偷走情侣回忆的旅馆。",
    "退房的时候我才知道——",
    "我已经，是第四次入住了。"
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
    "「恭喜您，成为橡子旅馆的第 4 位住客。」",
    "我没有预订过任何旅馆。",
    `但邀请函右下角的日期，是${CONFIG.anniversaryText}。`,
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
        <div class="rule"><b>规则一</b>旅馆只有四个房间。但走廊里有五扇门。请不要数第五遍。</div>
        <div class="rule"><b>规则二</b>本旅馆没有员工。</div>
        <div class="rule"><b>规则三</b>海员熊的房间永远有海浪声。如果海浪声停了，说明它在听你说话。</div>
        <div class="rule"><b>规则四</b>徒步熊每天清晨出门，傍晚回来。如果它的登山杖是干的，今天没有下雨。如果是湿的，也没有。</div>
        <div class="rule"><b>规则五</b>穿连体衣的熊只在熄灯后说话。它说的都是真话，<span id="r5">包括最后一句。</span></div>
        <div class="rule"><b>规则六</b>如果有一颗橡果向你眨眼，那是笃笃。如果两颗都眨，请微笑回应——它们只是太想见到你了。</div>
        <div class="rule"><b>规则七</b>如果在走廊遇到「和你长得一样的住客」，不要和她说话。她只是回来取一件落下的东西。</div>
        <div class="rule"><b>规则〇</b><span style="color:#5a523f;">（本条已被撕去）</span></div>
      </div>
      <button class="btn" id="cb">在登记簿上签名</button>
    `);
    const rules=document.querySelectorAll('.rule');
    for(const r of rules){ r.classList.add('show'); sfx.tick(); await sleep(900); }
    await sleep(800);
    const t=$('r5'); t.parentElement.classList.add('glitching'); shake();
    t.textContent="除了最后一句。";
    await sleep(1100); t.parentElement.classList.remove('glitching');
    whisper("（守则……刚才自己改了字？）");
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
        $('af').textContent="（墨水落下的瞬间，前三行模糊的名字，似乎亮了一下。字迹……好像和你的一模一样？）";
        setTimeout(res,3800);
      };
    });
    await screenType(["前三位住客是谁？","为什么入住日期，刚好是每年的今天？","——你决定，今晚弄清楚这一切。"], "开始 · 第一晚");
  })();
}
