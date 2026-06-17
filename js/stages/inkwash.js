"use strict";
/* ---------- 创意环节 · 水墨流云 ----------
   插在序章之后、第一晚之前的开篇水墨前奏。文案取自 CONFIG.inkwash，便于自填。 */
async function stageInkwash(){
  const C = CONFIG.inkwash || {};
  setNight(C.badge || "创意环节 · 水墨流云");
  await chapterCard(C.cardTitle || "水 墨 流 云", C.cardSub || "落 笔 之 前 · 先 替 这 四 年 留 一 朵 云", 2);

  await screenType(C.introLines || [
    "签完名，登记簿旁压着一方旧砚、一支秃笔。",
    "砚台边刻着一行小字：",
    "「入住之前，请先留一笔。」",
    "「墨里有云，云里有你想留住的那些天。」"
  ], C.introBtn || "提 笔", 60);

  await inkwashGame();

  await screenType(C.outroLines || [
    "你收了笔。",
    "宣纸上的墨，慢慢晕开，聚成了一片流云。",
    "云没有飘走——它停在纸上，像在等谁回头看它一眼。",
    "旅馆的灯，忽然亮了一格。该上楼了。"
  ], C.outroBtn || "上 楼 · 第 一 晚", 58);
}
