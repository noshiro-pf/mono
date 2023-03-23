import * as esbuild from 'esbuild';
import { autoImportsDef } from './auto-imports.mjs';

await esbuild.build({
  entryPoints: ['./src/index.ts'],
  format: 'cjs',
  platform: 'node',
  bundle: true,
  outfile: './dist/bot.prd.cjs',
  minifyIdentifiers: false,
  minifySyntax: true,
  minifyWhitespace: true,
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  plugins: [autoImportsDef],
});
