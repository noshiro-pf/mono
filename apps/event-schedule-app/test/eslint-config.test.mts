import dedent from 'dedent';
import { ESLint } from 'eslint';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as util from 'node:util';
import { hasKey, isRecord } from 'ts-data-forge';
// eslint-disable-next-line import-x/no-relative-packages, import-x/no-internal-modules -- tools/ is not a package; this is how apps reach its shared configs
import { defineImportProbe } from '../../../tools/configs/eslint-import-probe.mjs';
import packageJson from '../package.json' with { type: 'json' };

// `.github/workflows/e2e-production.yml` installs this app alone and builds
// nothing, so what `playwright.production.config.mts` loads may not import a
// workspace package at run time. The blocks of eslint.config.mts that say so
// are easy to turn off with nothing failing: a later block that sets
// `no-restricted-imports` again replaces their options, and the shared config
// turns the rule off for `*.config.*` files. So this lints probe text the way
// `check:lint` lints a source file.
describe('eslint.config.mts', () => {
  const restrictedImportLines = defineImportProbe({
    packageRoot,
    sourcePath: specPath,
    // The block names this file alone, so the probe can be linted under no
    // other path.
    existingPaths: [productionConfigPath],
  });

  // Derived here again, not imported from the config, so that a config that
  // loses a package fails.
  const workspacePackages = Object.entries(packageJson)
    .filter(([field]) => /dependencies$/iu.test(field))
    .flatMap(([, ranges]) => Object.entries(ranges))
    .filter(
      ([, range]) =>
        typeof range === 'string' && range.startsWith('workspace:'),
    )
    .map(([name]) => name);

  describe.each([specPath, productionConfigPath])('%s', (sourcePath) => {
    test('refuses every workspace package, by name and by subpath', async () => {
      const lines = await restrictedImportLines(
        workspacePackages
          .flatMap((name, i) => [
            `import * as a${i} from '${name}';`,
            `import * as b${i} from '${name}/array';`,
            `export const used${i} = [a${i}, b${i}];`,
          ])
          .join('\n'),
        sourcePath,
      );

      assert.isAbove(workspacePackages.length, 0);

      assert.deepStrictEqual(
        lines,
        workspacePackages.flatMap((_, i) => [3 * i + 1, 3 * i + 2]),
      );
    }, 60_000);

    test('refuses a side-effect import and a re-export', async () => {
      const lines = await restrictedImportLines(
        dedent`
          import 'ts-data-forge/array';
          export * from 'synstate/core';
          export { Arr } from 'ts-data-forge';
        `,
        sourcePath,
      );

      assert.deepStrictEqual(lines, [1, 2, 3]);
    }, 60_000);

    // `synstate-of-someone-else` starts with a workspace package's name and is
    // not one.
    test('allows type imports, third-party packages and Node.js', async () => {
      const lines = await restrictedImportLines(
        dedent`
          import { expect } from '@playwright/test';
          import * as path from 'node:path';
          import { type Arr } from 'ts-data-forge';
          import type { NonEmptyArray } from 'ts-data-forge/array';
          import * as other from 'synstate-of-someone-else';

          export const used = [expect, path, other];
          export type Used = readonly [typeof Arr, NonEmptyArray<number>];
        `,
        sourcePath,
      );

      assert.deepStrictEqual(lines, []);
    }, 60_000);
  });

  describe('a spec under e2e/', () => {
    test('refuses a module outside e2e/', async () => {
      const lines = await restrictedImportLines(
        dedent`
          import { a } from '../src/constants/index.mjs';
          import { b } from './../src/constants/index.mjs';
          import { c } from './steps/../../src/constants/index.mjs';
          import { d } from '..';

          export const used = [a, b, c, d];
        `,
      );

      assert.deepStrictEqual(lines, [1, 2, 3, 4]);
    }, 60_000);

    test('allows a module of e2e/, and the types of one outside it', async () => {
      const lines = await restrictedImportLines(
        dedent`
          import { a } from './answer-page-steps.mjs';
          import { type B } from '../src/constants/index.mjs';

          export const used: readonly [unknown, B | undefined] = [a, undefined];
        `,
      );

      assert.deepStrictEqual(lines, []);
    }, 60_000);
  });

  describe('the production Playwright config', () => {
    test('refuses every relative module', async () => {
      const lines = await restrictedImportLines(
        dedent`
          import { a } from './playwright.config.mjs';
          import { b } from '../src/constants/index.mjs';
          import { c } from '../../../tools/configs/playwright-config.mjs';
          import { d } from '../scripts/workspace-root-path.mjs';
          import { e } from '.';

          export const used = [a, b, c, d, e];
        `,
        productionConfigPath,
      );

      assert.deepStrictEqual(lines, [1, 2, 3, 4, 5]);
    }, 60_000);
  });

  // The probes hold each block's options under one path. These hold which files
  // get them, from the options ESLint resolves for each real file, which lints
  // none of them.
  describe('the files the blocks reach', () => {
    const eslint = new ESLint({ cwd: packageRoot });

    // `resolveRules` of tools/scripts/lib/eslint-package-configs.mts, written
    // out so that this app's test imports none of the root guards' modules.
    const restrictedImportsOf = async (file: string): Promise<unknown> => {
      const config: unknown = await eslint.calculateConfigForFile(
        path.resolve(packageRoot, file),
      );

      const rules =
        isRecord(config) && hasKey(config, 'rules') ? config.rules : undefined;

      return isRecord(rules) ? rules['no-restricted-imports'] : undefined;
    };

    // Every module there, whatever its subdirectory: what Playwright and
    // Node.js can load, which ESLint must lint, unlike a screenshot baseline.
    // The working tree, untracked files included. Relative paths with `/`, as
    // the constants below are written.
    const filesUnder = async (dir: string): Promise<readonly string[]> => {
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a directory of this package the test names
      const entries = await fs.readdir(path.resolve(packageRoot, dir), {
        recursive: true,
        withFileTypes: true,
      });

      return entries
        .filter((entry) => entry.isFile() && moduleExtension.test(entry.name))
        .map((entry) =>
          path
            .relative(packageRoot, path.join(entry.parentPath, entry.name))
            .replaceAll(path.sep, '/'),
        );
    };

    // A later block naming some of them would replace the options for those.
    test('every file under e2e/ gets the options of the spec probed', async () => {
      const [expected, files] = await Promise.all([
        restrictedImportsOf(specPath),
        filesUnder('e2e'),
      ]);

      assert.isDefined(expected);

      assert.isAbove(files.length, 0);

      const options = await Promise.all(
        files.map(async (file) => [file, await restrictedImportsOf(file)]),
      );

      assert.deepStrictEqual(
        Object.fromEntries(options),
        Object.fromEntries(files.map((file) => [file, expected])),
      );
    }, 60_000);

    // A glob widened past the file the block names would give its options to
    // more. `check:lint` fails on most configs that got them, which import
    // modules they refuse, but not on one that imports nothing.
    test("no other module under configs/ gets the production config's options", async () => {
      const [own, files] = await Promise.all([
        restrictedImportsOf(productionConfigPath),
        filesUnder('configs'),
      ]);

      assert.isDefined(own);

      // So that an empty `others` means there is no other module, not that none
      // was read.
      assert.include(files, productionConfigPath);

      const others = files.filter((file) => file !== productionConfigPath);

      const shared = await Promise.all(
        others.map(async (file) => [
          file,
          util.isDeepStrictEqual(await restrictedImportsOf(file), own),
        ]),
      );

      assert.deepStrictEqual(
        Object.fromEntries(shared),
        Object.fromEntries(others.map((file) => [file, false])),
      );
    }, 60_000);
  });
});

const packageRoot = path.resolve(import.meta.dirname, '..');

const specPath = 'e2e/__probe__.spec.mts';

const productionConfigPath = 'configs/playwright.production.config.mts';

const moduleExtension = /\.(?:[cm]?[jt]s|[jt]sx)$/u;
