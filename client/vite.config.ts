import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default ({ mode }: { mode: string }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/auth': process.env.VITE_API_URL || 'http://localhost:3000',
      },
      allowedHosts: ['destined-daily-boxer.ngrok-free.app'],
    },
  });
};
