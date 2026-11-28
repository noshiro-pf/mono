import { Result } from 'ts-data-forge';
import {
  checkBenchmarkFreshness,
  judgeTree,
  readRecorded,
  releasesSynstate,
} from './check-synstate-benchmark-fresh.mjs';

const current = {
  node: '26.13.1',
  measuredCode: '0123456789abcdef',
  libraries: { rxjs: '7.8.2', mobx: '7.1.0' },
  libraryDependencies: { immer: '11.2.7' },
} as const;

describe('checkBenchmarkFreshness', () => {
  test('passes a release whose table matches the tree', () => {
    const result = checkBenchmarkFreshness({
      baseVersion: '10.0.0',
      version: '10.1.0',
      recorded: current,
      current,
    });

    assert.isTrue(Result.isOk(result));
  });

  test('holds a release whose table measured other code, without naming the digest to write', () => {
    const result = checkBenchmarkFreshness({
      baseVersion: '10.0.0',
      version: '10.0.1',
      recorded: { ...current, measuredCode: 'fedcba9876543210' },
      current,
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'has changed since');

    assert.notInclude(result.value, current.measuredCode);

    assert.include(result.value, 'synstate-benchmark.yml');
  });

  test('holds a release whose table records no digest', () => {
    const result = checkBenchmarkFreshness({
      baseVersion: '9.2.0',
      version: '10.0.0',
      recorded: { ...current, measuredCode: undefined },
      current,
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'records no digest');
  });

  test('names each library whose version moved, came or went', () => {
    const result = checkBenchmarkFreshness({
      baseVersion: '10.0.0',
      version: '10.0.1',
      recorded: {
        ...current,
        libraries: { rxjs: '7.8.1', jotai: '3.0.1' },
      },
      current,
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'rxjs: measured 7.8.1, installed 7.8.2');

    assert.include(result.value, 'mobx: measured none, installed 7.1.0');

    assert.include(result.value, 'jotai: measured 3.0.1, installed none');
  });

  test('holds a release whose libraries run on another version of a dependency', () => {
    const result = checkBenchmarkFreshness({
      baseVersion: '10.0.0',
      version: '10.0.1',
      recorded: { ...current, libraryDependencies: { immer: '11.2.6' } },
      current,
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'immer: measured 11.2.6, installed 11.2.7');
  });

  test('holds a release whose table records no dependency versions', () => {
    const result = checkBenchmarkFreshness({
      baseVersion: '10.0.0',
      version: '10.0.1',
      recorded: { ...current, libraryDependencies: undefined },
      current,
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'no versions of what the libraries run on');
  });
});

describe('checkBenchmarkFreshness on Node.js', () => {
  test('passes a table measured on another patch of the same major', () => {
    const result = checkBenchmarkFreshness({
      baseVersion: '10.0.0',
      version: '10.0.1',
      recorded: { ...current, node: 'v26.11.0' },
      current,
    });

    assert.isTrue(Result.isOk(result));
  });

  test('holds a table measured on another major', () => {
    const result = checkBenchmarkFreshness({
      baseVersion: '10.0.0',
      version: '10.0.1',
      recorded: { ...current, node: 'v24.9.0' },
      current,
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'Node.js: measured v24.9.0, set up 26.13.1');
  });

  test('holds a table that records no Node.js version', () => {
    const result = checkBenchmarkFreshness({
      baseVersion: '10.0.0',
      version: '10.0.1',
      recorded: { ...current, node: undefined },
      current,
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'records no Node.js version');
  });
});

describe('judgeTree', () => {
  const { node, ...measured } = current;

  const table = JSON.stringify({ environment: current });

  const staleTable = JSON.stringify({
    environment: { ...current, measuredCode: 'fedcba9876543210' },
  });

  const readNode = (): Promise<string> => Promise.resolve(node);

  const unreadable = Result.err(new Error('ENOENT'));

  test('fails a tree that does not release when the table cannot be read', async () => {
    const result = await judgeTree({
      baseVersion: '10.0.0',
      version: '10.0.0',
      table: unreadable,
      measured: Result.ok(measured),
      readNode,
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'update RESULTS_PATH');
  });

  test('fails a tree that does not release when the table is not valid JSON, without calling it moved', async () => {
    const result = await judgeTree({
      baseVersion: '10.0.0',
      version: '10.0.0',
      table: Result.ok('<<<<<<< HEAD'),
      measured: Result.ok(measured),
      readNode,
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'is not valid JSON');

    assert.notInclude(result.value, 'moved');
  });

  test('fails a tree that does not release when the inputs cannot be read, reporting the table too', async () => {
    const result = await judgeTree({
      baseVersion: '10.0.0',
      version: '10.0.0',
      table: unreadable,
      measured: Result.err(new Error('loads code of the repository lazily')),
      readNode,
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'update RESULTS_PATH');

    assert.include(result.value, 'loads code of the repository lazily');
  });

  test('passes a base without synstate, with a stale table', async () => {
    const result = await judgeTree({
      baseVersion: undefined,
      version: '10.0.0',
      table: Result.ok(staleTable),
      measured: Result.ok(measured),
      readNode,
    });

    assert.isTrue(Result.isOk(result));
  });

  test('passes a tree that does not release, with a stale table', async () => {
    const result = await judgeTree({
      baseVersion: '10.0.0',
      version: '10.0.0',
      table: Result.ok(staleTable),
      measured: Result.ok(measured),
      readNode,
    });

    assert.isTrue(Result.isOk(result));
  });

  test('holds a release with a stale table', async () => {
    const result = await judgeTree({
      baseVersion: '10.0.0',
      version: '10.1.0',
      table: Result.ok(staleTable),
      measured: Result.ok(measured),
      readNode,
    });

    assert.isTrue(Result.isErr(result));
  });

  test('passes a release with a table that matches the tree', async () => {
    const result = await judgeTree({
      baseVersion: '10.0.0',
      version: '10.1.0',
      table: Result.ok(table),
      measured: Result.ok(measured),
      readNode,
    });

    assert.isTrue(Result.isOk(result));
  });
});

describe('releasesSynstate', () => {
  test('a version the base does not have', () => {
    assert.isTrue(releasesSynstate('10.0.0', '10.0.1'));
  });

  test('not the version the base has', () => {
    assert.isFalse(releasesSynstate('10.0.0', '10.0.0'));
  });

  test('not a version below the base, as a revert leaves', () => {
    assert.isFalse(releasesSynstate('9.3.0', '9.2.0'));

    assert.isFalse(releasesSynstate('10.0.0', '9.10.0'));
  });

  test('a minor compared as a number', () => {
    assert.isTrue(releasesSynstate('9.9.0', '9.10.0'));
  });

  test('a prerelease leaving for its release', () => {
    assert.isTrue(releasesSynstate('10.0.0-next.1', '10.0.0'));
  });

  test('not a prerelease below the base', () => {
    assert.isFalse(releasesSynstate('10.2.0', '10.2.0-next.1'));

    assert.isFalse(releasesSynstate('10.2.0-next.2', '10.2.0-next.1'));

    assert.isFalse(releasesSynstate('10.2.0-next.10', '10.2.0-next.9'));
  });

  test('a later prerelease', () => {
    assert.isTrue(releasesSynstate('10.2.0-next.9', '10.2.0-next.10'));

    assert.isTrue(releasesSynstate('10.2.0-next', '10.2.0-next.0'));

    assert.isTrue(releasesSynstate('10.2.0-1', '10.2.0-alpha'));
  });

  test('not build metadata alone', () => {
    assert.isFalse(releasesSynstate('1.0.0', '1.0.0+x'));
  });

  test('long numeric prerelease identifiers that differ past 2 ** 53', () => {
    assert.isTrue(
      releasesSynstate(
        '1.0.0-20261127000000000001',
        '1.0.0-20261127000000000002',
      ),
    );
  });

  test('long core numbers that differ past 2 ** 53', () => {
    assert.isTrue(
      releasesSynstate('1.0.9007199254740992', '1.0.9007199254740993'),
    );
  });

  test('prerelease identifiers that differ only by a leading zero', () => {
    assert.isTrue(releasesSynstate('1.0.0-rc.01.5', '1.0.0-rc.1.6'));
  });

  test('an empty prerelease identifier', () => {
    assert.isTrue(releasesSynstate('1.0.0-a.b', '1.0.0-a..b'));
  });

  test('a version it does not parse', () => {
    assert.isTrue(releasesSynstate('10.0.0', 'latest'));
  });
});

describe('readRecorded', () => {
  test('names the table when it is not valid JSON', () => {
    assert.throws(
      () => readRecorded('<<<<<<< HEAD'),
      /^apps\/synstate-docs\/src\/data\/benchmark-results\.json is not valid JSON: /u,
    );
  });

  test('reads what the runner writes', () => {
    assert.deepStrictEqual(
      readRecorded(
        JSON.stringify({
          environment: { runner: 'github-actions', ...current },
          scenarios: {},
        }),
      ),
      current,
    );
  });

  test('reads a table measured before the record as missing it', () => {
    assert.deepStrictEqual(
      readRecorded(
        JSON.stringify({ environment: { libraries: { rxjs: '7.8.2' } } }),
      ),
      {
        node: undefined,
        measuredCode: undefined,
        libraries: { rxjs: '7.8.2' },
        libraryDependencies: undefined,
      },
    );
  });

  test.each([
    ['no environment', {}],
    ['an environment that is not an object', { environment: 'x' }],
    ['a file that is not an object', []],
  ] as const)('reads %s as recording nothing', (_, content) => {
    assert.deepStrictEqual(readRecorded(JSON.stringify(content)), {
      node: undefined,
      measuredCode: undefined,
      libraries: {},
      libraryDependencies: undefined,
    });
  });

  test('leaves out a version that is not a string', () => {
    assert.deepStrictEqual(
      readRecorded(
        JSON.stringify({
          environment: {
            measuredCode: 1,
            libraries: { rxjs: 7, mobx: '7.1.0' },
          },
        }),
      ).libraries,
      { mobx: '7.1.0' },
    );
  });
});
