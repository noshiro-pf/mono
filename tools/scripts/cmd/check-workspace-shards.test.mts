import {
  findShardViolations,
  groupFamilies,
  readFilteredRuns,
} from './check-workspace-shards.mjs';

const guard = 'node ./tools/scripts/cmd/assert-deps-built.mts --workspace';

describe('readFilteredRuns', () => {
  test('reads the filters and the target of each filtered run', () => {
    expect(
      readFilteredRuns({
        'ws:check:test': `${guard} && pnpm run --recursive --if-present check:test`,
        'ws:check:test:shard-1': `${guard} && pnpm run --recursive --workspace-concurrency=1 --if-present --filter=a -F b check:test`,
        'ws:check:test:shard-2': `${guard} && pnpm run --recursive --workspace-concurrency 4 --if-present --filter=!a --filter '!b' check:test && pnpm run coverage:normalize-paths`,
        'ws:fix:lint:apps':
          "pnpm -C . --filter='./apps/**' -r run --no-sort fix:lint",
        'update-packages': "pnpm update --latest --recursive --filter '!./x'",
        'run-by-name': 'pnpm run --filter=a build',
      }),
    ).toStrictEqual([
      {
        scriptName: 'ws:check:test:shard-1',
        target: 'check:test',
        filters: ['a', 'b'],
      },
      {
        scriptName: 'ws:check:test:shard-2',
        target: 'check:test',
        filters: ['!a', '!b'],
      },
      {
        scriptName: 'ws:fix:lint:apps',
        target: 'fix:lint',
        filters: ['./apps/**'],
      },
      { scriptName: 'run-by-name', target: 'build', filters: ['a'] },
    ]);
  });

  test('reads what follows the script name as its arguments, not filters', () => {
    expect(
      readFilteredRuns({
        'x:one': 'pnpm run -r --filter="a" check:test --filter=b',
        'x:all': 'pnpm run -r check:test --filter=b',
      }),
    ).toStrictEqual([
      { scriptName: 'x:one', target: 'check:test', filters: ['a'] },
    ]);
  });

  // Read as the other guards read a script (`readShellCommands`,
  // `readPnpmRun`), so that no shard is read one way here and another there.
  test('reads a script body as the shell does', () => {
    expect(
      readFilteredRuns({
        'x:env': 'CI=1 pnpm run -r --filter=a t',
        'x:alias': 'pnpm --filter=b run-script t',
        'x:quoted': "echo 'a && pnpm run --filter=c t'",
      }),
    ).toStrictEqual([
      { scriptName: 'x:env', target: 't', filters: ['a'] },
      { scriptName: 'x:alias', target: 't', filters: ['b'] },
    ]);
  });

  test('reads `--filter=` with nothing after it as an empty selector', () => {
    expect(
      readFilteredRuns({ 'x:one': 'pnpm run -r --filter= t' }),
    ).toStrictEqual([{ scriptName: 'x:one', target: 't', filters: [''] }]);
  });
});

describe('groupFamilies', () => {
  test('groups by the target and every segment of the name but the last', () => {
    const families = groupFamilies([
      {
        scriptName: 'ws:check:test:shard-1',
        target: 'check:test',
        filters: ['a'],
      },
      { scriptName: 'ws:other:shard-1', target: 'check:test', filters: ['a'] },
      {
        scriptName: 'ws:check:test:shard-2',
        target: 'check:test',
        filters: ['!a'],
      },
      { scriptName: 'ws:check:test:cov', target: 'check:cov', filters: ['a'] },
    ]);

    expect(
      families.map(({ label, runs }) => [
        label,
        runs.map(({ scriptName }) => scriptName),
      ]),
    ).toStrictEqual([
      [
        '`ws:check:test:*` (`check:test`)',
        ['ws:check:test:shard-1', 'ws:check:test:shard-2'],
      ],
      ['`ws:other:*` (`check:test`)', ['ws:other:shard-1']],
      ['`ws:check:test:*` (`check:cov`)', ['ws:check:test:cov']],
    ]);
  });
});

describe('findShardViolations', () => {
  const packageNames = new Set<string>(['a', 'b', 'c']);

  const check = (
    runs: readonly Readonly<{ name: string; filters: readonly string[] }>[],
  ): readonly string[] =>
    findShardViolations(
      groupFamilies(
        runs.map(({ name, filters }) => ({
          scriptName: `s:${name}`,
          target: 't',
          filters,
        })),
      ),
      packageNames,
    );

  test('accepts shards that partition the workspace', () => {
    expect(
      check([
        { name: 'one', filters: ['a'] },
        { name: 'two', filters: ['b', './apps/**'] },
        { name: 'rest', filters: ['!a', '!b', '!./apps/**'] },
      ]),
    ).toStrictEqual([]);
  });

  test('reports a package no shard runs', () => {
    expect(
      check([
        { name: 'one', filters: ['a'] },
        { name: 'rest', filters: ['!a', '!b'] },
      ]),
    ).toStrictEqual([
      '`s:*` (`t`): `s:rest` excludes b, which no other shard runs.',
    ]);
  });

  test('reports a package two shards run', () => {
    expect(
      check([
        { name: 'one', filters: ['a', 'b'] },
        { name: 'rest', filters: ['!a'] },
      ]),
    ).toStrictEqual([
      '`s:*` (`t`): `s:one` runs b, which `s:rest` does not exclude, so it runs twice.',
    ]);
  });

  test('reports a package named by two including shards', () => {
    expect(
      check([
        { name: 'one', filters: ['a'] },
        { name: 'two', filters: ['a'] },
        { name: 'rest', filters: ['!a'] },
      ]),
    ).toStrictEqual([
      '`s:*` (`t`): a is run by more than one shard (`s:one`, `s:two`).',
    ]);
  });

  test('reports a family with no shard for the rest, or more than one', () => {
    expect(check([{ name: 'one', filters: ['a'] }])).toStrictEqual([
      '`s:*` (`t`): no shard runs the rest of the workspace (one whose filters are all `!` exclusions), so a package none names runs nowhere. Restore the shard that runs the rest; only a run that was never part of a split belongs in NOT_SHARDS in check-workspace-shards.mts, with the reason.',
    ]);

    expect(
      check([
        { name: 'rest-1', filters: ['!a'] },
        { name: 'rest-2', filters: ['!a'] },
        { name: 'one', filters: ['a'] },
      ]),
    ).toStrictEqual([
      '`s:*` (`t`): `s:rest-1`, `s:rest-2` each run the rest of the workspace, so whatever neither excludes runs twice.',
    ]);
  });

  test('reports a shard that mixes inclusions and exclusions', () => {
    expect(
      check([
        { name: 'mixed', filters: ['a', '!b'] },
        { name: 'rest', filters: ['!a'] },
      ]),
    ).toStrictEqual([
      '`s:*` (`t`): `s:mixed` mixes inclusions and `!` exclusions; a shard is either a list of what it runs or the rest.',
    ]);
  });

  test('reports an unknown package, an empty selector and a repeated filter', () => {
    expect(
      check([
        { name: 'one', filters: ['gone', 'a', ''] },
        { name: 'rest', filters: ['!gone', '!a', '!a'] },
      ]),
    ).toStrictEqual([
      '`s:*` (`t`): `s:one` names gone, which is not a workspace package.',
      '`s:*` (`t`): `s:one` has a filter with no selector.',
      '`s:*` (`t`): `s:rest` names gone, which is not a workspace package.',
      '`s:*` (`t`): `s:rest` names !a twice.',
    ]);
  });
});
