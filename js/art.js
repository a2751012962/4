/* ================= 手绘SVG美术资产库 ================= */
"use strict";
const ART = (() => {

  /* ---------- 巴塞罗熊 ---------- */
  // outfit: 'sailor' | 'hiker' | 'onesie'
  function bear(outfit) {
    const fur = '#d9c49a', pad = '#efe3c8', line = '#6e5639', dark = '#3a2d1c';
    const suit = '#f4f0e6', suitLine = '#b3a88f', suitPad = '#fdfbf4';
    const onesie = outfit === 'onesie';
    const bodyFill = onesie ? suit : fur, bodyLine = onesie ? suitLine : line;

    let back = '', front = '', head = '';

    if (outfit === 'sailor') {
      head = `
        <g transform="rotate(-7 100 28)">
          <rect x="70" y="12" width="60" height="22" rx="10" fill="#f3ecd9" stroke="${line}" stroke-width="2.5"/>
          <rect x="70" y="27" width="60" height="8" rx="3" fill="#2c3e66"/>
          <circle cx="100" cy="22" r="3" fill="#2c3e66"/>
        </g>`;
      front = `
        <path d="M62 132 L100 164 L138 132 L138 120 L100 150 L62 120 Z" fill="#2c3e66" stroke="#1d2b49" stroke-width="2"/>
        <path d="M66 124 L100 152 L134 124" fill="none" stroke="#f3ecd9" stroke-width="2.5"/>
        <circle cx="100" cy="160" r="5" fill="#c9a44a" stroke="#8a6f2e" stroke-width="1.5"/>`;
    }
    if (outfit === 'hiker') {
      head = `<path d="M60 36 q40 -32 80 0 l-5 11 q-35 -24 -70 0 z" fill="#5d7a4a" stroke="#3e5530" stroke-width="2.5"/>`;
      back = `
        <line x1="30" y1="112" x2="42" y2="218" stroke="#8a6238" stroke-width="6" stroke-linecap="round"/>
        <circle cx="29" cy="107" r="7" fill="#a87b4a" stroke="#6e4a26" stroke-width="2"/>
        <circle cx="40" cy="134" r="8" fill="#ffd98a" opacity=".95">
          <animate attributeName="opacity" values=".95;.55;.95" dur="2.6s" repeatCount="indefinite"/>
        </circle>`;
      front = `
        <path d="M66 128 q34 18 68 0 l-4 13 q-30 15 -60 0 z" fill="#b3492f" stroke="#7e2f1d" stroke-width="2"/>
        <rect x="110" y="138" width="15" height="28" rx="6" fill="#b3492f" stroke="#7e2f1d" stroke-width="2"/>
        <path d="M74 134 q-5 26 2 42 M126 134 q5 26 -2 42" fill="none" stroke="#6e4a26" stroke-width="6" stroke-linecap="round" opacity=".85"/>`;
    }
    if (onesie) {
      head = `
        <path d="M44 78 q-4 -62 56 -62 q60 0 56 62 q-1 14 -9 22 q6 -56 -47 -56 q-53 0 -47 56 q-8 -8 -9 -22 z"
          fill="${suit}" stroke="${suitLine}" stroke-width="3"/>
        <circle cx="55" cy="34" r="15" fill="${suit}" stroke="${suitLine}" stroke-width="2.5"/>
        <circle cx="145" cy="34" r="15" fill="${suit}" stroke="${suitLine}" stroke-width="2.5"/>`;
      front = `
        <circle cx="100" cy="152" r="4" fill="${suitLine}"/>
        <circle cx="100" cy="168" r="4" fill="${suitLine}"/>
        <circle cx="100" cy="184" r="4" fill="${suitLine}"/>`;
    }

    return `<svg viewBox="0 0 200 235" xmlns="http://www.w3.org/2000/svg" class="bear-svg">
      <g class="bear-bob">
        ${back}
        <circle cx="58" cy="42" r="22" fill="${fur}" stroke="${line}" stroke-width="3"/>
        <circle cx="142" cy="42" r="22" fill="${fur}" stroke="${line}" stroke-width="3"/>
        <circle cx="58" cy="45" r="10" fill="${pad}"/>
        <circle cx="142" cy="45" r="10" fill="${pad}"/>
        <ellipse cx="52" cy="162" rx="14" ry="30" fill="${bodyFill}" stroke="${bodyLine}" stroke-width="3" transform="rotate(16 52 162)"/>
        <ellipse cx="148" cy="162" rx="14" ry="30" fill="${bodyFill}" stroke="${bodyLine}" stroke-width="3" transform="rotate(-16 148 162)"/>
        <ellipse cx="100" cy="172" rx="50" ry="48" fill="${bodyFill}" stroke="${bodyLine}" stroke-width="3"/>
        <ellipse cx="100" cy="180" rx="29" ry="29" fill="${onesie ? suitPad : pad}" opacity=".75"/>
        <path d="M100 148 v58" stroke="${bodyLine}" stroke-width="1.5" stroke-dasharray="4 5" opacity=".5"/>
        <ellipse cx="74" cy="216" rx="17" ry="14" fill="${bodyFill}" stroke="${bodyLine}" stroke-width="3"/>
        <ellipse cx="126" cy="216" rx="17" ry="14" fill="${bodyFill}" stroke="${bodyLine}" stroke-width="3"/>
        <ellipse cx="74" cy="218" rx="8" ry="6" fill="${onesie ? suitPad : pad}"/>
        <ellipse cx="126" cy="218" rx="8" ry="6" fill="${onesie ? suitPad : pad}"/>
        <ellipse cx="100" cy="78" rx="54" ry="47" fill="${fur}" stroke="${line}" stroke-width="3"/>
        ${head}
        <ellipse cx="100" cy="98" rx="25" ry="17" fill="${pad}"/>
        <path d="M92 89 h16 l-8 10 z" fill="${dark}"/>
        <path d="M100 99 v7 M93 109 q7 6 14 0" fill="none" stroke="${dark}" stroke-width="2" stroke-linecap="round"/>
        <g class="bear-eyes">
          <circle cx="79" cy="72" r="5.5" fill="${dark}"/>
          <circle cx="121" cy="72" r="5.5" fill="${dark}"/>
          <circle cx="81" cy="70" r="1.8" fill="#fff" opacity=".85"/>
          <circle cx="123" cy="70" r="1.8" fill="#fff" opacity=".85"/>
        </g>
        <path d="M70 60 q9 -5 18 -1 M112 59 q9 -4 18 1" fill="none" stroke="${line}" stroke-width="2" stroke-linecap="round" opacity=".55"/>
      </g>
    </svg>`;
  }

  /* ---------- 笃笃与突突（橡果） ---------- */
  function acorns() {
    const one = (x, wink, delay) => `
      <g class="acorn-wiggle" style="animation-delay:${delay}s">
        <ellipse cx="${x}" cy="80" rx="26" ry="29" fill="#cf9352" stroke="#8a5a28" stroke-width="3"/>
        <circle cx="${x}" cy="107" r="4" fill="#8a5a28"/>
        <path d="M${x - 31} 64 q31 -36 62 0 q-31 11 -62 0 z" fill="#7a4e26" stroke="#5b3a1c" stroke-width="2.5"/>
        <path d="M${x - 22} 56 q22 -16 44 0 M${x - 26} 61 q26 -20 52 0" fill="none" stroke="#5b3a1c" stroke-width="1.5" opacity=".6"/>
        <rect x="${x - 2}" y="34" width="5" height="12" rx="2.5" fill="#5b3a1c"/>
        ${wink
          ? `<path d="M${x - 14} 76 q5 -4 10 0" fill="none" stroke="#3a2d1c" stroke-width="2.5" stroke-linecap="round"/>`
          : `<circle cx="${x - 9}" cy="76" r="3.5" fill="#3a2d1c"/>`}
        <circle cx="${x + 9}" cy="76" r="3.5" fill="#3a2d1c"/>
        <path d="M${x - 6} 88 q6 5 12 0" fill="none" stroke="#3a2d1c" stroke-width="2" stroke-linecap="round"/>
        <circle cx="${x - 16}" cy="84" r="4" fill="#e8b08a" opacity=".55"/>
        <circle cx="${x + 16}" cy="84" r="4" fill="#e8b08a" opacity=".55"/>
      </g>`;
    return `<svg viewBox="0 0 220 120" xmlns="http://www.w3.org/2000/svg" class="bear-svg">
      ${one(65, true, 0)}${one(155, false, .6)}
    </svg>`;
  }

  /* ---------- 雨夜旅馆（主菜单背景） ---------- */
  function hotelScene() {
    let stars = '';
    for (let i = 0; i < 34; i++) {
      const x = (i * 137 + 41) % 900, y = (i * 71 + 13) % 230, r = (i % 3) * .5 + .7;
      stars += `<circle cx="${x}" cy="${y}" r="${r}" fill="#cdd6ef" opacity=".${4 + (i % 5)}"/>`;
    }
    const win = (x, y, flick) =>
      `<rect x="${x}" y="${y}" width="30" height="40" rx="3" fill="url(#wg)" stroke="#0c0814" stroke-width="2" ${flick ? 'class="winflick" style="animation-delay:' + (x % 7) * .8 + 's"' : ''}/>
       <line x1="${x + 15}" y1="${y}" x2="${x + 15}" y2="${y + 40}" stroke="#0c0814" stroke-width="1.5" opacity=".5"/>`;
    let windows = '';
    [125, 195, 265].forEach((y, r) => { [30, 95, 195, 260].forEach((x, c) => { windows += win(x, y, (r + c) % 3 === 0); }); });

    return `<svg viewBox="0 0 900 560" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%;">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#0a0e1f"/><stop offset=".7" stop-color="#171331"/><stop offset="1" stop-color="#241a35"/>
        </linearGradient>
        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffd98a"/><stop offset="1" stop-color="#c9842e"/>
        </linearGradient>
        <filter id="blur18"><feGaussianBlur stdDeviation="18"/></filter>
        <filter id="glowy"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect width="900" height="560" fill="url(#sky)"/>
      ${stars}
      <circle cx="745" cy="92" r="62" fill="#e8e0c2" opacity=".1"/>
      <circle cx="745" cy="92" r="38" fill="#e8e0c2" opacity=".9"/>
      <circle cx="733" cy="84" r="7" fill="#cfc6a6" opacity=".5"/>
      <circle cx="755" cy="102" r="5" fill="#cfc6a6" opacity=".4"/>
      <path d="M0 470 Q220 420 450 455 T900 440 V560 H0 Z" fill="#0c0a14"/>
      <g opacity=".95">
        <path d="M790 455 q-14 -90 8 -150 q-40 36 -36 90 q-22 -64 6 -118 q-52 40 -44 122 q-10 -20 -26 -28 q18 36 22 84 z" fill="#141022"/>
        <ellipse cx="770" cy="262" rx="95" ry="68" fill="#161226"/>
        <ellipse cx="708" cy="300" rx="60" ry="44" fill="#131023"/>
        <ellipse cx="832" cy="306" rx="55" ry="40" fill="#18142a"/>
        <circle cx="742" cy="282" r="4" fill="#e0b35a" opacity=".9"/>
        <circle cx="796" cy="252" r="3.5" fill="#e0b35a" opacity=".7"/>
        <circle cx="822" cy="296" r="3" fill="#e0b35a" opacity=".8"/>
      </g>
      <g transform="translate(190,90) rotate(-1.2)">
        <rect x="135" y="-58" width="26" height="52" fill="#1a1428" stroke="#0c0814" stroke-width="2"/>
        <circle class="smoke" cx="148" cy="-66" r="9" fill="#3a3450" opacity=".5"/>
        <circle class="smoke" style="animation-delay:1.4s" cx="156" cy="-60" r="7" fill="#3a3450" opacity=".4"/>
        <path d="M-30 110 L160 -20 L350 110 Z" fill="#120d1f" stroke="#0c0814" stroke-width="3"/>
        <circle cx="160" cy="62" r="17" fill="url(#wg)" stroke="#0c0814" stroke-width="2.5" class="winflick"/>
        <rect x="0" y="110" width="320" height="290" fill="#1d1630" stroke="#0c0814" stroke-width="3"/>
        <path d="M0 145 h320 M0 215 h320 M0 285 h320" stroke="#0c0814" stroke-width="1.5" opacity=".4"/>
        ${windows}
        <path d="M132 400 v-72 q28 -26 56 0 v72 z" fill="#2a1c10" stroke="#0c0814" stroke-width="3"/>
        <path d="M138 398 v-66 q22 -20 44 0 v66 z" fill="url(#wg)" opacity=".85"/>
        <rect x="120" y="398" width="80" height="8" fill="#0c0814"/>
        <g filter="url(#glowy)">
          <rect x="330" y="180" width="44" height="170" rx="6" fill="#241a35" stroke="#0c0814" stroke-width="3"/>
          <text x="352" y="200" writing-mode="tb" fill="#ffd98a" font-size="30" letter-spacing="8"
            font-family="Songti SC, Noto Serif SC, serif" class="sign-glow">橡子旅馆</text>
        </g>
        <line x1="330" y1="186" x2="320" y2="160" stroke="#0c0814" stroke-width="4"/>
      </g>
      <ellipse class="fogmove" cx="240" cy="520" rx="320" ry="52" fill="#2a2440" opacity=".5" filter="url(#blur18)"/>
      <ellipse class="fogmove" style="animation-delay:4s" cx="640" cy="540" rx="360" ry="58" fill="#241e38" opacity=".45" filter="url(#blur18)"/>
    </svg>`;
  }

  /* ---------- 章节图标 ---------- */
  function chapterIcon(n) {
    const c = '#cdb27a';
    const inner = [
      `<circle cx="40" cy="40" r="22" fill="none" stroke="${c}" stroke-width="3"/>
       <circle cx="40" cy="40" r="7" fill="none" stroke="${c}" stroke-width="3"/>
       <g stroke="${c}" stroke-width="3" stroke-linecap="round">
         <line x1="40" y1="12" x2="40" y2="24"/><line x1="40" y1="56" x2="40" y2="68"/>
         <line x1="12" y1="40" x2="24" y2="40"/><line x1="56" y1="40" x2="68" y2="40"/>
         <line x1="20" y1="20" x2="29" y2="29"/><line x1="51" y1="51" x2="60" y2="60"/>
         <line x1="60" y1="20" x2="51" y2="29"/><line x1="29" y1="51" x2="20" y2="60"/>
       </g>`,
      `<path d="M30 24 h20 l4 10 v26 a14 10 0 0 1 -28 0 V34 z" fill="none" stroke="${c}" stroke-width="3"/>
       <line x1="33" y1="24" x2="47" y2="24" stroke="${c}" stroke-width="3"/>
       <rect x="36" y="14" width="8" height="6" rx="2" fill="${c}"/>
       <circle cx="40" cy="46" r="7" fill="#ffd98a" opacity=".9"><animate attributeName="opacity" values=".9;.4;.9" dur="2.2s" repeatCount="indefinite"/></circle>`,
      `<path d="M52 16 a26 26 0 1 0 14 36 a22 22 0 0 1 -14 -36 z" fill="none" stroke="${c}" stroke-width="3"/>
       <circle cx="22" cy="26" r="2" fill="${c}"/><circle cx="32" cy="16" r="1.5" fill="${c}"/>`,
      `<circle cx="40" cy="34" r="13" fill="none" stroke="${c}" stroke-width="3"/>
       <path d="M40 44 l-7 22 h14 z" fill="none" stroke="${c}" stroke-width="3" stroke-linejoin="round"/>`
    ][n];
    return `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" width="64" height="64">${inner}</svg>`;
  }

  /* ---------- canvas精灵 ---------- */
  function uri(svg) { return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); }
  const spriteCache = {};
  function sprite(key) {
    if (spriteCache[key]) return spriteCache[key];
    const img = new Image();
    img.src = uri(key === 'acorns' ? acorns() : bear(key));
    spriteCache[key] = img;
    return img;
  }

  /* ---------- 雨 ---------- */
  function makeRain(container, n = 70) {
    for (let i = 0; i < n; i++) {
      const d = document.createElement('span');
      d.className = 'raindrop';
      d.style.left = Math.random() * 100 + '%';
      d.style.animationDelay = Math.random() * 2 + 's';
      d.style.animationDuration = (.7 + Math.random() * .8) + 's';
      d.style.opacity = .25 + Math.random() * .4;
      container.appendChild(d);
    }
  }

  return { bear, acorns, hotelScene, chapterIcon, uri, sprite, makeRain };
})();
