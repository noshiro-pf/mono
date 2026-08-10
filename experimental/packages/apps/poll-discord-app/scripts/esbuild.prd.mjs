import * as esbuild from 'esbuild';
import { autoImportsDef } from './auto-imports.mjs';

await esbuild.build({
  entryPoints: ['./src/index.ts'],
  format: 'esm',
  platform: 'node',
  bundle: true,
  outfile: './build/bot.prd.mjs',
  minifyIdentifiers: false,
  minifySyntax: true,
  minifyWhitespace: true,
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  plugins: [autoImportsDef],
});
