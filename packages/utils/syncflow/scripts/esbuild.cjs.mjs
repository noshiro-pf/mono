import * as esbuild from 'esbuild';
import { glob } from 'glob';
import { autoImportsDef } from './auto-imports.mjs';

const srcFiles = await glob(['src/**/*.ts', 'test/**/*.ts'], {
  ignore: 'src/**/*.test.ts',
});

await esbuild.build({
  entryPoints: srcFiles,
  format: 'cjs',
  platform: 'node',
  bundle: false,
  outdir: './cjs',
  minify: false,
  plugins: [autoImportsDef],
});
