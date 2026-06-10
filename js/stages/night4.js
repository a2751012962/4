"use strict";
/* ---------- 第四晚 · 保管库 ---------- */
async function stageNight4(){
  setNight("第四晚 · 保管库");
  await chapterCard("第 四 晚","记 忆 保 管 库",3);

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
      <div class="toy-svg small">${ART.acorns()}</div>
      <div class="item-toast">获得同伴 · 笃笃与突突「成对的钥匙」</div>
      <div class="type-area" id="ta" style="margin-top:20px;"></div>
      <button class="btn" id="cb">走到门前</button>
    `);
    gainCompanion('acorns');
    await typeInto($('ta'),[
      "保管库的门是橡木做的，上面刻着一整棵橡树。",
      "树根处有两个小小的锁孔。",
      "笃笃和突突各自跳了进去——咔哒、咔哒。",
      "但门没有开。门上浮现出最后一道题。"
    ],55);
    await waitClick($('cb'));
  })();

  await askInput({ question: CONFIG.finalQuestion, answers: CONFIG.finalAnswers, hint: CONFIG.finalHint });

  /* 终极反转 */
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

  /* 终章 */
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
    sfx.chime(); burstCenter();
    await waitClick($('cb'));

    /* 转身 */
    setStage(`<div class="finale-line huge show">${CONFIG.finalInstruction}</div>
      <p class="sub" id="fs" style="opacity:0;transition:opacity 2.5s;">${CONFIG.finalSub}</p>`);
    sfx.chime();
    await sleep(2000); $('fs').style.opacity=1;
    await sleep(4000);

    /* 隐藏结局：收藏家的日记 */
    if(eggCount()>=4){
      await screenType([
        "等等——你口袋里的四颗小橡子，突然热了起来。",
        "它们拼在一起，变成了一把很小很小的钥匙。",
        "墙角，浮现出一个上锁的抽屉。"
      ],"打 开 抽 屉",60);
      setStage(`
        <p class="sub" style="margin-bottom:18px;">隐 藏 结 局 · 收 藏 家 的 日 记</p>
        ${CONFIG.hiddenDiary.map((d,i)=>`<div class="note-paper" style="margin-bottom:12px;transform:rotate(${(i%2?1:-1)*.7}deg);">${d}</div>`).join("")}
        <button class="btn" id="cb">合 上 日 记</button>
      `);
      sfx.chime(); burstCenter();
      await waitClick($('cb'));
    }

    /* 入住报告 */
    const mins=Math.max(1,Math.round((Date.now()-STATS.start)/60000));
    const eggs=eggCount();
    const title = STATS.wrong===0 ? "旅馆都被你看穿了"
      : STATS.wrong<=3 ? "优秀住客 · 下次免押金"
      : "迷路也很可爱奖";
    setStage(`
      <div class="report">
        <h2>入 住 报 告</h2>
        <div class="report-row"><span>住客</span><b>${CONFIG._signedName||CONFIG.herName}</b></div>
        <div class="report-row"><span>入住时长</span><b>${mins} 分钟</b></div>
        <div class="report-row"><span>记忆碎片</span><b>4 / 4</b></div>
        <div class="report-row"><span>答错次数</span><b>${STATS.wrong} 次</b></div>
        <div class="report-row"><span>小橡子彩蛋</span><b>${eggs} / 4${eggs>=4?" · 已解锁隐藏日记":""}</b></div>
        <div class="report-row"><span>获得称号</span><b>${title}</b></div>
        <div class="stamp">永久<br>住客</div>
      </div>
      <button class="btn" id="cb">退 房 …… 不 ，入 住</button>
    `);
    sfx.chime();
    await waitClick($('cb'));

    clearProgress();
    setStage(`
      <h1 style="font-size:24px;letter-spacing:.3em;">四 周 年 快 乐</h1>
      <p class="sub" style="margin-top:26px;">橡子旅馆 · 永不歇业<br>下次入住时间：五周年的今天</p>
      <button class="btn show" onclick="location.reload()" style="margin-top:40px;">重 新 入 住</button>
    `);
  })();
}
