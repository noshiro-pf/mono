import { optionValues, readPnpmRun, readRunAll } from './pnpm-command.mjs';

describe('readPnpmRun', () => {
  test('a plain run names the root script and its arguments', () => {
    assert.deepStrictEqual(
      readPnpmRun(['pnpm', 'run', 'gen:report', '--dir', 'out']),
      {
        script: 'gen:report',
        args: ['--dir', 'out'],
        filters: [],
        recursive: false,
        workspaceRoot: false,
        directory: undefined,
      },
    );
  });

  test('flags before the script are pnpm’s, a value taken with its flag', () => {
    assert.deepStrictEqual(
      readPnpmRun([
        'pnpm',
        '--reporter',
        'append-only',
        'run',
        '-r',
        '--workspace-concurrency',
        '1',
        '--if-present',
        'check:test',
      ]),
      {
        script: 'check:test',
        args: [],
        filters: [],
        recursive: true,
        workspaceRoot: false,
        directory: undefined,
      },
    );
  });

  test('reads the filters and the directory, before `run` or after it', () => {
    assert.deepStrictEqual(
      readPnpmRun([
        'pnpm',
        '--filter',
        '@synstate/docs',
        'run',
        '--filter=!x',
        '-F',
        'y',
        '--silent',
        'z:benchmark:check-drift',
        '--strict',
      ]),
      {
        script: 'z:benchmark:check-drift',
        args: ['--strict'],
        filters: ['@synstate/docs', '!x', 'y'],
        recursive: false,
        workspaceRoot: false,
        directory: undefined,
      },
    );

    assert.deepStrictEqual(
      readPnpmRun(['pnpm', '-C', 'apps/x', 'run', 'build']),
      {
        script: 'build',
        args: [],
        filters: [],
        recursive: false,
        workspaceRoot: false,
        directory: 'apps/x',
      },
    );

    assert.deepStrictEqual(
      readPnpmRun(['pnpm', '--dir=.', 'run', 'x'])?.directory,
      '.',
    );
  });

  test('is no run for another pnpm command, or a run with no script', () => {
    for (const words of [
      ['pnpm', 'install', '--frozen-lockfile'],
      ['pnpm', 'exec', 'vitest', 'run'],
      ['pnpm', '--filter', 'run', 'install'],
      ['pnpm', 'run'],
      ['npm', 'run', 'x'],
    ] as const) {
      assert.isUndefined(readPnpmRun(words));
    }
  });

  test('`-w` sends the run to the workspace root', () => {
    assert.strictEqual(
      readPnpmRun(['pnpm', '-w', 'run', 'x'])?.workspaceRoot,
      true,
    );
  });

  test('`run-script` is `run`', () => {
    assert.strictEqual(readPnpmRun(['pnpm', 'run-script', 'x'])?.script, 'x');
  });
});

describe('readRunAll', () => {
  test('reads the scripts a list runs', () => {
    assert.deepStrictEqual(
      readRunAll(['run-s', '--continue-on-error', 'gen:index', 'gen:readme']),
      { scripts: ['gen:index', 'gen:readme'], withArguments: [] },
    );
  });

  // npm-run-all reads a quoted entry as a script and its arguments.
  test('a quoted entry with arguments is a script run with arguments', () => {
    assert.deepStrictEqual(
      readRunAll(['run-s', 'check:md', 'gen:x -- --all']),
      { scripts: ['check:md'], withArguments: ['gen:x'] },
    );
  });

  test('the value of a flag that takes one is no script', () => {
    assert.deepStrictEqual(
      readRunAll([
        'run-p',
        '--max-parallel',
        '2',
        '--npm-path',
        'pnpm',
        '-l',
        'a',
        'b',
      ]),
      { scripts: ['a', 'b'], withArguments: [] },
    );
  });

  test('is nothing for another program', () => {
    assert.isUndefined(readRunAll(['pnpm', 'run', 'x']));
  });
});

describe('optionValues', () => {
  test('reads `--flag value` and `--flag=value`, of the flags named', () => {
    assert.deepStrictEqual(
      optionValues(
        ['--build', 'b', '--command=c', '--other', 'o'],
        new Set<string>(['--build', '--command']),
      ),
      ['b', 'c'],
    );
  });
});
