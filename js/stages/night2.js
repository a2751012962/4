"use strict";
/* ---------- 第二晚 · 山之房 ---------- */
async function stageNight2(){
  setNight("第二晚 · 山之房");
  await chapterCard("第 二 晚","山 之 房 · 会说谎的灯",1);

  await (async ()=>{
    setStage(`
      <div class="type-area" id="ta" style="min-height:80px;"></div>
      <div id="paths"></div>
    `);
    await typeInto($('ta'),[
      "二层是一座室内的「山」。雾从地毯里漫上来。",
      "三条路，路口各挂着一盏灯，灯下各有一句话。",
      "守则没说过——灯，会不会说谎。"
    ],50);
    const opts=[
      {t:"左边的灯：「走我这边，最快到山顶。」（灯光惨白，亮得刺眼）",ok:false,
       r:"走了很久，又回到原地。灯在你身后轻轻笑了一声。"},
      {t:"中间的灯：「那两边都是假的，只有我是真的。」（灯光闪烁不定）",ok:false,
       r:"路越走越窄，墙上的影子越来越多——影子里没有你。"},
      {t:"右边的灯：「我这条路很远，很慢，会绕一些弯。」（灯光昏黄微弱）",ok:true,
       r:"愿意承认自己慢的，往往才是真的。雾散开了一线。"}
    ];
    const box=$('paths');
    let resolve; const done=new Promise(r=>resolve=r);
    let wrongOnce=false;
    opts.forEach((o)=>{
      const b=document.createElement('button'); b.className='path-btn'; b.textContent=o.t;
      b.onclick=async ()=>{
        if(o.ok){
          $('ta').innerHTML=o.r; sfx.chime(); await sleep(2400); resolve();
        } else {
          shake(); b.classList.add('lie'); $('ta').innerHTML=o.r;
          whisper("突突：这盏灯鼻子都说长了！", true);
          if(!wrongOnce){
            wrongOnce=true; await sleep(2200);
            await blackoutSay(["雾，涌了上来。","一只系着登山扣的爪子，把你往后拉了一把。"]);
            setStage(`
              <div class="toy-svg">${ART.bear('hiker')}</div>
              <div class="item-toast">获得同伴 · 徒步熊「不说谎的灯」</div>
              <div class="type-area" id="bt" style="margin-top:24px;"></div>
              <button class="btn" id="cb">举 起 灯</button>
            `);
            gainCompanion('hiker');
            await typeInto($('bt'),[
              "「这座旅馆里，只有我的灯不说谎。」",
              "「我走过外面所有的路，才学会分辨哪句是真的。」",
              "「记住——说自己又远又慢的那条路，再选一次。」"
            ],58);
            await waitClick($('cb'));
            setStage(`<div class="type-area" id="ta" style="min-height:80px;">暖黄的灯光下，三句话现出了原形。</div><div id="paths2"></div>`);
            const b2=$('paths2');
            opts.forEach(o2=>{
              const bb=document.createElement('button'); bb.className='path-btn'+(o2.ok?'':' lie'); bb.textContent=o2.t;
              if(o2.ok) bb.onclick=async ()=>{ $('ta').innerHTML=o2.r; sfx.chime(); await sleep(2200); resolve(); };
              b2.appendChild(bb);
            });
          }
        }
      };
      box.appendChild(b);
    });
    await done;
  })();

  /* 雾墙追逐 */
  await screenType([
    "雾散开的一瞬间，你听见身后传来低低的轰鸣。",
    "不是风。",
    "是那团红雾——它把来时的路，一寸一寸地吃掉了。",
    "徒步熊把灯别在胸前，抓住你的手腕：",
    "「别看后面。跟我跑。」"
  ],"开 始 攀 登",58);
  await climbGame();
  await screenType([
    "山顶。雾停在了山腰，像被一条看不见的线拦住。",
    "徒步熊喘着气，把灯举起来照你——",
    "「现在，趁它没缓过来。回答。」"
  ],"继 续",58);
  await askInput({ question: CONFIG.nights[1].question, answers: CONFIG.nights[1].answers, hint: CONFIG.nights[1].hint });
  await memoryScene(1);

  /* 分身事件 */
  await (async ()=>{
    await screenType([
      "下山的走廊上，雾还没有散。",
      "雾的那头，走来一个人。",
      "她穿着和你一样的衣服，留着和你一样的头发。",
      "——是「和你长得一样的住客」。",
      "规则七说：不要和她说话。"
    ],"她走近了……",62);
    setStage(`<div class="type-area" id="ta" style="min-height:60px;">她在你面前停下了。手里攥着一张和你一样的房卡。</div><div id="paths"></div>`);
    const box=$('paths');
    const choices=[
      {t:"遵守规则七：低下头，不说话，擦肩而过。",
       r:"擦肩的瞬间，你听见她极轻地说了一句：「替我……多看他一眼。」<br>等你回头，雾里已经没有人了。"},
      {t:"打破规则：开口问她——「你是谁？」",
       r:"她没有回答。只是笑了笑，那个笑你很熟悉——你拍照时就这么笑。<br>她把房卡塞进你手里，转身走进雾中。房卡背面写着：去年的今天。"},
      {t:"对她微笑（像守则六说的那样）。",
       r:"她愣了一下，然后也对你微笑。两个一模一样的笑。<br>她路过你时，你闻到她身上的味道——是你三年前用的那瓶香水。"}
    ];
    await new Promise(res=>{
      choices.forEach(c=>{
        const b=document.createElement('button'); b.className='path-btn'; b.textContent=c.t;
        b.onclick=async ()=>{
          box.innerHTML=''; shake();
          $('ta').innerHTML=c.r;
          whisper("（她不是来吓你的。她好像……只是舍不得。）");
          await sleep(5200); res();
        };
        box.appendChild(b);
      });
    });
  })();

  await screenType([
    "你在二层楼梯口又捡到一页登记簿。",
    "「第2位住客 · 两年前入住 · 遗失物品：一段关于『同行』的记忆。」",
    "下面多了一行小字，墨迹很新：",
    "「她今晚回来取过了。」"
  ],"继 续",55);
  await collectorNote(1);

  /* 红色警报 */
  await (async ()=>{
    redAlert(true); heartbeat(true,115); shake(); screenTear();
    setStage(`
      <div class="chapter" style="color:#c0584a;">${glitchHTML("⚠ 旅馆广播 ⚠",true)}</div>
      <div class="type-area" id="ta" style="margin-top:24px;"></div>
      <button class="btn" id="cb">广播结束了</button>
    `);
    await typeInto($('ta'),[
      "「检测到：未授权住客正在找回回忆。」",
      "「记忆回收程序，已启动。」",
      "「倒计时：两晚。」",
      "——然后广播突然换了内容。放起你最喜欢的那首歌。",
      "可是歌词不对。每一句的最后一个字，都被换掉了。",
      "你来不及细听，整层楼的灯，啪地熄灭了。"
    ],58);
    redAlert(false); heartbeat(false);
    await waitClick($('cb'));
  })();
}
