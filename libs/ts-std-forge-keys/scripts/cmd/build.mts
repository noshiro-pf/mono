import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { $, Result } from 'ts-repo-utils';
import { workspaceRootPath } from '../workspace-root-path.mjs';

// The package is declarations only: the build is a clean and one declaration
// emit with the native compiler (TypeScript >= 7, installed as
// "typescript-native" and hoisted to the monorepo root).

const nativeTsc = path.resolve(
  workspaceRootPath,
  '../../node_modules/typescript-native/bin/tsc',
);

await fs.rm(path.resolve(workspaceRootPath, './dist'), {
  recursive: true,
  force: true,
});

const emitted = await $(`node "${nativeTsc}" -p ./configs/tsconfig.build.json`);

if (Result.isErr(emitted)) {
  console.error(`Declaration emit failed: ${emitted.value.message}`);

  process.exit(1);
}

console.info('✅ Build completed successfully!');
