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
 * provides. Invoked via an explicit path because both packages declare a `tsc`
 * bin and the winner of the `node_modules/.bin/tsc` conflict is not guaranteed.
 */
const nativeTsc = path.resolve(
  monorepoRootPath,
  './node_modules/typescript-native/bin/tsc',
);

/**
 * Type-checks what the build emitted, reached the way a consumer reaches it:
 * by package name, through the `exports` map, against `dist/` alone.
 *
 * Not part of `build` — a build emits, and what it emitted is checked here, so
 * that every CI job which only needs `dist/` stops paying for the check as
 * well. `pnpm run ws:check:dist` is the repository-wide form.
 */
const checkDist = async (): Promise<void> => {
  await ensureDistTestPackageLink();

  // Two programs that share nothing, so they run side by side. Each reports its
  // own failure and the process exits only once both have finished, so that one
  // failing neither cuts the other's diagnostics short nor leaves its compiler
  // running.
  const passed = await Promise.all([
    runTsc(
      path.resolve(workspaceRootPath, './test/dist_/named/tsconfig.json'),
      'named imports',
    ),
    checkDeclarationEmit(),
  ]);

  if (passed.some((ok) => !ok)) {
    process.exit(1);
  }

  console.info('✅ dist output checks passed.\n');
};

/** Whether the program type-checks; a failure is reported here. */
const runTsc = async (project: string, label: string): Promise<boolean> => {
  console.info(`Type-checking the dist output (${label})...`);

  const result = await $(`node "${nativeTsc}" -p "${project}"`);

  if (Result.isErr(result)) {
    console.error(
      `dist output type check (${label}) failed: ${result.value.message}`,
    );

    return false;
  }

  console.info(`✓ dist output type check (${label}) passed.\n`);

  return true;
};

/**
 * Emits the declarations of a module that declares codecs the way a consumer
 * does, and type-checks what was emitted: an inferred codec type is written out
 * structurally by declaration emit, and only a compilation of the emitted file
 * asks the package's bounds to accept that form.
 */
const checkDeclarationEmit = async (): Promise<boolean> => {
  // Emitted afresh, so that a module removed from the directory does not leave
  // its declarations behind to be checked.
  await fs.rm(
    path.resolve(
      workspaceRootPath,
      './test/dist_/node_modules/.declaration-emit',
    ),
    { recursive: true, force: true },
  );

  const emitted = await runTsc(
    path.resolve(
      workspaceRootPath,
      './test/dist_/declaration-emit/tsconfig.json',
    ),
    'declaration emit of a consumer module',
  );

  // The module failing its own check is the failure to report; what tsc emitted
  // for it anyway is not checked on top of that.
  if (!emitted) {
    return false;
  }

  return runTsc(
    path.resolve(
      workspaceRootPath,
      './test/dist_/declaration-emit/tsconfig.emitted.json',
    ),
    'the emitted declarations',
  );
};

/**
 * Materializes a minimal `test/dist_/node_modules/ts-fortress` package (a
 * directory containing symlinks to the repository's `package.json` and `dist/`
 * only — the same surface a published tarball has) so that the dist smoke tests
 * (`test/dist_/**`) resolve the package through the real `package.json`
 * `exports` map, exactly like an external consumer.
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
    'test/dist_/node_modules/ts-fortress',
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
