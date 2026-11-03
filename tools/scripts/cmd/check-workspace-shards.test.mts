import {
  collectShardFamilies,
  findShardViolations,
  findShardsNotRun,
  parseShardCommand,
} from './check-workspace-shards.mjs';

describe('parseShardCommand', () => {
  test('reads the member script and the filters, quotes removed', () => {
    assert.deepStrictEqual(
      parseShardCommand(
        "node ./tools/scripts/cmd/assert-deps-built.mts --workspace && pnpm run --recursive --no-sort --if-present --filter='./apps/**' --filter=!task-manager fix:lint",
      ),
      {
        memberScript: 'fix:lint',
        filters: ['./apps/**', '!task-manager'],
      },
    );
  });

  test('stops at the first command after the recursive run', () => {
    assert.deepStrictEqual(
      parseShardCommand(
        'pnpm run --recursive --workspace-concurrency=1 --if-present --filter=ts-data-forge check:test:cov && pnpm run coverage:normalize-paths',
      ),
      {
        memberScript: 'check:test:cov',
        filters: ['ts-data-forge'],
      },
    );
  });

  test('reads `-r`, `pnpm -r run` and the spaced filter forms', () => {
    assert.deepStrictEqual(
      parseShardCommand('pnpm -r run --filter a -F !b --if-present fix:lint'),
      { memberScript: 'fix:lint', filters: ['a', '!b'] },
    );
  });

  test('is undefined for a workspace-root flag', () => {
    assert.isUndefined(
      parseShardCommand('pnpm run --recursive -w --filter=a fix:lint'),
    );
  });

  test('is undefined for a selector flag it does not read', () => {
    assert.isUndefined(
      parseShardCommand('pnpm run --recursive --filter-prod=a fix:lint'),
    );
  });

  test('is undefined for a command that runs nothing recursively', () => {
    assert.isUndefined(parseShardCommand('pnpm run lint && echo done'));
  });
});

describe('collectShardFamilies', () => {
  test('groups the `:shard-N` scripts by what precedes the suffix', () => {
    const families = collectShardFamilies({
      'ws:fix:lint': 'pnpm run --recursive fix:lint',
      'ws:fix:lint:shard-2':
        'pnpm run --recursive --filter=!a --filter=!b fix:lint',
      'ws:fix:lint:shard-1':
        'pnpm run --recursive --filter=a --filter=b fix:lint',
      'ws:check:e2e:shard-1': 'pnpm run --recursive --filter=a check:e2e',
      'ws:check:e2e:shard-2': 'pnpm run --recursive --filter=!a check:e2e',
      build: 'tsc',
    });

    assert.deepStrictEqual(families, [
      {
        family: 'ws:check:e2e',
        shards: [
          {
            scriptName: 'ws:check:e2e:shard-1',
            command: { memberScript: 'check:e2e', filters: ['a'] },
          },
          {
            scriptName: 'ws:check:e2e:shard-2',
            command: { memberScript: 'check:e2e', filters: ['!a'] },
          },
        ],
      },
      {
        family: 'ws:fix:lint',
        shards: [
          {
            scriptName: 'ws:fix:lint:shard-1',
            command: { memberScript: 'fix:lint', filters: ['a', 'b'] },
          },
          {
            scriptName: 'ws:fix:lint:shard-2',
            command: { memberScript: 'fix:lint', filters: ['!a', '!b'] },
          },
        ],
      },
    ]);
  });

  test('keeps a shard it cannot parse, so that it is reported', () => {
    const families = collectShardFamilies({
      'ws:x:shard-1': 'echo nothing',
    });

    assert.deepStrictEqual(families, [
      {
        family: 'ws:x',
        shards: [{ scriptName: 'ws:x:shard-1', command: undefined }],
      },
    ]);
  });
});

describe('findShardViolations', () => {
  const members = [
    { name: 'a', directory: 'libs/a', scripts: ['fix:lint'] },
    { name: 'b', directory: 'libs/b', scripts: ['fix:lint'] },
    { name: 'c', directory: 'apps/c', scripts: ['fix:lint'] },
    { name: 'd', directory: 'apps/d', scripts: [] },
  ] as const;

  const family = (
    filters: readonly (readonly string[])[],
    memberScript = 'fix:lint',
  ): Parameters<typeof findShardViolations>[0]['family'] =>
    ({
      family: 'ws:fix:lint',
      shards: filters.map((shardFilters, index) => ({
        scriptName: `ws:fix:lint:shard-${index + 1}`,
        command: { memberScript, filters: shardFilters },
      })),
    }) as const;

  test('accepts shards that select every member exactly once', () => {
    assert.deepStrictEqual(
      findShardViolations({
        family: family([['a'], ['!a', '!./apps/**'], ['./apps/**']]),
        members,
        selected: [['libs/a'], ['libs/b'], ['apps/c', 'apps/d']],
      }),
      [],
    );
  });

  test('reports a member no shard selects', () => {
    assert.deepStrictEqual(
      findShardViolations({
        family: family([['a'], ['./apps/**']]),
        members,
        selected: [['libs/a'], ['apps/c', 'apps/d']],
      }),
      ['ws:fix:lint: no shard runs `fix:lint` in libs/b'],
    );
  });

  test('reports a member two shards select', () => {
    assert.deepStrictEqual(
      findShardViolations({
        family: family([['a', 'c'], ['!a']]),
        members,
        selected: [
          ['libs/a', 'apps/c'],
          ['libs/b', 'apps/c', 'apps/d'],
        ],
      }),
      [
        'ws:fix:lint: `fix:lint` in apps/c runs in ws:fix:lint:shard-1 and ws:fix:lint:shard-2',
      ],
    );
  });

  test('ignores members without the script', () => {
    assert.deepStrictEqual(
      findShardViolations({
        family: family([['a', 'b'], ['c']]),
        members,
        selected: [['libs/a', 'libs/b'], ['apps/c']],
      }),
      [],
    );
  });

  test('reports a name filter that matches no member', () => {
    assert.deepStrictEqual(
      findShardViolations({
        family: family([
          ['a', 'b', 'c', 'gone'],
          ['!gone', '!a', '!b', '!c'],
        ]),
        members,
        selected: [['libs/a', 'libs/b', 'apps/c'], ['apps/d']],
      }),
      [
        'ws:fix:lint:shard-1: --filter=gone names no workspace member',
        'ws:fix:lint:shard-2: --filter=!gone names no workspace member',
      ],
    );
  });

  test('reports shards that run different member scripts', () => {
    assert.deepStrictEqual(
      findShardViolations({
        family: {
          family: 'ws:fix:lint',
          shards: [
            {
              scriptName: 'ws:fix:lint:shard-1',
              command: { memberScript: 'fix:lint', filters: [] },
            },
            {
              scriptName: 'ws:fix:lint:shard-2',
              command: { memberScript: 'check:lint', filters: [] },
            },
          ],
        },
        members,
        selected: [[], []],
      }),
      [
        'ws:fix:lint: the shards run different member scripts (fix:lint, check:lint)',
      ],
    );
  });

  test('reports a shard it could not parse', () => {
    assert.deepStrictEqual(
      findShardViolations({
        family: {
          family: 'ws:x',
          shards: [{ scriptName: 'ws:x:shard-1', command: undefined }],
        },
        members,
        selected: [[]],
      }),
      ['ws:x:shard-1: no `pnpm run --recursive <script>` to read'],
    );
  });
});

describe('findShardViolations, member script', () => {
  test('reports a member script no member defines', () => {
    assert.deepStrictEqual(
      findShardViolations({
        family: {
          family: 'ws:fix:lint',
          shards: [
            {
              scriptName: 'ws:fix:lint:shard-1',
              command: { memberScript: '1', filters: ['a'] },
            },
          ],
        },
        members: [{ name: 'a', directory: 'libs/a', scripts: ['fix:lint'] }],
        selected: [['libs/a']],
      }),
      [
        'ws:fix:lint: no workspace member defines `1`, the script its shards run',
      ],
    );
  });
});

describe('findShardsNotRun', () => {
  const families = [
    {
      family: 'ws:fix:lint',
      shards: [
        { scriptName: 'ws:fix:lint:shard-1', command: undefined },
        { scriptName: 'ws:fix:lint:shard-2', command: undefined },
      ],
    },
  ] as const;

  test('accepts a family one workflow runs whole', () => {
    assert.deepStrictEqual(
      findShardsNotRun(families, [
        {
          file: 'code-check.yml',
          commands: ['ws:fix:lint:shard-1', 'ws:fix:lint:shard-2'],
        },
        { file: 'other.yml', commands: ['check:root'] },
      ]),
      [],
    );
  });

  test('reports a shard no workflow runs, and the workflow that runs part', () => {
    assert.deepStrictEqual(
      findShardsNotRun(families, [
        { file: 'code-check.yml', commands: ['ws:fix:lint:shard-1'] },
      ]),
      [
        'ws:fix:lint:shard-2: no check workflow runs it',
        'code-check.yml: runs ws:fix:lint without ws:fix:lint:shard-2',
      ],
    );
  });
});
