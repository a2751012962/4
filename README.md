# 橡子旅馆守则 · 四周年互动悬疑游戏

私人纪念日礼物项目。规则怪谈 × 解谜 × 2D/2.5D/3D 互动环节。

## 结构
- `index.html` — 入口
- `css/style.css` — 全部样式
- `js/config.js` — **个人内容配置区（改这里）**
- `js/core.js` — 基础工具 + WebAudio 音效
- `js/engine.js` — 场景/打字机/问答引擎
- `js/fx.js` — 特效（故障字、红色警报、心跳、粒子）
- `js/games/` — 小游戏（行船 / 跑酷 / 手电筒 / 3D走廊 / 时光隧道）
- `timechannel/` — 完整复制的 [FranzLy/TimeChannel](https://github.com/FranzLy/TimeChannel)（Three.js 无限照片隧道）。
  第四晚开门后全屏进入：「恢复所有记忆的通道」。右上角 ⊕ My Photos 可导入全部真实照片
  （存进浏览器 IndexedDB，数量不限）。`timechannel/dist/` 已构建并内联成单文件随仓库提交，
  双击 index.html（file://）也能玩；改了源码用 `cd timechannel && npm install && npm run build` 重建。
  WebGL 不可用时自动退回像素版隧道（`js/games/tunnel.js`，瞬间文案在 `js/config.js` 的 `timeTunnel` 配置）
- `js/stages/` — 五个章节剧本（intro / night1-4），每章一个文件
- `js/menu.js` — 主菜单与存档入口
- `js/app.js` — 启动器

## 本地运行
直接用浏览器打开 index.html 即可。
