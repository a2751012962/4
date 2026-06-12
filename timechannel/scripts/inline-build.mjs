/* 把 dist 的 JS/CSS 内联进 index.html：
   游戏支持双击 index.html（file://）直接玩，外链 module 脚本在 file:// 下
   会被 CORS 拦截，内联的 <script type="module"> 则不受影响。
   worker 产物保持外部文件（file:// 下本就禁 Worker，走主线程兜底；
   http 下按 import.meta.url 的兄弟路径加载，所以产物必须与 index.html 同级，
   见 vite.config.js 的 assetsDir:''）。 */
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
let html = readFileSync(join(dist, 'index.html'), 'utf8');
let jsCount = 0, cssCount = 0;
const inlined = [];

html = html.replace(/<script type="module"[^>]*src="\.\/([^"]+\.js)"><\/script>/g, (m, file) => {
  if (/worker/i.test(file)) return m;            // worker 必须保持外部文件
  jsCount++; inlined.push(file);
  const js = readFileSync(join(dist, file), 'utf8').replace(/<\/script>/g, '<\\/script>');
  return `<script type="module">${js}</script>`;
});
html = html.replace(/<link rel="stylesheet"[^>]*href="\.\/([^"]+\.css)"[^>]*>/g, (_, file) => {
  cssCount++; inlined.push(file);
  return `<style>${readFileSync(join(dist, file), 'utf8')}</style>`;
});
html = html.replace(/<link rel="modulepreload"[^>]*>/g, '');

/* 断言：vite 升级改了产物格式时要在构建期炸掉，而不是静默产出 file:// 跑不了的 dist */
const leftoverScript = html.match(/<script[^>]*\bsrc="(?![^"]*worker)[^"]*"/i);
const leftoverCss = html.match(/<link rel="stylesheet"/i);
if (!jsCount || !cssCount || leftoverScript || leftoverCss) {
  console.error('inline-build FAILED:',
    { jsCount, cssCount, leftoverScript: leftoverScript?.[0] ?? null, leftoverCss: !!leftoverCss });
  console.error('dist/index.html 的标签格式可能随 vite 版本变化，请更新 scripts/inline-build.mjs 的正则。');
  process.exit(1);
}

writeFileSync(join(dist, 'index.html'), html);
for (const file of inlined) unlinkSync(join(dist, file));   // 已吸收进 html，别留重复产物
console.log(`inlined: ${jsCount} js + ${cssCount} css → dist/index.html =`, (html.length / 1024).toFixed(0), 'KB');
