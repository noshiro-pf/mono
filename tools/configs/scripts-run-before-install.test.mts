import * as fs from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import * as path from 'node:path';
import { Arr, hasKey, Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  collectNodeRuns,
  commonJsLoaderLines,
  RUN_AFTER_INSTALL,
  runtimeSpecifiers,
} from '../scripts/cmd/check-node-run-scripts.mjs';
import { projectRootPath } from '../scripts/project-root-path.mjs';
import { scriptsRunBeforeInstall } from './scripts-run-before-install.mjs';

/**
 * Which files plain `node` runs, and whether each loads under Node before the
 * install, is `check:root:node-run-scripts`'s to judge
 * (`tools/scripts/cmd/check-node-run-scripts.mts`): this reads its discovery
 * and its import reader rather than its own, so that the two cannot disagree.
 * What stays here is what the ESLint exemption needs of its list.
 */
describe('scriptsRunBeforeInstall', () => {
  test('names every root tools script plain node runs before the install, and only those', async () => {
    const runs = await collectNodeRuns();

    // The reason, when the discovery fails, rather than `false`.
    expect(Result.isErr(runs) ? runs.value : '').toBe('');

    assert.isTrue(Result.isOk(runs));

    // A command the check cannot read is its failure to report, not a script
    // this may leave out.
    expect(runs.value.problems).toStrictEqual([]);

    expect(scriptsRunBeforeInstall.toSorted()).toStrictEqual(
      Arr.uniq(
        runs.value.runs
          .map(({ file }) => file)
          .filter(
            (file) => file.startsWith('tools/') && !RUN_AFTER_INSTALL.has(file),
          ),
      ).toSorted(),
    );
  });

  test.each(scriptsRunBeforeInstall)(
    '%s loads nothing but node: builtins at runtime',
    (file) => {
      // The check lets a script load relative files; these may not, because the
      // ESLint exemption covers the listed files alone. This is stricter than
      // the check's judge, `nodeLoadViolations`, on purpose, so it reads the
      // imports and CommonJS loaders itself: a builtin without `node:` fails
      // here too, as `unicorn/prefer-node-protocol` already fails it, and a file
      // Node cannot strip is the check's to report.
      const stripped = stripTypeScriptTypes(read(file));

      // Each reader parses the text itself; a few small files are parsed twice.
      const specifiers = runtimeSpecifiers(stripped);

      expect(commonJsLoaderLines(stripped)).toStrictEqual([]);

      // Each imports `node:*`, so an empty result means the scan read nothing.
      assert.isNotEmpty(specifiers);

      expect(
        specifiers.filter(
          (specifier) => specifier?.startsWith('node:') !== true,
        ),
      ).toStrictEqual([]);
    },
  );

  test.each(
    scriptsRunBeforeInstall.filter(
      (file) => !hasKey(RUNS_ON_PINNED_NODE, file),
    ),
  )(
    '%s uses no Temporal, which the minimum Node in node-support.json lacks',
    (file) => {
      expect(read(file)).not.toMatch(/\bTemporal\./u);
    },
  );

  test.each(scriptsRunBeforeInstall)(
    '%s neither disables nor configures a ts-data-forge rule inline (the override turns them off)',
    (file) => {
      const text = read(file);

      expect(text).not.toMatch(/eslint-disable[^\n]*ts-data-forge\//u);

      expect(text).not.toMatch(/\/\*\s*eslint\s[^*]*ts-data-forge\//u);
    },
  );
});

/**
 * The listed scripts that run only on the Node the repository pins
 * (`volta.node`), and so may use what the oldest supported Node lacks.
 */
const RUNS_ON_PINNED_NODE: ReadonlyRecord<string, string> = {
  'tools/scripts/cmd/mature-updates.mts':
    'Runs in pnpm-update.yml after the setup action has installed `volta.node`.',
} as const;

const read = (file: string): string =>
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a tracked file of the repository.
  fs.readFileSync(path.resolve(projectRootPath, file), 'utf8');
