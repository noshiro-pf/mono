import {
  collectRunnerViolations,
  isResultsTable,
  NEXT_RESULTS,
} from './check-synstate-benchmark-runner.mjs';

const table = (recorded: unknown): unknown =>
  ({
    meta: { updates: 1000, environment: recorded },
    rows: [],
  }) as const;

const environmentOf = (runner: string): unknown =>
  ({
    runner,
    runnerImage: runner === 'github-actions' ? ('ubuntu24' as const) : null,
    node: 'v26.12.1',
    platform: 'Linux 7.0.0-1017-azure',
    arch: 'x64',
    cpu: 'AMD EPYC 7763 64-Core Processor',
    measuredOn: '2026-10-31',
    libraries: { synstate: '6.1.1' },
  }) as const;

describe('collectRunnerViolations', () => {
  test('accepts tables measured by the workflow', () => {
    assert.deepStrictEqual(
      collectRunnerViolations([
        {
          file: 'results.json',
          content: table(environmentOf('github-actions')),
        },
        {
          file: 'results-diamond.json',
          content: table(environmentOf('github-actions')),
        },
      ]),
      [],
    );
  });

  test('names a table measured locally', () => {
    const violations = collectRunnerViolations([
      { file: 'results.json', content: table(environmentOf('github-actions')) },
      { file: 'results-diamond.json', content: table(environmentOf('local')) },
    ]);

    assert.strictEqual(violations.length, 1);

    assert.include(violations[0], 'results-diamond.json');

    assert.include(violations[0], '"local"');
  });

  test('names a table that records no environment', () => {
    const violations = collectRunnerViolations([
      { file: 'results.json', content: table(undefined) },
      { file: 'results-diamond.json', content: { meta: { updates: 1000 } } },
      { file: 'results-deep-chain.json', content: { rows: [] } },
    ]);

    assert.deepStrictEqual(
      violations.map((v) => v.split(': ', 1)[0]),
      ['results.json', 'results-diamond.json', 'results-deep-chain.json'],
    );

    for (const v of violations) {
      assert.include(v, 'no environment');
    }
  });

  test('names a runner that is not a string', () => {
    const violations = collectRunnerViolations([
      { file: 'results.json', content: table({ runner: 1 }) },
    ]);

    assert.strictEqual(violations.length, 1);

    assert.include(violations[0], 'results.json');

    assert.include(violations[0], 'not a string');
  });

  test("reads synstate-next's results file, whose environment is at the top", () => {
    assert.deepStrictEqual(
      collectRunnerViolations([
        {
          file: NEXT_RESULTS,
          content: {
            environment: environmentOf('github-actions'),
            scenarios: {},
          },
        },
      ]),
      [],
    );

    const violations = collectRunnerViolations([
      {
        file: NEXT_RESULTS,
        content: { environment: environmentOf('local'), scenarios: {} },
      },
    ]);

    assert.strictEqual(violations.length, 1);

    assert.include(violations[0], NEXT_RESULTS);

    assert.include(violations[0], '"local"');
  });

  test('looks for the environment where the path says, not where the content has one', () => {
    const violations = collectRunnerViolations([
      {
        file: 'apps/synstate-docs/src/data/results.json',
        content: { environment: environmentOf('github-actions'), rows: [] },
      },
      {
        file: NEXT_RESULTS,
        content: table(environmentOf('github-actions')),
      },
    ]);

    assert.strictEqual(violations.length, 2);

    assert.include(violations[0], '`meta.environment`');

    assert.include(violations[1], NEXT_RESULTS);

    assert.include(violations[1], '(`environment`)');
  });

  test('names a file that is not an object', () => {
    const violations = collectRunnerViolations([
      { file: 'results.json', content: [] },
    ]);

    assert.strictEqual(violations.length, 1);

    assert.include(violations[0], 'no environment');
  });
});

describe('isResultsTable', () => {
  test('takes the tables of the docs data directory', () => {
    assert.isTrue(isResultsTable('apps/synstate-docs/src/data/results.json'));

    assert.isTrue(
      isResultsTable('apps/synstate-docs/src/data/results-deep-chain.json'),
    );
  });

  test('leaves out the rendered tables and other files', () => {
    assert.isFalse(isResultsTable('apps/synstate-docs/src/data/results.md'));

    assert.isFalse(
      isResultsTable('apps/synstate-docs/src/data/library-colors.mts'),
    );
  });

  test("takes synstate-next's results file and nothing else beside it", () => {
    assert.isTrue(
      isResultsTable('apps/synstate-next-docs/src/data/benchmark-results.json'),
    );

    assert.isFalse(
      isResultsTable('apps/synstate-next-docs/src/data/results.json'),
    );

    assert.isFalse(
      isResultsTable('apps/synstate-next-docs/src/data/library-colors.mts'),
    );
  });

  test('leaves out a table outside the data directory', () => {
    assert.isFalse(
      isResultsTable('apps/synstate-docs/src/data/old/results.json'),
    );

    assert.isFalse(isResultsTable('baseline/results.json'));
  });
});
