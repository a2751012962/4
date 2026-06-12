import { defineConfig } from 'vite';

export default defineConfig({
  base: './',          // 作为子目录/iframe 嵌入橡子旅馆，资源走相对路径

  server: { port: 5173, strictPort: true },
});
