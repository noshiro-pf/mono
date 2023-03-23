import * as esbuild from 'esbuild';
import { autoImportsDef } from './auto-imports.mjs';

await esbuild.build({
  entryPoints: ['./src/index.ts'],
  format: 'cjs',
  platform: 'node',
  bundle: true,
  outfile: './dist/bot.dev.cjs',
  minify: false,
  define: {
    'process.env.NODE_ENV': '"development"',
  },
  plugins: [autoImportsDef],
});
