import * as esbuild from 'esbuild';
import { glob } from 'glob';
import { autoImportsDef } from './auto-imports.mjs';

const srcFiles = await glob('./src/**/*.mts', {
  ignore: ['src/globals.d.ts'],
});

await esbuild.build({
  entryPoints: srcFiles,
  format: 'esm',
  platform: 'node',
  bundle: false,
  outdir: './build',
  outExtension: { '.js': '.mjs' },
  minify: false,
  define: {
    'process.env.NODE_ENV': '"development"',
  },
  plugins: [autoImportsDef],
});
