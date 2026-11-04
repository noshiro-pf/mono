import * as esbuild from 'esbuild';
import { Result } from 'ts-data-forge';
import { glob } from 'ts-repo-utils';

// Transpiled file by file rather than bundled: the app runs from a checkout on
// a small VM, where `node ./build/index.mjs` resolves its dependencies from
// `node_modules` as it would anywhere else.
// The colocated `*.test.mts` files are left out: they import Vitest, which the
// VM does not install.
const filesResult = await glob('./src/**/*.mts', {
  ignore: ['**/*.test.mts'],
});

if (Result.isErr(filesResult)) {
  console.error(filesResult.value);

  process.exit(1);
}

await esbuild.build({
  entryPoints: Array.from(filesResult.value),
  format: 'esm',
  platform: 'node',
  bundle: false,
  outdir: './build',
  outExtension: { '.js': '.mjs' },
  minify: false,
});

console.log('✅ build completed');
