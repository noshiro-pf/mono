import viteReact from '@vitejs/plugin-react';
import * as path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [viteReact()],
  resolve: {
    alias: {
      'synstate-react-router': path.resolve(
        import.meta.dirname,
        '../synstate-react-router/src/index.mts',
      ),
      'synstate-router': path.resolve(
        import.meta.dirname,
        '../synstate-router/src/index.mts',
      ),
      synstate: path.resolve(
        import.meta.dirname,
        '../synstate/src/entry-point.mts',
      ),
      'synstate-react-hooks': path.resolve(
        import.meta.dirname,
        '../synstate-react-hooks/src/index.mts',
      ),
    },
  },
});
