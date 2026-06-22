/* ============================================================
   全局配置与纯函数（无依赖）
============================================================ */
export const VERSION = 'v9';

export const isMobile =
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 640;

export const CFG = {
  rings: isMobile ? 26 : 34,        // 同时存在的照片环数
  segments: isMobile ? 10 : 12,     // 每环照片数
  spacing: 9,                       // 环间距
  radius: 14,                       // 隧道半径
  photoW: 6.6, photoH: 4.7,
  photoCount: 48,                   // 默认照片数量
  maxSpeed: 60,
};

export const TUNNEL_LEN = CFG.rings * CFG.spacing;

export const REACH = 60; // 可悬停/点击的最远距离

/* ---------- 终章谜题：在隧道里找到「正确的照片」才能出来（可多张=多答案） ----------
   correctIds 用照片的稳定 id：demo 图是 'demo-0'..'demo-47'；导入照片是
   `文件名|大小|修改时间`。标记几张就有几个正确答案。若当前相册里一张都不匹配，
   会兜底把「最新的一张」当正确答案，保证谜题永远可解。【按需改 clue 与 correctIds】 */
export const PUZZLE = {
  enabled: true,
  clue: '【改我】找到那一张——你们第一次一起看海。点开它，走进去。',
  correctIds: ['demo-0', 'demo-12', 'demo-29'], // 默认给 demo 相册留三个答案，导入真实照片后请改成真实 id
  rampSeconds: 26,   // 持续滚动越来越快：到这个秒数时达到巡航上限
  rampMaxSpeed: 30,  // 自动巡航最低速度的上限（手动仍可更快）
};

/* ---------- 冲出过场：确认正确照片后指数加速 + 白场 ---------- */
export const FLYOUT = { dur: 2.8, whiteAt: 0.55 };

/* ---------- 3D 橡木房间 + 玩具钥匙 + 音乐 ---------- */
export const ROOM = {
  audioSrc: 'gymnopedie.mp3',      // 放到 timechannel/public/ 下，构建后与 index.html 同级；缺失则安静运行
  audioVolume: 0.55,
  clue: '【改我】WASD 走动 · 拖动环视 —— 房间里有件小小的玩具，那是最后一把钥匙。找到它，点亮它。',
  pickedText: '【改我】钥匙到手了。该走了。',
};


/* ---------- 弯道：隧道沿 z 蜿蜒，穿行更有穿梭感 ---------- */
export function curveX(z) { return Math.sin(z * 0.020) * 5.5 + Math.sin(z * 0.0083) * 3.5; }
export function curveY(z) { return Math.sin(z * 0.013 + 2.0) * 3.0; }

/* ---------- 日期格式 ---------- */
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export function fmtDate(d) { return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`; }

export function fmtWhen(ts) {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${fmtDate(d)} · ${hh}:${mm}`;
}
