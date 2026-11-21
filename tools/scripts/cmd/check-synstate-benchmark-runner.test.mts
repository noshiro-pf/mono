import {
  collectRunnerViolations,
  DOCS_RESULTS,
  isResultsTable,
  NEXT_RESULTS,
} from './check-synstate-benchmark-runner.mjs';

const table = (recorded: unknown): unknown =>
  ({ environment: recorded, scenarios: {} }) as const;

const environmentOf = (runner: string): unknown =>
  ({
    runner,
    runnerImage: runner === 'github-actions' ? ('ubuntu24' as const) : null,
    node: 'v26.13.0',
    os: 'Linux 7.0.0-1017-azure (x64)',
    cpu: 'AMD EPYC 7763 64-Core Processor',
    measuredOn: '2026-11-12',
    libraries: { rxjs: '7.8.2' },
  }) as const;

describe('collectRunnerViolations', () => {
  test('accepts tables measured by the workflow', () => {
    assert.deepStrictEqual(
      collectRunnerViolations([
        { file: DOCS_RESULTS, content: table(environmentOf('github-actions')) },
        { file: NEXT_RESULTS, content: table(environmentOf('github-actions')) },
      ]),
      [],
    );
  });

  test('names a table measured locally', () => {
    const violations = collectRunnerViolations([
      { file: DOCS_RESULTS, content: table(environmentOf('local')) },
      { file: NEXT_RESULTS, content: table(environmentOf('github-actions')) },
    ]);

    assert.strictEqual(violations.length, 1);

    assert.include(violations[0], DOCS_RESULTS);

    assert.include(violations[0], '"local"');
  });

  test('names a table that records no environment', () => {
    const violations = collectRunnerViolations([
      { file: DOCS_RESULTS, content: table(undefined) },
      { file: NEXT_RESULTS, content: { scenarios: {} } },
    ]);

    assert.deepStrictEqual(
      violations.map((v) => v.split(': ', 1)[0]),
      [DOCS_RESULTS, NEXT_RESULTS],
    );

    for (const v of violations) {
      assert.include(v, 'no environment');
    }
  });

  test('does not look for the environment anywhere but the top', () => {
    const violations = collectRunnerViolations([
      {
        file: DOCS_RESULTS,
        content: { meta: { environment: environmentOf('github-actions') } },
      },
    ]);

    assert.strictEqual(violations.length, 1);

    assert.include(violations[0], '(`environment`)');
  });

  test('names a runner that is not a string', () => {
    const violations = collectRunnerViolations([
      { file: DOCS_RESULTS, content: table({ runner: 1 }) },
    ]);

    assert.strictEqual(violations.length, 1);

    assert.include(violations[0], DOCS_RESULTS);

    assert.include(violations[0], 'not a string');
  });

  test('names a file that is not an object', () => {
    const violations = collectRunnerViolations([
      { file: DOCS_RESULTS, content: [] },
    ]);

    assert.strictEqual(violations.length, 1);

    assert.include(violations[0], 'no environment');
  });
});

describe('isResultsTable', () => {
  test("takes each site's results file", () => {
    assert.isTrue(isResultsTable(DOCS_RESULTS));

    assert.isTrue(isResultsTable(NEXT_RESULTS));
  });

  test('leaves out every other file beside them', () => {
    assert.isFalse(isResultsTable('apps/synstate-docs/src/data/results.json'));

    assert.isFalse(
      isResultsTable('apps/synstate-docs/src/data/library-colors.mts'),
    );

    assert.isFalse(
      isResultsTable('apps/synstate-next-docs/src/data/results.json'),
    );

    assert.isFalse(isResultsTable('baseline/benchmark-results.json'));
  });
});
