import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { $, Result } from 'ts-repo-utils';
import { workspaceRootPath } from '../workspace-root-path.mjs';

/**
 * The monorepo root, where the hoisted `node_modules` lives.
 */
const monorepoRootPath = path.resolve(workspaceRootPath, '../..');

/**
 * The native TypeScript compiler (TypeScript >= 7). It is installed under the
 * alias "typescript-native" because the "typescript" package must stay on 6.x
 * for tools that require the JS compiler API (typescript-eslint, typedoc,
 * prettier-plugin-organize-imports, ...), which TypeScript 7 no longer
 * provides. Invoked via an explicit path because both packages declare a
 * `tsc` bin and the winner of the `node_modules/.bin/tsc` conflict is not
 * guaranteed.
 */
const nativeTsc = path.resolve(
  monorepoRootPath,
  './node_modules/typescript-native/bin/tsc',
);

/**
 * Type-checks what the build emitted, reached the way a consumer reaches it:
 * by package name, through the `exports` map, against `dist/` alone.
 *
 * Not part of `build` — a build emits, and what it emitted is checked here,
 * so that every CI job which only needs `dist/` stops paying for the check as
 * well. `pnpm run ws:check` is the repository-wide form.
 */
const checkDist = async (): Promise<void> => {
  await ensureDistTestPackageLink();

  await runTsc(
    path.resolve(workspaceRootPath, './test/dist_/named/tsconfig.json'),
    'named imports',
  );

  await runTsc(
    path.resolve(workspaceRootPath, './test/dist_/ambient/tsconfig.json'),
    'ambient global, triple-slash directive',
  );

  await runTsc(
    path.resolve(
      workspaceRootPath,
      './test/dist_/ambient-types-option/tsconfig.json',
    ),
    'ambient global, compilerOptions.types',
  );

  console.info('✅ dist output checks passed.\n');
};

const runTsc = async (project: string, label: string): Promise<void> => {
  console.info(`Type-checking the dist output (${label})...`);

  const result = await $(`node "${nativeTsc}" -p "${project}"`);

  if (Result.isErr(result)) {
    console.error(
      `dist output type check (${label}) failed: ${result.value.message}`,
    );

    process.exit(1);
  }

  console.info(`✓ dist output type check (${label}) passed.\n`);
};

/**
 * Materializes a minimal `test/dist_/node_modules/ts-type-forge` package (a
 * directory containing symlinks to the repository's `package.json` and
 * `dist/` only — the same surface a published tarball has) so that the dist
 * smoke tests (`test/dist_/**`) resolve the package through the real
 * `package.json` `exports` map, exactly like an external consumer.
 *
 * Deliberately NOT a symlink to the repository root: that would expose the
 * whole repository (including `node_modules/`) under `test/dist_/`, which
 * derails tools that walk the tree.
 *
 * (`node_modules` is gitignored, so the links are re-created on every run.)
 */
const ensureDistTestPackageLink = async (): Promise<void> => {
  const packageDir = path.resolve(
    workspaceRootPath,
    'test/dist_/node_modules/ts-type-forge',
  );

  // Remove leftovers from a previous run so the links never go stale.
  await fs.rm(packageDir, { recursive: true, force: true });

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.mkdir(packageDir, { recursive: true });

  for (const entry of ['package.json', 'dist'] as const) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.symlink(
      path.relative(packageDir, path.resolve(workspaceRootPath, entry)),
      path.resolve(packageDir, entry),
    );
  }
};

await checkDist();
