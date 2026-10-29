import dedent from 'dedent';
import { Result } from 'ts-data-forge';
import { checkActionlint, type Probe, type Run } from './check-actionlint.mjs';

/** The part of code-check.yml the guard reads. */
const codeCheckWorkflow = dedent`
  - name: Install actionlint and shellcheck
    if: matrix.command == 'check:root'
    env:
      ACTIONLINT_VERSION: 1.7.12
      ACTIONLINT_SHA256: 8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8
      SHELLCHECK_VERSION: 0.11.0
      SHELLCHECK_SHA256: b7af85e41cc99489dcc21d66c6d5f3685138f06d34651e6d34b42ec6d54fe6f6
`;

const actionlintPrints = (version: string): string => dedent`
  ${version}
  installed by downloading from release page
  built with go1.26.1 compiler for linux/amd64
`;

const shellcheckPrints = (version: string): string => dedent`
  ShellCheck - shell script analysis tool
  version: ${version}
  license: GNU General Public License, version 3
  website: https://www.shellcheck.net
`;

/** A `PATH` with these outputs for `-version` / `--version`, or nothing. */
const pathWith =
  (
    outputs: Readonly<{
      actionlint?: string;
      shellcheck?: string;
    }>,
  ): Probe =>
  (command) =>
    command === 'actionlint'
      ? outputs.actionlint
      : command === 'shellcheck'
        ? outputs.shellcheck
        : undefined;

const pinnedPair = pathWith({
  actionlint: actionlintPrints('1.7.12'),
  shellcheck: shellcheckPrints('0.11.0'),
});

const exitWith =
  (status: number | null, signal: string | null = null): Run =>
  () =>
    ({ status, signal, error: undefined }) as const;

describe('checkActionlint', () => {
  test('passes with the pinned versions named when actionlint finds nothing', () => {
    const result = checkActionlint({
      probe: pinnedPair,
      run: exitWith(0),
      codeCheckWorkflow,
    });

    assert.isTrue(Result.isOk(result));

    assert.strictEqual(
      result.value,
      'Nothing to report (actionlint 1.7.12, shellcheck 0.11.0).',
    );
  });

  test('fails naming shellcheck, its pinned version and where to get it when only it is missing', () => {
    const run = vi.fn(exitWith(0));

    const result = checkActionlint({
      probe: pathWith({ actionlint: actionlintPrints('1.7.12') }),
      run,
      codeCheckWorkflow,
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      '  shellcheck  not found                     needs 0.11.0    https://github.com/koalaman/shellcheck/releases/tag/v0.11.0',
    );

    assert.notInclude(result.value, '  actionlint  ');

    // Without shellcheck, actionlint would pass what CI fails.
    expect(run).not.toHaveBeenCalled();
  });

  test('fails naming both when neither is installed', () => {
    const result = checkActionlint({
      probe: pathWith({}),
      run: exitWith(0),
      codeCheckWorkflow,
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      '  actionlint  not found                     needs 1.7.12    https://github.com/rhysd/actionlint/releases/tag/v1.7.12',
    );

    assert.include(result.value, '  shellcheck  not found');
  });

  test('refuses a version other than the pinned one, older or newer', () => {
    const run = vi.fn(exitWith(0));

    const result = checkActionlint({
      probe: pathWith({
        actionlint: actionlintPrints('1.7.13'),
        shellcheck: shellcheckPrints('0.9.0'),
      }),
      run,
      codeCheckWorkflow,
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, '  actionlint  found 1.7.13');

    assert.include(result.value, '  shellcheck  found 0.9.0');

    expect(run).not.toHaveBeenCalled();
  });

  test('accepts the `v` a `go install` build prints', () => {
    const result = checkActionlint({
      probe: pathWith({
        actionlint: actionlintPrints('v1.7.12'),
        shellcheck: shellcheckPrints('0.11.0'),
      }),
      run: exitWith(0),
      codeCheckWorkflow,
    });

    assert.isTrue(Result.isOk(result));
  });

  test('refuses a build that prints no version, and does not read the Go version as one', () => {
    const devel = checkActionlint({
      probe: pathWith({
        actionlint: actionlintPrints('(devel)'),
        shellcheck: shellcheckPrints('0.11.0'),
      }),
      run: exitWith(0),
      codeCheckWorkflow,
    });

    assert.isTrue(Result.isErr(devel));

    assert.include(devel.value, '  actionlint  found an unknown version');

    const silent = checkActionlint({
      probe: pathWith({
        actionlint: '',
        shellcheck: shellcheckPrints('0.11.0'),
      }),
      run: exitWith(0),
      codeCheckWorkflow,
    });

    assert.isTrue(Result.isErr(silent));

    assert.include(silent.value, '  actionlint  found an unknown version');
  });

  test.each([
    ["ACTIONLINT_VERSION: '1.7.12'"],
    ['ACTIONLINT_VERSION: "1.7.12"'],
    ['ACTIONLINT_VERSION: 1.7.12 # the comment a bump may leave'],
  ] as const)('reads the pin written as %s', (pin) => {
    const result = checkActionlint({
      probe: pinnedPair,
      run: exitWith(0),
      codeCheckWorkflow: codeCheckWorkflow.replace(
        'ACTIONLINT_VERSION: 1.7.12',
        () => pin,
      ),
    });

    assert.isTrue(Result.isOk(result));
  });

  test('fails when code-check.yml no longer pins a version where it is read', () => {
    const probe = vi.fn(pinnedPair);

    const run = vi.fn(exitWith(0));

    const result = checkActionlint({
      probe,
      run,
      codeCheckWorkflow: codeCheckWorkflow.replace(
        'SHELLCHECK_VERSION',
        'SHELLCHECK_RELEASE',
      ),
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'no longer pins shellcheck');

    assert.notInclude(result.value, 'pins actionlint');

    expect(probe).not.toHaveBeenCalled();

    expect(run).not.toHaveBeenCalled();
  });

  test('names the versions and the fix when actionlint reports findings', () => {
    const result = checkActionlint({
      probe: pinnedPair,
      run: exitWith(1),
      codeCheckWorkflow,
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      'actionlint reported the problems above (actionlint 1.7.12, shellcheck 0.11.0).',
    );

    assert.include(result.value, '# shellcheck disable=SC<number> # why');

    assert.include(result.value, 'bump it in code-check.yml');
  });

  test('does not read a bad option, a fatal error or a signal as findings', () => {
    const badOption = checkActionlint({
      probe: pinnedPair,
      run: exitWith(2),
      codeCheckWorkflow,
    });

    assert.isTrue(Result.isErr(badOption));

    assert.include(
      badOption.value,
      'stopped without a verdict (exit status 2;',
    );

    assert.notInclude(badOption.value, 'shellcheck disable');

    const fatal = checkActionlint({
      probe: pinnedPair,
      run: exitWith(3),
      codeCheckWorkflow,
    });

    assert.isTrue(Result.isErr(fatal));

    assert.include(
      fatal.value,
      'stopped without a verdict (exit status 3; actionlint 1.7.12, shellcheck 0.11.0)',
    );

    assert.notInclude(fatal.value, 'shellcheck disable');

    const killed = checkActionlint({
      probe: pinnedPair,
      run: exitWith(null, 'SIGINT'),
      codeCheckWorkflow,
    });

    assert.isTrue(Result.isErr(killed));

    assert.include(killed.value, '(signal SIGINT; actionlint 1.7.12');
  });

  test('reports a spawn error as such', () => {
    const result = checkActionlint({
      probe: pinnedPair,
      run: () =>
        ({
          status: null,
          signal: null,
          error: new Error('spawnSync actionlint EACCES'),
        }) as const,
      codeCheckWorkflow,
    });

    assert.isTrue(Result.isErr(result));

    assert.strictEqual(
      result.value,
      '❌ Could not run actionlint: spawnSync actionlint EACCES',
    );
  });
});
