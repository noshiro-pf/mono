import {
  collectRunnerViolations,
  DOCS_RESULTS,
  isResultsTable,
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

/** The one message starts with the table's path, as the guard promises. */
const assertNamesDocsResults = (violations: readonly string[]): void => {
  const prefix = `${DOCS_RESULTS}: ` as const;

  assert.strictEqual(violations[0]?.slice(0, prefix.length), prefix);
};

describe('collectRunnerViolations', () => {
  test('accepts tables measured by the workflow', () => {
    assert.deepStrictEqual(
      collectRunnerViolations([
        { file: DOCS_RESULTS, content: table(environmentOf('github-actions')) },
      ]),
      [],
    );
  });

  test('names a table measured locally', () => {
    const violations = collectRunnerViolations([
      { file: DOCS_RESULTS, content: table(environmentOf('local')) },
      {
        file: 'apps/x/benchmark-results.json',
        content: table(environmentOf('github-actions')),
      },
    ]);

    assert.strictEqual(violations.length, 1);

    assertNamesDocsResults(violations);

    assert.include(violations[0], '"local"');
  });

  test.each([
    ['an undefined environment', table(undefined)],
    ['no environment key', { scenarios: {} }],
  ] as const)('names a table that records %s', (_, content) => {
    const violations = collectRunnerViolations([
      { file: DOCS_RESULTS, content },
    ]);

    assert.strictEqual(violations.length, 1);

    assertNamesDocsResults(violations);

    assert.include(violations[0], 'no environment');
  });

  test('does not look for the environment anywhere but the top', () => {
    const violations = collectRunnerViolations([
      {
        file: DOCS_RESULTS,
        content: { meta: { environment: environmentOf('github-actions') } },
      },
    ]);

    assert.strictEqual(violations.length, 1);

    assertNamesDocsResults(violations);

    assert.include(violations[0], '(`environment`)');
  });

  test('names a runner that is not a string', () => {
    const violations = collectRunnerViolations([
      { file: DOCS_RESULTS, content: table({ runner: 1 }) },
    ]);

    assert.strictEqual(violations.length, 1);

    assertNamesDocsResults(violations);

    assert.include(violations[0], 'not a string');
  });

  test('names a file that is not an object', () => {
    const violations = collectRunnerViolations([
      { file: DOCS_RESULTS, content: [] },
    ]);

    assert.strictEqual(violations.length, 1);

    assertNamesDocsResults(violations);

    assert.include(violations[0], 'no environment');
  });
});

describe('isResultsTable', () => {
  test("takes the site's results file", () => {
    assert.isTrue(isResultsTable(DOCS_RESULTS));
  });

  test('leaves out every other file beside them', () => {
    assert.isFalse(isResultsTable('apps/synstate-docs/src/data/results.json'));

    assert.isFalse(
      isResultsTable('apps/synstate-docs/src/data/library-colors.mts'),
    );

    assert.isFalse(
      isResultsTable('apps/synstate-dom-docs/src/data/benchmark-results.json'),
    );

    assert.isFalse(isResultsTable('baseline/benchmark-results.json'));
  });
});
