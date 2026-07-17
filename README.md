# 橡子旅馆守则 · 四周年互动悬疑游戏

私人纪念日礼物项目。规则怪谈 × 解谜 × 2D/2.5D/3D 互动环节。

## 结构
- `index.html` — 入口
- `css/style.css` — 全部样式
- `js/config.js` — **个人内容配置区（改这里）**
- `js/core.js` — 基础工具 + WebAudio 音效
- `js/engine.js` — 场景/打字机/问答引擎
- `js/fx.js` — 特效（故障字、红色警报、心跳、粒子）
- `js/vendor/three.min.js` — Three.js r128（本地引入，file:// 直接可用）
- `js/three-core.js` — Three.js 公共层（像素/高清渲染器、中文纹理、镜头震动、粒子）
- `js/games/` — 四晚小游戏，全部为 Three.js 真3D 渲染（夜海行船 / 雾墙攀登 / 手电筒暗房 / 第一人称坍塌走廊）
- `js/stages/` — 五个章节剧本（intro / night1-4），每章一个文件
- `js/menu.js` — 主菜单与存档入口
- `js/app.js` — 启动器
- `story/` — 故事文档（设定集 / 大纲与伏笔台账 / 审查报告），按 [webnovel-writer](https://github.com/lingfengQAQ/webnovel-writer) 方法论编写

## 本地运行
直接用浏览器打开 index.html 即可。
