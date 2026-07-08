# 橡子旅馆守则 · 四周年互动悬疑游戏

私人纪念日礼物项目。规则怪谈 × 解谜 × 2D/2.5D/3D 互动环节。

## 结构
- `index.html` — 入口
- `css/style.css` — 全部样式
- `js/config.js` — **个人内容配置区（改这里）**
- `js/core.js` — 基础工具 + WebAudio 音效
- `js/engine.js` — 场景/打字机/问答引擎
- `js/fx.js` — 特效（故障字、红色警报、心跳、粒子）
- `js/games/` — 小游戏（行船 / 跑酷 / 纪念碑谷式旋塔《珊瑚之塔》monument / 手电筒 / 3D走廊 / 水墨流云 inkwash，WebGL 水拓画 / 时光隧道 tunnel）
- `js/vendor/` — 本地内置的 three.js r160（monument 关卡用，不依赖 CDN）
- `timechannel/` — 完整复制的 [FranzLy/TimeChannel](https://github.com/FranzLy/TimeChannel)（Three.js 无限照片隧道）。
  第四晚开门后全屏进入：「恢复所有记忆的通道」。右上角 ⊕ My Photos 可导入全部真实照片
  （存进浏览器 IndexedDB，数量不限）。`timechannel/dist/` 已构建并内联成单文件随仓库提交，
  双击 index.html（file://）也能玩；改了源码用 `cd timechannel && npm install && npm run build` 重建。
  WebGL 不可用时自动退回像素版隧道（`js/games/tunnel.js`，瞬间文案在 `js/config.js` 的 `timeTunnel` 配置）
- `js/stages/` — 章节剧本（intro / inkwash 创意环节 / night1-4），每章一个文件
- `js/menu.js` — 主菜单与存档入口
- `js/app.js` — 启动器

## 本地运行
直接用浏览器打开 index.html 即可。

> 「水墨流云」创意环节用 WebGL2 实时流体模拟（需支持 WebGL 的浏览器；不支持时可直接「收笔」跳过）。
> 其毛笔体标题走 Google Fonts，离线 / `file://` 打开时会自动回退到本地 serif，不影响交互。
