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

const dollar = '$';

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
      'Nothing to report in the workflows or in the steps of 1 composite action (actionlint 1.7.12, shellcheck 0.11.0).',
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
        {
          line: 5,
          dashIndent: 4,
          lines: Arr.skip(setupAction.text.split('\n'), 4),
        },
        { inputs: [] },
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

    assert.include(
      result.value,
      'pnpm run update-release-binaries -- --to actionlint@<x.y.z>',
    );
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
          // The `run:` key of the second step, 8 lines on in the wrapped
          // workflow.
          line: 20,
          column: 7,
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

  test('moves any other finding by the shift the wrapper made', async () => {
    const result = await checkActionlint({
      pins,
      install: installed,
      tryRunning: runsFine,
      runActionlint: actionlintExits(0),
      compositeActions: [setupAction],
      lintWorkflowText: compositeReports([
        {
          message: 'property "instal" is not defined in object type {}',
          filepath: 'composite-action.yml',
          // `INSTALL: ${{ inputs.install }}`, in the wrapped workflow, whose
          // steps are as far in as the action's.
          line: 19,
          column: 24,
          kind: 'expression',
        },
        {
          message: 'something about the header',
          filepath: 'composite-action.yml',
          line: 2,
          column: 3,
          kind: 'syntax-check',
        },
      ]),
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      '  .github/actions/setup/action.yml:11:24: property "instal" is not defined in object type {}',
    );

    assert.include(
      result.value,
      '  .github/actions/setup/action.yml: something about the header',
    );
  });

  test('gives only the line for a column past its end, as in a block scalar that is not a script', async () => {
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
                - uses: owner/action@0000000000000000000000000000000000000000
                  with:
                    script: | # js
                      console.log(1);
                      console.log("\${{ github.event.issue.title }}");
          `,
        },
      ],
      lintWorkflowText: compositeReports([
        {
          message: '"github.event.issue.title" is potentially untrusted',
          filepath: 'composite-action.yml',
          // The `script: |` key, at an offset into the whole string.
          line: 15,
          column: 49,
          kind: 'expression',
        },
      ]),
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      '  .github/actions/x/action.yml:6: "github.event.issue.title" is potentially untrusted',
    );
  });

  test('keeps a finding on the header there when the steps start further down than the header ends', async () => {
    const result = await checkActionlint({
      pins,
      install: installed,
      tryRunning: runsFine,
      runActionlint: actionlintExits(0),
      compositeActions: [
        {
          path: '.github/actions/x/action.yml',
          text: dedent`
            inputs:
              a:
                description: a
              b:
                description: b
              c:
                description: c
            runs:
              using: composite
              steps:
                - shell: bash
                  run: echo hi
          `,
        },
      ],
      lintWorkflowText: compositeReports([
        {
          message: 'key "A" is duplicated in inputs',
          filepath: 'composite-action.yml',
          // The wrapper's header has 18 lines; the steps start on line 11.
          line: 4,
          column: 7,
          kind: 'syntax-check',
        },
      ]),
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      '  .github/actions/x/action.yml: key "A" is duplicated in inputs',
    );
  });

  test('puts an expression finding in a block-scalar script at the start of the script', async () => {
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
                - shell: bash
                  run: |
                    echo hi
                    echo "\${{ github.event.issue.title }}"
          `,
        },
      ],
      lintWorkflowText: compositeReports([
        {
          message: '"github.event.issue.title" is potentially untrusted',
          filepath: 'composite-action.yml',
          // The `run: |` key, at an offset into the whole script.
          line: 14,
          column: 30,
          kind: 'expression',
        },
      ]),
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      '  .github/actions/x/action.yml:6:9: "github.event.issue.title" is potentially untrusted',
    );
  });

  test('moves a position named in the message as well', async () => {
    const result = await checkActionlint({
      pins,
      install: installed,
      tryRunning: runsFine,
      runActionlint: actionlintExits(0),
      compositeActions: [setupAction],
      lintWorkflowText: compositeReports([
        {
          message:
            'step ID "a" duplicates. previously defined at line:13,col:11',
          filepath: 'composite-action.yml',
          line: 16,
          column: 11,
          kind: 'id',
        },
      ]),
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      '  .github/actions/setup/action.yml:8:11: step ID "a" duplicates. previously defined at line:5,col:11',
    );
  });

  test('says why an anchor outside the steps is unknown', async () => {
    const result = await checkActionlint({
      pins,
      install: installed,
      tryRunning: runsFine,
      runActionlint: actionlintExits(0),
      compositeActions: [setupAction],
      lintWorkflowText: compositeReports([
        {
          message:
            "could not parse as YAML: yaml: unknown anchor 'd' referenced",
          filepath: 'composite-action.yml',
          line: 0,
          column: 0,
          kind: 'syntax-check',
        },
      ]),
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      "  .github/actions/setup/action.yml: could not parse as YAML: yaml: unknown anchor 'd' referenced: `runs.steps` is linted on its own, so write the value out or anchor it within the steps",
    );
  });

  test('leaves a finding about the step on the line of its `run: |` key', async () => {
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
                - run: |
                    echo hi
                  shell: bash
                  uses: owner/action@0000000000000000000000000000000000000000
          `,
        },
      ],
      lintWorkflowText: compositeReports([
        {
          message:
            'step must run script with "run" section or run action with "uses" section',
          filepath: 'composite-action.yml',
          line: 13,
          column: 7,
          kind: 'syntax-check',
        },
      ]),
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      '  .github/actions/x/action.yml:4: step must run script',
    );
  });

  test('says why a secret the wrapper does not declare is reported', async () => {
    const result = await checkActionlint({
      pins,
      install: installed,
      tryRunning: runsFine,
      runActionlint: actionlintExits(0),
      compositeActions: [setupAction],
      lintWorkflowText: compositeReports([
        {
          message:
            'property "token" is not defined in object type {actions_runner_debug: string; actions_step_debug: string; check-actionlint-no-secrets: string; github_token: string}',
          filepath: 'composite-action.yml',
          line: 19,
          column: 24,
          kind: 'expression',
        },
      ]),
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      result.value,
      '  .github/actions/setup/action.yml:11:24: property "token" is not defined: a composite action has no `secrets`; pass the value in as an input',
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
      '❌ These composite-action steps were not read as `./run-scripts.mts` reads them, so they were checked only in part, or not at all:\n\n  .github/actions/x/action.yml:4: a `run:` step with no `shell:`',
    );

    assert.notInclude(result.value, 'shellcheck disable');
  });
});

describe('wrapInWorkflow', () => {
  test("copies the steps under a job declaring the action's inputs", () => {
    const { text, lineOffset, columnOffset, headerLines } = wrapInWorkflow(
      {
        line: 20,
        dashIndent: 2,
        lines: [
          '  - id: build',
          '    shell: bash',
          '    run: |',
          '      set -eu',
          '',
          `      echo "${dollar}{{ inputs.matrix }}"`,
        ],
      },
      { inputs: ['matrix'] },
    );

    assert.strictEqual(
      text,
      `${dedent`
        on:
          workflow_call:
            inputs:
              "matrix":
                type: string
            secrets:
              "check-actionlint-no-secrets":
                required: false
        jobs:
          composite:
            runs-on: \${{ matrix.runner }}
            strategy:
              matrix: \${{ fromJSON(github.event_name) }}
            steps:
            - id: build
              shell: bash
              run: |
                set -eu

                echo "\${{ inputs.matrix }}"
      `}\n`,
    );

    // Line 20 of action.yml is line 15 of the workflow, two columns on.
    assert.strictEqual(lineOffset, -5);

    assert.strictEqual(columnOffset, 2);

    assert.strictEqual(headerLines, 14);

    assert.strictEqual(
      text.split('\n')[20 + lineOffset - 1],
      '    - id: build',
    );
  });

  test('moves items indented less than the wrapper needs, and no others', () => {
    for (const [dash, dashIndent, offset] of [
      [' - shell: bash', 1, 3],
      ['      - shell: bash', 6, 0],
    ] as const) {
      const { text, columnOffset } = wrapInWorkflow(
        { line: 3, dashIndent, lines: [dash] },
        { inputs: [] },
      );

      assert.strictEqual(columnOffset, offset);

      assert.isTrue(text.endsWith(`\n${' '.repeat(offset)}${dash}\n`));
    }
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
