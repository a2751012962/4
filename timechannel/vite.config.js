import { defineConfig } from 'vite';

export default defineConfig({
  base: './',          // 作为子目录/iframe 嵌入橡子旅馆，资源走相对路径

  /* 产物全部落在 dist 根（不进 assets/）：构建后 JS 会被内联进 index.html，
     import.meta.url 变成页面 URL，worker 的兄弟路径引用只有与 index.html
     同级才解析得到（否则 http 部署下 new Worker 404）。 */
  build: { assetsDir: '' },

  server: { port: 5173, strictPort: true },
});
