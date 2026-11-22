import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, root, '');

  return {
    plugins: [react()],
    resolve: {
      alias: [
        // Faz o código compartilhado continuar funcionando sem alterações.
        { find: /^next\/link$/, replacement: `${root}vite-shims/link.tsx` },
        { find: /^next\/navigation$/, replacement: `${root}vite-shims/navigation.tsx` },
        { find: /^@\//, replacement: `${root}` },
      ],
    },
    define: {
      // lib/supabase.ts lê as variáveis NEXT_PUBLIC_* no Next.
      // Na build Vite elas vêm de VITE_SUPABASE_* (.env / .env.local).
      'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL ?? ''),
      'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY ?? ''),
    },
    server: {
      port: 5173,
    },
  };
});
