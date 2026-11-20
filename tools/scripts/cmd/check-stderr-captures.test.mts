import dedent from 'dedent';
import { Result } from 'ts-data-forge';
import {
  findCompositeStderrCaptures,
  findStderrCaptures,
  mergesStderrIntoCapture,
} from './check-stderr-captures.mjs';

describe(mergesStderrIntoCapture, () => {
  test.each([
    [['2>&1'], true],
    [['&>log'], false],
    [['|&'], true],
    [['2>/dev/stdout'], true],
    [['2>&1', '>/dev/null'], false],
    [['>/dev/null', '2>&1'], false],
    [['2>$errors'], false],
    [['>&2'], false],
    [['2>&1', '>&2'], true],
    [['<<<$x', '2>>&1'], true],
    [[], false],
  ] as const)(
    '%j merges stderr into the capture: %s',
    (redirections, merges) => {
      assert.strictEqual(mergesStderrIntoCapture(redirections), merges);
    },
  );
});

/** A workflow of one step running `run`, in `shell` when given. */
const workflow = (run: string, shell = ''): string =>
  dedent`
    on: push
    jobs:
      check:
        runs-on: ubuntu-latest
        steps:
          - name: Read
            ${shell}run: |
              ${run.replaceAll('\n', '\n              ')}
  `;

describe(findStderrCaptures, () => {
  test('reports a command inside a capture whose stderr is merged in', () => {
    assert.deepStrictEqual(
      Result.unwrapThrow(
        findStderrCaptures(
          workflow(
            'x="$(gh api repos/o/r 2>&1)"\ny="$(gh api a 2>"$errors")"\nz=$(git log 2>&1 >/dev/null)',
          ),
        ),
      ),
      [
        'check: Read: `gh api repos/o/r` merges stderr into a $(…) capture (2>&1)',
      ],
    );
  });

  test('says what the shell reader cannot read', () => {
    assert.isTrue(
      Result.unwrapThrow(findStderrCaptures(workflow('x="$(gh api a'))).some(
        (report) => report.includes('cannot be read'),
      ),
    );
  });

  test('leaves a step in another shell alone', () => {
    assert.deepStrictEqual(
      Result.unwrapThrow(
        findStderrCaptures(
          workflow('$x = $(gh api a 2>&1)', 'shell: pwsh\n            '),
        ),
      ),
      [],
    );
  });
});

describe(findCompositeStderrCaptures, () => {
  test('reads the steps of a composite action', () => {
    assert.deepStrictEqual(
      Result.unwrapThrow(
        findCompositeStderrCaptures(dedent`
          name: x
          runs:
            using: composite
            steps:
              - name: Find
                shell: bash
                run: v=\`gh run list 2>&1\`
        `),
      ),
      ['Find: `gh run list` merges stderr into a $(…) capture (2>&1)'],
    );
  });
});
