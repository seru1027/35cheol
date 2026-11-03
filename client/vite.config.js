import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 서버 .env의 CLIENT_ORIGIN(http://localhost:5173)과 같아야 CORS가 통과한다
  // strictPort: 5173을 이미 쓰고 있으면 5174로 넘어가지 않고 멈춘다 (넘어가면 출처가 달라져 CORS 에러)
  server: { port: 5173, strictPort: true },
});
