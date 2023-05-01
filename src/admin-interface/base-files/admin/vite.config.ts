import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';
import path from 'path';
// https://vitejs.dev/config/

// eslint-disable-next-line import/no-anonymous-default-export
export default ({ mode }) => {
  // Load app-level env vars to node-level env vars.
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  return defineConfig({
    publicDir: './public',
    plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
    server: {
      cors: false,
      origin: '*',
      proxy: {
        '/graphql': {
          target: 'http://localhost:3070/graphql',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/graphql/, ''),
          configure: (proxy, options) => {
            console.log('Hitting proxy');
            return proxy;
          },
        },
      },
    },

    resolve: {
      alias: {
        '*': path.resolve(__dirname, './src'),
      },
    },
  });
};
