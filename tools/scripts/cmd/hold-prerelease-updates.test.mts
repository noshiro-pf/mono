import { Arr } from 'ts-data-forge';
// cspell:ignore gpgsign
import dedent from 'dedent';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import type { ReadonlyRecord } from 'ts-type-forge';
import { runFile } from '../lib/child-process.mjs';
import {
  findPrereleaseMoves,
  holdPrereleaseUpdates,
  manifestGroups,
  parseSpecifier,
  rewriteJsonSpecifier,
  rewriteYamlSpecifier,
  stableSpecifierFor,
  workspaceGroups,
} from './hold-prerelease-updates.mjs';
import type { RegistryMetadata } from './mature-updates.mjs';

const day = 24 * 60 * 60 * 1000;

const now = Temporal.Instant.from('2026-11-16T07:00:00Z').epochMilliseconds;

const cutoff = now - 7 * day;

const daysAgo = (days: number): string =>
  Temporal.Instant.fromEpochMilliseconds(now - days * day).toString();

/** The registry as it stood when `@stylistic/eslint-plugin` 6.0.0 was new. */
const stylistic: RegistryMetadata = {
  versions: [
    '5.9.0',
    '5.10.0',
    '6.0.0-beta.5',
    '6.0.0-beta.6',
    '6.0.0',
    '6.0.1',
  ],
  time: {
    '5.9.0': daysAgo(270),
    '5.10.0': daysAgo(255),
    '6.0.0-beta.5': daysAgo(167),
    '6.0.0-beta.6': daysAgo(86),
    '6.0.0': daysAgo(2),
    '6.0.1': daysAgo(0),
  },
} as const;

const stylisticMove = {
  group: 'dependencies',
  name: '@stylistic/eslint-plugin',
  from: '^5.10.0',
  to: '^6.0.0-beta.6',
} as const;

// The fixtures below live in temporary directories this file makes.

const write = (file: string, content: string): void => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary fixture.
  fs.mkdirSync(path.dirname(file), { recursive: true });

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary fixture.
  fs.writeFileSync(file, content);
};

const read = (file: string): string =>
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary fixture.
  fs.readFileSync(file, 'utf8');

const gitIn = async (cwd: string, args: readonly string[]): Promise<void> => {
  const result = await runFile(
    'git',
    ['-c', 'commit.gpgsign=false', '-c', 'init.defaultBranch=main', ...args],
    {
      cwd,
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: 'test',
        GIT_AUTHOR_EMAIL: 'test@example.com',
        GIT_COMMITTER_NAME: 'test',
        GIT_COMMITTER_EMAIL: 'test@example.com',
      },
    },
  );

  expect(result.status, result.stderr).toBe(0);
};

/**
 * A repository whose `HEAD` has `before` and whose work tree has `after`, as
 * `update-packages` leaves it.
 */
const withUpdatedRepository = async (
  before: ReadonlyRecord<string, string>,
  after: ReadonlyRecord<string, string>,
  body: (repository: string) => Promise<void>,
): Promise<void> => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hold-prereleases-'));

  try {
    await gitIn(root, ['init', '--quiet']);

    for (const [file, content] of Object.entries(before)) {
      write(path.join(root, file), content);
    }

    await gitIn(root, ['add', '--all']);

    await gitIn(root, ['commit', '--quiet', '--message', 'before']);

    for (const [file, content] of Object.entries(after)) {
      write(path.join(root, file), content);
    }

    await body(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
};

const manifest = (dependencies: ReadonlyRecord<string, string>): string =>
  `${JSON.stringify({ name: 'p', dependencies }, undefined, 2)}\n` as const;

const workspaceWithCatalog = (eslint: string): string =>
  `packages:\n  - libs/*\n\ncatalog:\n  eslint: ${eslint}\n` as const;

const registry = (name: string): Promise<RegistryMetadata> =>
  Promise.resolve(
    name === 'eslint'
      ? {
          versions: ['10.13.0', '10.14.0', '11.0.0-rc.1', '11.0.0'],
          time: {
            '10.13.0': daysAgo(60),
            '10.14.0': daysAgo(10),
            '11.0.0-rc.1': daysAgo(20),
            '11.0.0': daysAgo(1),
          },
        }
      : stylistic,
  );

const flowCatalog = (eslint: string): string =>
  `catalog: { eslint: ${eslint} }\n` as const;

describe('parseSpecifier', () => {
  test.each([
    ['^5.10.0', { operator: '^', release: '5.10.0', prerelease: false }],
    ['~1.2.3', { operator: '~', release: '1.2.3', prerelease: false }],
    ['26.6.5', { operator: '', release: '26.6.5', prerelease: false }],
    ['^6.0.0-beta.6', { operator: '^', release: '6.0.0', prerelease: true }],
    ['1.0.0+build.1', { operator: '', release: '1.0.0', prerelease: false }],
  ] as const)('%s', (specifier, expected) => {
    expect(parseSpecifier(specifier)).toStrictEqual(expected);
  });

  test.each(['workspace:*', 'catalog:', '>=10.0.0', 'npm:react@^17.0.2', '*'])(
    '%s is not a range the update writes',
    (specifier) => {
      expect(parseSpecifier(specifier)).toBeUndefined();
    },
  );
});

describe('findPrereleaseMoves', () => {
  test('a stable range moved to a prerelease', () => {
    expect(
      findPrereleaseMoves(
        { dependencies: { '@stylistic/eslint-plugin': '^5.10.0' } },
        { dependencies: { '@stylistic/eslint-plugin': '^6.0.0-beta.6' } },
      ),
    ).toStrictEqual([stylisticMove]);
  });

  test('a stable move, an unchanged range and an added dependency are not moves', () => {
    expect(
      findPrereleaseMoves(
        { devDependencies: { a: '^1.0.0', b: '^2.0.0' } },
        { devDependencies: { a: '^1.1.0', b: '^2.0.0', c: '^3.0.0-rc.1' } },
      ),
    ).toStrictEqual([]);
  });

  test('a range already on a prerelease is left to whoever chose it', () => {
    expect(
      findPrereleaseMoves(
        { dependencies: { a: '^1.0.0-beta.1' } },
        { dependencies: { a: '^1.0.0-beta.2' } },
      ),
    ).toStrictEqual([]);
  });

  test('groups are compared with themselves only', () => {
    expect(
      findPrereleaseMoves(
        { peerDependencies: { a: '^1.0.0' } },
        {
          devDependencies: { a: '^2.0.0-rc.1' },
          peerDependencies: { a: '^1.0.0' },
        },
      ),
    ).toStrictEqual([]);
  });
});

describe('stableSpecifierFor', () => {
  test('back to the old range when no newer stable version is mature', () => {
    expect(stableSpecifierFor(stylisticMove, stylistic, cutoff)).toBe(
      '^5.10.0',
    );
  });

  test('the newest mature stable version, behind the new operator', () => {
    expect(
      stableSpecifierFor(
        { ...stylisticMove, from: '~5.9.0' },
        stylistic,
        cutoff,
      ),
    ).toBe('^5.10.0');
  });

  test('a new major once it is mature, over a newer prerelease', () => {
    expect(
      stableSpecifierFor(
        { group: 'catalog', name: 'x', from: '1.0.0', to: '2.1.0-beta.1' },
        {
          versions: ['1.0.0', '2.0.0', '2.1.0-beta.1', '2.1.0'],
          time: {
            '1.0.0': daysAgo(100),
            '2.0.0': daysAgo(30),
            '2.1.0-beta.1': daysAgo(20),
            '2.1.0': daysAgo(1),
          },
        },
        cutoff,
      ),
    ).toBe('2.0.0');
  });

  test('never a stable version above the prerelease, which `latest` does not name', () => {
    expect(
      stableSpecifierFor(
        stylisticMove,
        {
          versions: Arr.toPushed(stylistic.versions, '7.0.0'),
          time: { ...stylistic.time, '7.0.0': daysAgo(30) },
        },
        cutoff,
      ),
    ).toBe('^5.10.0');
  });
});

describe('rewriteJsonSpecifier', () => {
  test('the exact name and range, in the named field only', () => {
    const text = dedent`
      {
        "dependencies": {
          "@stylistic/eslint-plugin": "^6.0.0-beta.6",
          "@stylistic/eslint-plugin-x": "^6.0.0-beta.6"
        },
        "peerDependencies": {
          "@stylistic/eslint-plugin": "^6.0.0-beta.6"
        }
      }
    `;

    expect(
      rewriteJsonSpecifier(
        text,
        'dependencies',
        '@stylistic/eslint-plugin',
        '^6.0.0-beta.6',
        '^5.10.0',
      ),
    ).toBe(dedent`
      {
        "dependencies": {
          "@stylistic/eslint-plugin": "^5.10.0",
          "@stylistic/eslint-plugin-x": "^6.0.0-beta.6"
        },
        "peerDependencies": {
          "@stylistic/eslint-plugin": "^6.0.0-beta.6"
        }
      }
    `);
  });

  test('unchanged when the field or the entry is missing', () => {
    const text = '{\n  "dependencies": {\n    "a": "^1.0.0-rc.1"\n  }\n}';

    expect(
      rewriteJsonSpecifier(
        text,
        'devDependencies',
        'a',
        '^1.0.0-rc.1',
        '0.9.0',
      ),
    ).toBe(text);

    expect(
      rewriteJsonSpecifier(text, 'dependencies', 'b', '^1.0.0-rc.1', '0.9.0'),
    ).toBe(text);
  });
});

describe('rewriteYamlSpecifier', () => {
  const workspace = dedent`
    packages:
      - libs/*

    catalog:
      '@types/node': 27.0.0-rc.1 # why
      eslint: 11.0.0-rc.1
      eslint-x: 11.0.0-rc.1
      "vite": '9.0.0-beta.1'

    catalogs:
      # a comment
      next:
        eslint: 11.0.0-rc.1

    overrides:
      eslint: 11.0.0-rc.1
  `;

  test('quoted or not, with the comment kept, in the default catalog only', () => {
    expect(
      rewriteYamlSpecifier(
        rewriteYamlSpecifier(
          rewriteYamlSpecifier(
            workspace,
            'catalog',
            '@types/node',
            '27.0.0-rc.1',
            '26.6.5',
          ),
          'catalog',
          'eslint',
          '11.0.0-rc.1',
          '10.13.0',
        ),
        'catalog',
        'vite',
        '9.0.0-beta.1',
        '8.3.5',
      ),
    ).toBe(dedent`
      packages:
        - libs/*

      catalog:
        '@types/node': 26.6.5 # why
        eslint: 10.13.0
        eslint-x: 11.0.0-rc.1
        "vite": '8.3.5'

      catalogs:
        # a comment
        next:
          eslint: 11.0.0-rc.1

      overrides:
        eslint: 11.0.0-rc.1
    `);
  });

  test('in a named catalog only', () => {
    expect(
      rewriteYamlSpecifier(
        workspace,
        'catalogs.next',
        'eslint',
        '11.0.0-rc.1',
        '10.13.0',
      ),
    ).toBe(
      workspace.replace(
        '  next:\n    eslint: 11.0.0-rc.1',
        '  next:\n    eslint: 10.13.0',
      ),
    );
  });

  test('unchanged for a missing catalog, a top-level key or a mismatched quote', () => {
    expect(
      rewriteYamlSpecifier(
        workspace,
        'catalogs.missing',
        'eslint',
        '11.0.0-rc.1',
        '10.13.0',
      ),
    ).toBe(workspace);

    const text = dedent`
      catalog:
        vite: '9.0.0-beta.1
      vite: 9.0.0-beta.1
    `;

    expect(
      rewriteYamlSpecifier(text, 'catalog', 'vite', '9.0.0-beta.1', '8.3.5'),
    ).toBe(text);
  });
});

describe('groups', () => {
  test('manifestGroups reads the four dependency fields', () => {
    expect(
      manifestGroups(
        JSON.stringify({
          name: 'p',
          dependencies: { a: '^1.0.0' },
          devDependencies: { b: 'catalog:' },
        }),
      ),
    ).toStrictEqual({
      dependencies: { a: '^1.0.0' },
      devDependencies: { b: 'catalog:' },
      optionalDependencies: {},
      peerDependencies: {},
    });
  });

  test('workspaceGroups reads the default catalog and the named ones', () => {
    expect(
      workspaceGroups(dedent`
        packages:
          - libs/*
        catalog:
          eslint: 10.13.0
        catalogs:
          react17:
            react: 17.0.2
      `),
    ).toStrictEqual({
      catalog: { eslint: '10.13.0' },
      'catalogs.react17': { react: '17.0.2' },
    });
  });

  test('an unreadable file has no groups', () => {
    expect(manifestGroups('')).toStrictEqual({});

    expect(workspaceGroups(':\n:')).toStrictEqual({});
  });
});

describe('holdPrereleaseUpdates', () => {
  test('rewrites the moves in the root and a nested manifest and in the catalog, and nothing else', async () => {
    await withUpdatedRepository(
      {
        'libs/a/package.json': manifest({
          '@stylistic/eslint-plugin': '^5.10.0',
          other: '^1.0.0',
        }),
        'package.json': manifest({ '@stylistic/eslint-plugin': '^5.10.0' }),
        'pnpm-workspace.yaml': workspaceWithCatalog('10.13.0'),
      },
      {
        'libs/a/package.json': manifest({
          '@stylistic/eslint-plugin': '^6.0.0-beta.6',
          other: '^1.1.0',
        }),
        'package.json': manifest({
          '@stylistic/eslint-plugin': '^6.0.0-beta.6',
        }),
        'pnpm-workspace.yaml': workspaceWithCatalog('11.0.0-rc.1'),
      },
      async (root) => {
        const rewrites = await holdPrereleaseUpdates({
          root,
          cutoff,
          readMetadata: registry,
        });

        expect(
          rewrites.map(({ file, name, replacement }) => [
            file,
            name,
            replacement,
          ]),
        ).toStrictEqual([
          ['libs/a/package.json', '@stylistic/eslint-plugin', '^5.10.0'],
          ['package.json', '@stylistic/eslint-plugin', '^5.10.0'],
          ['pnpm-workspace.yaml', 'eslint', '10.14.0'],
        ]);

        expect(read(path.join(root, 'package.json'))).toBe(
          manifest({ '@stylistic/eslint-plugin': '^5.10.0' }),
        );

        expect(read(path.join(root, 'libs/a/package.json'))).toBe(
          manifest({ '@stylistic/eslint-plugin': '^5.10.0', other: '^1.1.0' }),
        );

        expect(read(path.join(root, 'pnpm-workspace.yaml'))).toBe(
          workspaceWithCatalog('10.14.0'),
        );
      },
    );
  });

  test('nothing to do when no range moved to a prerelease', async () => {
    await withUpdatedRepository(
      { 'package.json': manifest({ other: '^1.0.0' }) },
      { 'package.json': manifest({ other: '^1.1.0' }) },
      async (root) => {
        await expect(
          holdPrereleaseUpdates({ root, cutoff, readMetadata: registry }),
        ).resolves.toStrictEqual([]);
      },
    );
  });

  test('fails, writing nothing, rather than leave a move it cannot find to rewrite', async () => {
    const updatedManifest = manifest({
      '@stylistic/eslint-plugin': '^6.0.0-beta.6',
    });

    await withUpdatedRepository(
      {
        'package.json': manifest({ '@stylistic/eslint-plugin': '^5.10.0' }),
        'pnpm-workspace.yaml': flowCatalog('10.13.0'),
      },
      {
        'package.json': updatedManifest,
        'pnpm-workspace.yaml': flowCatalog('11.0.0-rc.1'),
      },
      async (root) => {
        await expect(
          holdPrereleaseUpdates({ root, cutoff, readMetadata: registry }),
        ).rejects.toThrow(/could not find eslint: 11\.0\.0-rc\.1 in catalog/u);

        expect(read(path.join(root, 'package.json'))).toBe(updatedManifest);
      },
    );
  });
});
