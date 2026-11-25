import dedent from 'dedent';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  findDistTestConfigs,
  findDomLibConfigs,
  findSkipLibCheckConfigs,
  findUndeclaredTypes,
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

describe(findUndeclaredTypes, () => {
  test('reports every entry but the package itself or a subpath of it', async () => {
    await withFixture(
      {
        'libs/node/package.json': manifest(
          ', "dependencies": { "@types/node": "*" }',
        ),
        [at('node')]: config(', "types": ["node"]'),
        'libs/own/package.json': manifest(''),
        [at('own')]: config(', "types": ["pkg", "pkg/global", "pkg/a/b"]'),
        'libs/empty/package.json': manifest(''),
        [at('empty')]: config(', "types": []'),
        'libs/unstated/package.json': manifest(''),
        [at('unstated')]: config(''),
        'libs/other/package.json': manifest(''),
        [at('other')]: config(
          ', "types": ["*", "./ambient", "pkg-other", "@pkg/x", "pkg/"]',
        ),
        'libs/escape/package.json': manifest(''),
        [at('escape')]: config(
          String.raw`, "types": ["pkg/../x", "pkg/./x", "pkg/a\\..\\..\\x"]`,
        ),
      },
      (root) => {
        assert.deepStrictEqual(
          findUndeclaredTypes(root, [
            at('node'),
            at('own'),
            at('empty'),
            at('unstated'),
            at('other'),
            at('escape'),
          ]),
          [
            { relativePath: at('node'), undeclared: ['node'] },
            {
              relativePath: at('other'),
              undeclared: ['*', './ambient', 'pkg-other', '@pkg/x', 'pkg/'],
            },
            {
              relativePath: at('escape'),
              undeclared: ['pkg/../x', 'pkg/./x', String.raw`pkg/a\..\..\x`],
            },
          ],
        );
      },
    );
  });

  test('reads `types` through `extends`', async () => {
    await withFixture(
      {
        'configs/base.json': dedent`
          { "compilerOptions": { "types": ["node"] } }
        `,
        'libs/inherited/package.json': manifest(''),
        [at('inherited')]: dedent`
          { "extends": "../../../../../configs/base.json", "compilerOptions": {} }
        `,
      },
      (root) => {
        assert.deepStrictEqual(findUndeclaredTypes(root, [at('inherited')]), [
          { relativePath: at('inherited'), undeclared: ['node'] },
        ]);
      },
    );
  });

  test('reports every entry when the package has no readable name', async () => {
    await withFixture(
      {
        'libs/nameless/package.json': '{}',
        [at('nameless')]: config(', "types": ["pkg/global"]'),
      },
      (root) => {
        assert.deepStrictEqual(findUndeclaredTypes(root, [at('nameless')]), [
          {
            relativePath: at('nameless'),
            undeclared: ['pkg/global'],
            namelessManifest: 'libs/nameless/package.json',
          },
        ]);
      },
    );
  });
});

describe(findDomLibConfigs, () => {
  test('reports a config that loads DOM, by `lib` or by stating none, for a package not listed', async () => {
    await withFixture(
      {
        'libs/esnext/package.json': manifest(''),
        [at('esnext')]: config(', "lib": ["ESNext"]'),
        'libs/dom/package.json': manifest(''),
        [at('dom')]: config(', "lib": ["ESNext", "DOM"]'),
        'libs/iterable/package.json': manifest(''),
        [at('iterable')]: config(', "lib": ["ESNext", "DOM.Iterable"]'),
        'libs/unstated/package.json': manifest(''),
        [at('unstated')]: config(''),
      },
      (root) => {
        assert.deepStrictEqual(
          findDomLibConfigs(
            root,
            [at('esnext'), at('dom'), at('iterable'), at('unstated')],
            new Map<string, string>(),
          ),
          {
            unlisted: [
              { relativePath: at('dom'), packageName: 'pkg' },
              { relativePath: at('iterable'), packageName: 'pkg' },
              { relativePath: at('unstated'), packageName: 'pkg' },
            ],
            stale: [],
          },
        );
      },
    );
  });

  test('passes a package listed, and names one listed that no longer does', async () => {
    await withFixture(
      {
        'libs/dom/package.json': dedent`{ "name": "uses-dom" }`,
        [at('dom')]: config(', "lib": ["ESNext", "DOM"]'),
        'libs/esnext/package.json': dedent`{ "name": "was-dom" }`,
        [at('esnext')]: config(', "lib": ["ESNext"]'),
      },
      (root) => {
        assert.deepStrictEqual(
          findDomLibConfigs(
            root,
            [at('dom'), at('esnext')],
            new Map<string, string>([
              ['uses-dom', 'a reason'],
              ['was-dom', 'a reason'],
              ['gone', 'a reason'],
            ]),
          ),
          { unlisted: [], stale: ['was-dom', 'gone'] },
        );
      },
    );
  });

  test('reads `lib` through `extends`', async () => {
    await withFixture(
      {
        'configs/base.json': dedent`
          { "compilerOptions": { "lib": ["ESNext", "DOM"] } }
        `,
        'libs/inherited/package.json': manifest(''),
        [at('inherited')]: dedent`
          { "extends": "../../../../../configs/base.json", "compilerOptions": {} }
        `,
      },
      (root) => {
        assert.deepStrictEqual(
          findDomLibConfigs(root, [at('inherited')], new Map<string, string>())
            .unlisted,
          [{ relativePath: at('inherited'), packageName: 'pkg' }],
        );
      },
    );
  });
});

const config = (types: string): string => dedent`
  { "compilerOptions": { "noEmit": true${types} }, "include": ["./*.mts"] }
`;

const manifest = (fields: string): string => dedent`
  { "name": "pkg"${fields} }
`;

const at = (name: string): string =>
  `libs/${name}/test/dist_/named/tsconfig.json` as const;

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
