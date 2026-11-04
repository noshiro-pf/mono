import dedent from 'dedent';
import {
  collectBuildCountViolations,
  countCoverageEntries,
  readAfterNBuilds,
} from './check-codecov-builds.mjs';

const workflowFile = dedent`
  jobs:
    code-check:
      strategy:
        matrix:
          include:
            # Each \`coverage: true\` entry uploads once.
            - command: shard-1
              coverage: true
            - command: shard-2
              coverage: true # the second
            - command: lint
              coverage: false
              with:
                coverage: true
      steps:
        - name: Upload coverage reports to Codecov
          if: \${{ matrix.coverage }}
`;

const codecovFile = dedent`
  codecov:
    require_ci_to_pass: true
    notify:
      # Keep this equal to the number of uploads.
      after_n_builds: 2

  comment:
    layout: 'reach, diff'
    after_n_builds: 3 # one too many
`;

describe('countCoverageEntries', () => {
  test('counts the entries that set coverage to true, not a comment naming it', () => {
    assert.strictEqual(countCoverageEntries(workflowFile), 2);
  });
});

describe('readAfterNBuilds', () => {
  test('keys a setting by where it is nested', () => {
    assert.deepStrictEqual(
      readAfterNBuilds(dedent`
        codecov:
          after_n_builds: 2
        coverage:
          status:
            project:
              after_n_builds: 2
      `),
      new Map<string, string>([
        ['codecov', '2'],
        ['coverage.status.…', '2'],
      ]),
    );
  });

  test('reads each setting under its top-level key', () => {
    assert.deepStrictEqual(
      readAfterNBuilds(codecovFile),
      new Map<string, string>([
        ['codecov.notify', '2'],
        ['comment', '3'],
      ]),
    );
  });
});

describe('collectBuildCountViolations', () => {
  test('accepts both settings equal to the uploads', () => {
    assert.deepStrictEqual(
      collectBuildCountViolations(
        2,
        new Map<string, string>([
          ['codecov.notify', '2'],
          ['comment', '2'],
        ]),
      ),
      [],
    );
  });

  test('reports a setting that differs from the uploads', () => {
    assert.deepStrictEqual(
      collectBuildCountViolations(2, readAfterNBuilds(codecovFile)),
      [
        'codecov.yml: `comment.after_n_builds: 3` should be 2, the number of `coverage: true` entries in .github/workflows/code-check.yml.',
      ],
    );
  });

  test('reports a setting that is missing', () => {
    assert.deepStrictEqual(
      collectBuildCountViolations(
        2,
        new Map<string, string>([['comment', '2']]),
      ),
      ['codecov.yml: `codecov.notify.after_n_builds` is not set; set it to 2.'],
    );
  });

  test('reports a value that is not a number', () => {
    assert.deepStrictEqual(
      collectBuildCountViolations(
        1,
        new Map<string, string>([
          ['codecov.notify', 'two'],
          ['comment', '1'],
        ]),
      ),
      [
        'codecov.yml: `codecov.notify.after_n_builds: two` should be 1, the number of `coverage: true` entries in .github/workflows/code-check.yml.',
      ],
    );
  });

  test('reports a workflow with no coverage entry', () => {
    assert.deepStrictEqual(
      collectBuildCountViolations(
        0,
        new Map<string, string>([
          ['codecov.notify', '2'],
          ['comment', '2'],
        ]),
      ),
      [
        '.github/workflows/code-check.yml has no `coverage: true` matrix entry, so nothing uploads coverage.',
        'codecov.yml: `codecov.notify.after_n_builds: 2` should be 0, the number of `coverage: true` entries in .github/workflows/code-check.yml.',
        'codecov.yml: `comment.after_n_builds: 2` should be 0, the number of `coverage: true` entries in .github/workflows/code-check.yml.',
      ],
    );
  });
});
