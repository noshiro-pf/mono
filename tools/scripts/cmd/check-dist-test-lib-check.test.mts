import dedent from 'dedent';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  findDistTestConfigs,
  findSkipLibCheckConfigs,
} from './check-dist-test-lib-check.mjs';

describe(findDistTestConfigs, () => {
  test('lists the tsconfig files under a package’s test/dist_', () => {
    assert.deepStrictEqual(
      findDistTestConfigs([
        'libs/a/package.json',
        'libs/a/test/dist_/named/named-import.mts',
        'libs/a/test/dist_/named/tsconfig.json',
        'libs/a/test/dist_/emit/tsconfig.emitted.json',
        'libs/a/test/tsconfig.json',
        'libs/a/tsconfig.json',
        'libs/b/test/dist_/tsconfig.base.json',
        'tools/configs/tsconfig.tsx.json',
      ]),
      [
        'libs/a/test/dist_/named/tsconfig.json',
        'libs/a/test/dist_/emit/tsconfig.emitted.json',
        'libs/b/test/dist_/tsconfig.base.json',
      ],
    );
  });
});

describe(findSkipLibCheckConfigs, () => {
  const OWN = 'libs/own/test/dist_/named/tsconfig.json';

  const INHERITED = 'libs/inherited/test/dist_/named/tsconfig.json';

  const CLEAN = 'libs/clean/test/dist_/named/tsconfig.json';

  const MISTYPED = 'libs/mistyped/test/dist_/named/tsconfig.json';

  const MISTYPED_BELOW = 'libs/mistyped-below/test/dist_/named/tsconfig.json';

  test('reports a config that sets the option itself or through `extends`, and no other', async () => {
    await withFixture(
      {
        [OWN]: dedent`
          {
            "compilerOptions": {
              "noEmit": true,
              // A comment, as these files have.
              "skipLibCheck": true
            },
            "include": ["./*.mts"]
          }
        `,
        'configs/base.json': dedent`
          { "compilerOptions": { "skipLibCheck": true } }
        `,
        [INHERITED]: dedent`
          {
            "extends": "../../../../../configs/base.json",
            "compilerOptions": { "noEmit": true },
            "include": ["./*.mts"]
          }
        `,
        [CLEAN]: dedent`
          {
            "compilerOptions": {
              "noEmit": true
              // "skipLibCheck": true
            },
            "include": ["./*.mts"]
          }
        `,
      },
      (root) => {
        assert.deepStrictEqual(
          findSkipLibCheckConfigs(root, [OWN, INHERITED, CLEAN]),
          [
            { relativePath: OWN, problem: 'set' },
            { relativePath: INHERITED, problem: 'inherited' },
          ],
        );
      },
    );
  });

  test('reads the options of a config whose list of files is of the wrong type', async () => {
    // tsc drops such a `files`, `include` or `exclude` with a TS5024, which
    // leaves the options as written.
    await withFixture(
      {
        [OWN]: dedent`
          {
            "compilerOptions": { "skipLibCheck": true },
            "include": "./*.mts"
          }
        `,
        [CLEAN]: dedent`
          {
            "compilerOptions": { "noEmit": true },
            "files": "./a.mts",
            "exclude": 3
          }
        `,
      },
      (root) => {
        assert.deepStrictEqual(findSkipLibCheckConfigs(root, [OWN, CLEAN]), [
          { relativePath: OWN, problem: 'set' },
        ]);
      },
    );
  });

  test('accepts a config that turns an inherited option back off', async () => {
    await withFixture(
      {
        'configs/base.json': dedent`
          { "compilerOptions": { "skipLibCheck": true } }
        `,
        [INHERITED]: dedent`
          {
            "extends": "../../../../../configs/base.json",
            "compilerOptions": { "skipLibCheck": false }
          }
        `,
      },
      (root) => {
        assert.deepStrictEqual(findSkipLibCheckConfigs(root, [INHERITED]), []);
      },
    );
  });

  test('reports a config whose options cannot be read', async () => {
    await withFixture(
      {
        [OWN]: '{ "compilerOptions": ',
        [INHERITED]: dedent`
          { "extends": "./missing.json", "compilerOptions": {} }
        `,
        'configs/base.json': dedent`
          { "compilerOptions": { "skipLibCheck": true } }
        `,
        [MISTYPED]: dedent`
          {
            "extends": { "path": "../../../../../configs/base.json" },
            "compilerOptions": {}
          }
        `,
        // The same one config away: tsc drops the `extends` of the config this
        // one extends, and with it the option.
        'configs/mistyped.json': dedent`
          { "extends": { "path": "./base.json" } }
        `,
        [MISTYPED_BELOW]: dedent`
          {
            "extends": "../../../../../configs/mistyped.json",
            "compilerOptions": {}
          }
        `,
      },
      (root) => {
        const found = findSkipLibCheckConfigs(root, [
          OWN,
          INHERITED,
          CLEAN,
          MISTYPED,
          MISTYPED_BELOW,
        ]);

        assert.deepStrictEqual(
          found.map(({ relativePath, problem }) => ({ relativePath, problem })),
          [
            { relativePath: OWN, problem: 'unreadable' },
            { relativePath: INHERITED, problem: 'unreadable' },
            // Not in this fixture at all.
            { relativePath: CLEAN, problem: 'unreadable' },
            { relativePath: MISTYPED, problem: 'unreadable' },
            { relativePath: MISTYPED_BELOW, problem: 'unreadable' },
          ],
        );

        for (const { detail } of found) {
          assert.isString(detail);
        }
      },
    );
  });
});

const withFixture = async (
  files: ReadonlyRecord<string, string>,
  run: (root: string) => void,
): Promise<void> => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'dist-lib-check-'));

  try {
    for (const [file, content] of Object.entries(files)) {
      const absolute = path.join(dir, file);

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- under a fresh temporary directory
      await fs.mkdir(path.dirname(absolute), { recursive: true });

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- under a fresh temporary directory
      await fs.writeFile(absolute, content);
    }

    run(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
};
