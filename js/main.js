/* ================= 主流程 ================= */
async function main(){

  /* ---- 标题 ---- */
  setStage(`
    <h1>橡子旅馆守则</h1>
    <p class="sub">—— 四周年 · 互动悬疑 ——</p>
    <button class="btn show" id="cb">收 信</button>
    <p class="sub" style="font-size:12px;margin-top:26px;">建议佩戴耳机 · 点击右上角 ♪ 开启音效<br>时长约 20 分钟</p>
  `);
  await new Promise(r=>{ $('cb').onclick=()=>{ sfx.enable();
    $('sound-btn').style.color='#cdb27a'; $('sound-btn').style.borderColor='#cdb27a88'; r(); }; });

  /* ---- 炸裂冷开场 ---- */
  sfx.drone(true);
  await screenType([
    "四周年纪念日这晚，",
    "我住进了一家偷走情侣回忆的旅馆。",
    "退房的时候我才知道——",
    "我已经，是第四次入住了。"
  ], "？？？", 75);

  /* ---- 邀请函 ---- */
  await screenType([
    "事情要从这封信说起。",
    "「恭喜您，成为橡子旅馆的第 4 位住客。」",
    "我没有预订过任何旅馆。",
    `但邀请函右下角的日期，是${CONFIG.anniversaryText}。`,
    "我们在一起的那一天。",
    "寄信人栏写着：",
    "「 你 最 熟 悉 的 陌 生 人 」"
  ], "拆 开 守 则");

  /* ---- 守则 ---- */
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
    const t=$('r5'); t.parentElement.parentElement.classList.add('glitching'); shake();
    t.textContent="除了最后一句。";
    await sleep(1100); t.parentElement.parentElement.classList.remove('glitching');
    whisper("（守则……刚才自己改了字？）");
    await sleep(1200);
    await waitClick($('cb'));
  })();

  /* ---- 登记簿签名 ---- */
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

  /* ============ 第一晚 · 海之房 ============ */
  setNight("第一晚 · 海之房");
  await chapterCard("第 一 晚","海 之 房 · 五扇门的走廊");

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
    let wrong=0, hasBear=false, resolve;
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
        if(wrong>=2 && !hasBear){
          await sleep(2200);
          await blackoutSay(["灯，全灭了。","黑暗里，有什么毛茸茸的东西，轻轻牵住了你的手。"]);
          hasBear=true;
          setStage(`
            <div class="toy">🧸</div>
            <div class="item-toast">获得同伴道具 · 海员熊「罗盘」</div>
            <div class="type-area" id="bt" style="margin-top:24px;"></div>
            <button class="btn" id="cb">跟 它 走</button>
          `);
          sfx.waves(true); sfx.chime();
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
          const b2=$('doors-box2'); b2.className=''; b2.id='doors-box2'; b2.style.cssText="display:flex;gap:clamp(8px,2vw,22px);margin-top:36px;";
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

  /* 第一晚 · 夜海行船 */
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

  /* 登记簿残页1 */
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

  /* ============ 第二晚 · 山之房 ============ */
  setNight("第二晚 · 山之房");
  await chapterCard("第 二 晚","山 之 房 · 会说谎的灯");

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
    opts.forEach((o,i)=>{
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
              <div class="toy">🧸</div>
              <div class="item-toast">获得同伴道具 · 徒步熊「不说谎的灯」</div>
              <div class="type-area" id="bt" style="margin-top:24px;"></div>
              <button class="btn" id="cb">举 起 灯</button>
            `);
            sfx.chime();
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

  /* 第二晚 · 雾墙追逐 */
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
  /* 红色警报事件 */
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

  /* ============ 第三晚 · 夜之房 ============ */
  setNight("第三晚 · 夜之房");
  await chapterCard("第 三 晚","夜 之 房 · 熄灯后的真话");

  await (async ()=>{
    await screenType([
      "第三晚，整层楼的灯都熄了。",
      "黑暗里，有个软软的东西爬上你的床头。",
      "「嘘——别开灯。」",
      "「我只在熄灯后说话。守则说，我说的都是真话，除了最后一句。」"
    ],"听 它 说",60);
    setStage(`
      <div class="toy">🧸</div>
      <div class="item-toast">同伴道具 · 连体衣熊「翻译低语的耳朵」</div>
      <div class="type-area" id="ta" style="margin-top:20px;min-height:60px;"></div>
      <button class="btn" id="cb">举 起 手 电</button>
    `);
    await typeInto($('ta'),[
      "「今晚，旅馆把五句低语藏进了黑暗里。」",
      "「四句是真话。一句是假话。」",
      "「先用光把它们全部找出来——在光熄灭之前。」"
    ],52);
    await waitClick($('cb'));
    await flashlightGame();
    /* 找齐后：辨别假话 */
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

  /* ============ 第四晚 · 保管库 ============ */
  setNight("第四晚 · 保管库");
  await chapterCard("第 四 晚","记 忆 保 管 库");

  await (async ()=>{
    await screenType([
      "走廊尽头，第五扇门自己开了。",
      "门后不是房间，是一段向下的楼梯。",
      "两颗圆滚滚的橡果从扶手上滚下来，稳稳落在你的肩膀上。",
      "「嘿嘿，终于等到这天了！」「我们是钥匙！两把！」",
      "话音未落——头顶传来一声巨响。",
      "回收程序，开始拆这条走廊了。"
    ],"跑 ！",60);
    await hallGame();
    await screenType([
      "最后一块地板在你脚后跟塌下去的瞬间，",
      "你扑进了保管库的门廊。",
      "身后的走廊已经不存在了。",
      "但门廊里安安静静，亮着暖黄的灯。",
      "笃笃和突突从你口袋里探出头：「到了。」"
    ],"走到门前",60);
    setStage(`
      <div class="toy" style="font-size:clamp(46px,9vw,72px);">🌰🌰</div>
      <div class="item-toast">获得同伴道具 · 笃笃与突突「成对的钥匙」</div>
      <div class="type-area" id="ta" style="margin-top:20px;"></div>
      <button class="btn" id="cb">走到门前</button>
    `);
    await typeInto($('ta'),[
      "保管库的门是橡木做的，上面刻着一整棵橡树。",
      "树根处有两个小小的锁孔。",
      "笃笃和突突各自跳了进去——咔哒、咔哒。",
      "但门没有开。门上浮现出最后一道题。"
    ],55);
    await waitClick($('cb'));
  })();

  await askInput({ question: CONFIG.finalQuestion, answers: CONFIG.finalAnswers, hint: CONFIG.finalHint });

  /* ---- 终极反转 ---- */
  await (async ()=>{
    await screenType([
      "门，开了。",
      "保管库里没有怪物。",
      "只有一面墙——",
      "贴满了这四年，按日期排好的，关于你们的一切。"
    ],"走 近 看",65);

    setStage(`
      <p class="sub" style="margin-bottom:18px;">墙的正中央，钉着三张「前住客」的退房留言。</p>
      <div class="note-paper" style="margin-bottom:14px;">${CONFIG.pastMessages[0]}</div>
      <div class="note-paper" style="transform:rotate(.6deg);margin-bottom:14px;">${CONFIG.pastMessages[1]}</div>
      <div class="note-paper" style="transform:rotate(-.4deg);">${CONFIG.pastMessages[2]}</div>
      <button class="btn" id="cb">所以，前三位住客是——</button>
    `);
    sfx.chime();
    await waitClick($('cb'));

    await screenType([
      "前三位住客，都是你。",
      "一周年的你。两周年的你。三周年的你。",
      "每年的今天，旅馆都会「邀请」你来存放一年的回忆。",
      "你从来没有弄丢过它们。",
      "它们只是被人，一年一年，仔细地收藏了起来。",
      "而那三张留言——不是你写的。",
      "是「收藏家」，替每一年的你，记下的。"
    ],"那收藏家是谁？",70);
  })();

  /* ---- 终章 beats ---- */
  await (async ()=>{
    sfx.drone(false);
    const beats=[
      {t:"「现在可以告诉你了。」",c:"gold"},
      {t:"「走廊的第五扇门，是我多盖的。我总想给你多留一个出口。」",c:""},
      {t:"「广播里的歌词不对，因为那是我改写给你的版本。改了七遍。」",c:""},
      {t:"「徒步熊的登山杖是湿的——它每晚替我出门，去给三年前淋雨的我们，补送一把伞。」",c:""},
      {t:"「雾里那个和你一样的人，是去年的你。她只是回来，多看了我们一眼。」",c:""},
      {t:"「守则说旅馆没有员工。是真的。这里只有一个守了四年的人。」",c:""},
      {t:"「橡子旅馆建于四年前的今天。那天，你还不认识我。」",c:"gold"},
      {t:"「但施工，已经开始了。」",c:"gold"},
      {t:"「道具栏已清空。」",c:""},
      {t:"「因为它们从来不是道具。」",c:""},
      {t:"「海员熊找了你四年。徒步熊陪你走了四年。连体衣熊听了你四年。」",c:""},
      {t:"「笃笃和突突——是我们还没说出口的，以后。」",c:"gold"},
      {t:"被撕去的规则〇，正在浮现——",c:""}
    ];
    setStage(`<div id="fl" style="max-width:660px;"></div><div class="tap-hint" id="th">轻 触 继 续</div>`);
    const fl=$('fl');
    let i=0, busy=false;
    await new Promise(res=>{
      const next=async ()=>{
        if(busy) return;
        if(i>=beats.length){ stage.onclick=null; res(); return; }
        busy=true;
        const b=beats[i++];
        if(fl.children.length>=4 || b.c==='gold') {} // 保留滚动叠加
        const d=document.createElement('div');
        d.className='finale-line '+b.c; d.textContent=b.t;
        if(fl.children.length>=4) fl.innerHTML='';
        fl.appendChild(d);
        await sleep(60); d.classList.add('show');
        b.c==='gold' ? sfx.chime() : sfx.tick();
        await sleep(700); busy=false;
      };
      stage.onclick=next; next();
    });

    /* 规则〇 藏头 */
    setStage(`
      <div class="paper" style="max-width:520px;">
        <h2>规 则 〇</h2>
        <div id="rz"></div>
      </div>
      <button class="btn" id="cb">读 出 藏 头</button>
    `);
    const rz=$('rz');
    for(const line of CONFIG.ruleZero){
      const d=document.createElement('div'); d.className='rule';
      d.innerHTML = `<b>${line[0]}</b>${line.slice(1)}`;
      rz.appendChild(d); await sleep(150); d.classList.add('show'); sfx.tick();
      await sleep(900);
    }
    await waitClick($('cb'));
    const heads=CONFIG.ruleZero.map(l=>l[0]).join(" ");
    setStage(`
      <div class="finale-line huge show" style="letter-spacing:.2em;">${heads}</div>
      <button class="btn" id="cb">最 后 一 条 守 则</button>
    `);
    sfx.chime();
    await waitClick($('cb'));

    /* 永久房卡 */
    setStage(`
      <p class="sub" style="margin-bottom:8px;">「第四次入住的住客，将获得——」</p>
      <div class="room-card">
        <div class="l1">${CONFIG.cardLines[0]}</div>
        <div class="ln">${CONFIG.cardLines[1]}</div>
        <div class="ln">${CONFIG.cardLines[2]}</div>
        <div class="ln">${CONFIG.cardLines[3]}${CONFIG._signedName||CONFIG.herName}</div>
      </div>
      <button class="btn" id="cb">收 下</button>
    `);
    sfx.chime();
    await waitClick($('cb'));

    /* 转身 */
    setStage(`<div class="finale-line huge show">${CONFIG.finalInstruction}</div>
      <p class="sub" id="fs" style="opacity:0;transition:opacity 2.5s;">${CONFIG.finalSub}</p>`);
    sfx.chime();
    await sleep(2000); $('fs').style.opacity=1;
    await sleep(4000);
    setStage(`
      <h1 style="font-size:24px;letter-spacing:.3em;">四 周 年 快 乐</h1>
      <p class="sub" style="margin-top:26px;">橡子旅馆 · 永不歇业<br>下次入住时间：五周年的今天</p>
      <button class="btn show" onclick="location.reload()" style="margin-top:40px;">重 新 入 住</button>
    `);
  })();
}

main();
