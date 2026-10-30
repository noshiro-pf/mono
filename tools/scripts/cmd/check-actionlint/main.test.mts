import dedent from 'dedent';
import { Arr, Result } from 'ts-data-forge';
import type { ReleaseBinaryPin } from '../../lib/release-binaries.mjs';
import {
  checkActionlint,
  wrapInWorkflow,
  type Install,
  type LintWorkflowText,
  type RunActionlint,
} from './main.mjs';

const pin = (version: string): ReleaseBinaryPin =>
  ({
    repository: 'owner/tool',
    version,
    binary: 'tool',
    assets: {},
  }) as const;

const pins = {
  actionlint: pin('1.7.12'),
  shellcheck: pin('0.11.0'),
} as const;

const installed: Install = (name) =>
  Promise.resolve(Result.ok(`/cache/bin/${name}`));

const runsFine = (): undefined => undefined;

const actionlintExits =
  (status: number | null, signal: string | null = null): RunActionlint =>
  () =>
    ({ status, signal, error: undefined }) as const;

/** actionlint over the wrapped composite scripts, answering `reports`. */
const compositeReports =
  (reports: readonly unknown[]): LintWorkflowText =>
  (_actionlint, _shellcheck, workflow) =>
    ({
      workflow,
      status: Arr.isEmpty(reports) ? (0 as const) : (1 as const),
      stdout: JSON.stringify(reports),
      stderr: '',
      error: undefined,
    }) as const;

const setupAction = {
  path: '.github/actions/setup/action.yml',
  text: dedent`
    name: Set up
    runs:
      using: composite
      steps:
        - name: Install pnpm
          uses: pnpm/action-setup@ea17c68df8912ef543352723c149a84f56e3d413 # v6.1.0

        - name: Install dependencies
          shell: bash
          env:
            INSTALL: \${{ inputs.install }}
          run: node ./tools/scripts/cmd/workflow-steps.mts install
  `,
} as const;

describe('checkActionlint', () => {
  test('passes and names the pinned versions when nothing is found', async () => {
    const runActionlint = vi.fn(actionlintExits(0));

    const lintWorkflowText = vi.fn(compositeReports([]));

    const result = await checkActionlint({
      pins,
      install: installed,
      tryRunning: runsFine,
      runActionlint,
      compositeActions: [setupAction],
      lintWorkflowText,
    });

    assert.isTrue(Result.isOk(result));

    assert.strictEqual(
      result.value,
      'Nothing to report in the workflows or in 1 composite-action run script (actionlint 1.7.12, shellcheck 0.11.0).',
    );

    // actionlint is handed the pinned shellcheck, not whatever PATH has.
    expect(runActionlint).toHaveBeenCalledExactlyOnceWith(
      '/cache/bin/actionlint',
      '/cache/bin/shellcheck',
    );

    expect(lintWorkflowText).toHaveBeenCalledExactlyOnceWith(
      '/cache/bin/actionlint',
      '/cache/bin/shellcheck',
      wrapInWorkflow(
        [
          {
            line: 12,
            column: 11,
            shell: 'bash',
            script: 'node ./tools/scripts/cmd/workflow-steps.mts install\n',
          },
        ],
        { inputs: [], stepIds: [] },
      ),
    );
  });

  test('fails naming the tools the pin file lacks', async () => {
    const result = await checkActionlint({
      pins: { actionlint: pins.actionlint },
      install: installed,
      tryRunning: runsFine,
      runActionlint: actionlintExits(0),
      compositeActions: [],
      lintWorkflowText: compositeReports([]),
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'pins no shellcheck');
  });

  test('fails with what the install said, and runs nothing', async () => {
    const runActionlint = vi.fn(actionlintExits(0));

    const result = await checkActionlint({
      pins,
      tryRunning: runsFine,
      install: (name) =>
        Promise.resolve(
          name === 'shellcheck'
            ? Result.err('❌ shellcheck: digest mismatch')
            : Result.ok(`/cache/bin/${name}`),
        ),
      runActionlint,
      compositeActions: [setupAction],
      lintWorkflowText: compositeReports([]),
    });

    assert.isTrue(Result.isErr(result));

    assert.strictEqual(result.value, '❌ shellcheck: digest mismatch');

    expect(runActionlint).not.toHaveBeenCalled();
  });

  test('names the versions and the fix when actionlint reports findings', async () => {
    const result = await checkActionlint({
      pins,
      install: installed,
      tryRunning: runsFine,
      runActionlint: actionlintExits(1),
      compositeActions: [],
      lintWorkflowText: compositeReports([]),
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      'actionlint reported the problems above (actionlint 1.7.12, shellcheck 0.11.0).',
    );

    assert.include(result.value, '# shellcheck disable=SC<number> # why');

    assert.include(result.value, 'tools/configs/release-binaries.json');
  });

  test('does not read a bad option, a fatal error or a signal as findings', async () => {
    const badOption = await checkActionlint({
      pins,
      install: installed,
      tryRunning: runsFine,
      runActionlint: actionlintExits(2),
      compositeActions: [],
      lintWorkflowText: compositeReports([]),
    });

    assert.isTrue(Result.isErr(badOption));

    assert.include(
      badOption.value,
      'actionlint stopped without a verdict (exit status 2; actionlint 1.7.12, shellcheck 0.11.0)',
    );

    assert.notInclude(badOption.value, 'shellcheck disable');

    const killed = await checkActionlint({
      pins,
      install: installed,
      tryRunning: runsFine,
      runActionlint: actionlintExits(null, 'SIGINT'),
      compositeActions: [],
      lintWorkflowText: compositeReports([]),
    });

    assert.isTrue(Result.isErr(killed));

    assert.include(killed.value, '(signal SIGINT;');
  });

  test('moves a shellcheck finding in a composite action to its line and column in action.yml', async () => {
    const result = await checkActionlint({
      pins,
      install: installed,
      tryRunning: runsFine,
      runActionlint: actionlintExits(0),
      compositeActions: [setupAction],
      lintWorkflowText: compositeReports([
        {
          message:
            'shellcheck reported issue in this script: SC2086:info:1:6: Double quote to prevent globbing and word splitting',
          filepath: 'composite-action.yml',
          // The wrapped workflow's `run: |2` line for the first step.
          line: 11,
          column: 9,
          kind: 'shellcheck',
        },
      ]),
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      '  .github/actions/setup/action.yml:12:17: info: Double quote to prevent globbing and word splitting [SC2086]',
    );
  });

  test('reports a composite action actionlint could not judge', async () => {
    const result = await checkActionlint({
      pins,
      install: installed,
      tryRunning: runsFine,
      runActionlint: actionlintExits(0),
      compositeActions: [setupAction],
      lintWorkflowText: (_actionlint, _shellcheck, workflow) =>
        ({
          workflow,
          status: 3,
          stdout: '',
          stderr: 'could not read config',
          error: undefined,
        }) as const,
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      '.github/actions/setup/action.yml: actionlint stopped without a verdict (exit status 3): could not read config',
    );
  });

  test('lists unread steps apart from findings, without the disable advice', async () => {
    const result = await checkActionlint({
      pins,
      install: installed,
      tryRunning: runsFine,
      runActionlint: actionlintExits(0),
      compositeActions: [
        {
          path: '.github/actions/x/action.yml',
          text: dedent`
            runs:
              using: composite
              steps:
                - run: echo no shell
          `,
        },
      ],
      lintWorkflowText: compositeReports([]),
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      '❌ These composite-action `run:` steps were not read, so nothing checked them:\n\n  .github/actions/x/action.yml:4: a `run:` step with no `shell:`',
    );

    assert.notInclude(result.value, 'shellcheck disable');
  });
});

describe('wrapInWorkflow', () => {
  test("declares the action's inputs and step ids, and says where each `run:` is", () => {
    const { text, runLines } = wrapInWorkflow(
      [
        { line: 10, column: 8, shell: 'bash', script: 'set -eu\n\necho a\n' },
        { line: 20, column: 11, shell: 'node {0}', script: 'b()\n' },
      ],
      { inputs: ['matrix'], stepIds: ['build'] },
    );

    assert.strictEqual(
      text,
      `${dedent`
        on:
          workflow_call:
            inputs:
              "matrix":
                type: string
              "check-actionlint-runner":
                type: string
        jobs:
          composite:
            runs-on: \${{ inputs.check-actionlint-runner }}
            steps:
              - id: "build"
                shell: bash
                run: 'true'
              - shell: "bash"
                run: |2
                  set -eu

                  echo a
              - shell: "node {0}"
                run: |2
                  b()
      `}\n`,
    );

    assert.deepStrictEqual(runLines, [16, 21]);

    assert.deepStrictEqual(
      runLines.map((line) => text.split('\n')[line - 1]?.trim()),
      ['run: |2', 'run: |2'],
    );
  });
});

describe('checkActionlint, binaries that do not run', () => {
  test('fails before linting when a pinned binary cannot be executed here', async () => {
    const runActionlint = vi.fn(actionlintExits(0));

    const result = await checkActionlint({
      pins,
      install: installed,
      tryRunning: (binary) =>
        binary.endsWith('shellcheck') ? 'Exec format error' : undefined,
      runActionlint,
      compositeActions: [],
      lintWorkflowText: compositeReports([]),
    });

    assert.deepStrictEqual(
      result,
      Result.err(
        '❌ /cache/bin/shellcheck does not run here: Exec format error',
      ),
    );

    expect(runActionlint).not.toHaveBeenCalled();
  });

  test('names every tool the pin file lacks at once', async () => {
    const result = await checkActionlint({
      pins: {},
      install: installed,
      tryRunning: runsFine,
      runActionlint: actionlintExits(0),
      compositeActions: [],
      lintWorkflowText: compositeReports([]),
    });

    assert.deepStrictEqual(
      result,
      Result.err(
        '❌ tools/configs/release-binaries.json pins no actionlint and no shellcheck.',
      ),
    );
  });
});
