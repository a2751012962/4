/* ============================================================
   房间音乐：Trois Gymnopédies No.1（由用户提供音频文件）
   文件放 timechannel/public/，构建后与 index.html 同级（像 worker 一样不内联）。
   缺失 / 加载失败时安静运行，绝不报错。
============================================================ */
import { ROOM } from './config.js';

let el = null;

function ensure() {
  if (el || !ROOM.audioSrc) return el;
  el = new Audio(ROOM.audioSrc); // 相对页面 URL：iframe 内解析到 dist/<src>
  el.loop = true;
  el.volume = 0;
  el.preload = 'auto';
  el.addEventListener('error', () => { el = null; }); // 文件缺失 → 静默放弃
  return el;
}

export function playRoomMusic() {
  const a = ensure();
  if (!a) return;
  try {
    const p = a.play();
    if (p && p.catch) p.catch(() => {}); // 自动播放被拦截也不报错
  } catch (_) { return; }
  // 音量淡入
  const target = ROOM.audioVolume;
  const t0 = performance.now();
  const fade = () => {
    if (!el) return;
    const k = Math.min((performance.now() - t0) / 2200, 1);
    el.volume = target * k;
    if (k < 1) requestAnimationFrame(fade);
  };
  fade();
}

export function stopRoomMusic() {
  if (!el) return;
  const a = el, v0 = a.volume, t0 = performance.now();
  const fade = () => {
    const k = Math.min((performance.now() - t0) / 1200, 1);
    a.volume = v0 * (1 - k);
    if (k < 1) requestAnimationFrame(fade);
    else { try { a.pause(); } catch (_) {} }
  };
  fade();
}
