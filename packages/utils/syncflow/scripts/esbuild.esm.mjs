import * as esbuild from 'esbuild';
import { glob } from 'glob';
import { autoImportsDef } from './auto-imports.mjs';

const srcFiles = await glob('src/**/*.ts', {
  ignore: 'src/**/*.test.ts',
});

await esbuild.build({
  entryPoints: srcFiles,
  format: 'esm',
  platform: 'browser',
  bundle: false,
  outdir: './esm',
  minify: false,
  plugins: [autoImportsDef],
});
