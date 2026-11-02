import { Result } from 'ts-data-forge';
import {
  DEFAULT_CONCURRENCY,
  DEFAULT_INTERVAL_MIN,
  DEFAULT_MAX_SESSIONS,
  MAX_CONCURRENCY,
  parseOptions,
} from './options.mjs';

describe(parseOptions, () => {
  test('asks for a budget, and defaults the rest', () => {
    assert.deepStrictEqual(
      Result.unwrapOkOr(parseOptions(['--max-budget-usd', '5']), undefined),
      {
        once: false,
        dryRun: false,
        intervalMin: DEFAULT_INTERVAL_MIN,
        maxBudgetUsd: 5,
        maxSessions: DEFAULT_MAX_SESSIONS,
        concurrency: DEFAULT_CONCURRENCY,
        model: undefined,
        authors: [],
      },
    );
  });

  test('reads every flag, and an author as often as it is given', () => {
    const options = parseOptions([
      '--',
      '--once',
      '--dry-run',
      '--interval-min',
      '15',
      '--max-budget-usd',
      '2.5',
      '--max-sessions',
      '3',
      '--concurrency',
      '2',
      '--model',
      'sonnet',
      '--author',
      '@alice',
      '--author',
      'bob',
      '--author',
      'alice',
    ]);

    assert.deepStrictEqual(Result.unwrapOkOr(options, undefined), {
      once: true,
      dryRun: true,
      intervalMin: 15,
      maxBudgetUsd: 2.5,
      maxSessions: 3,
      concurrency: 2,
      model: 'sonnet',
      authors: ['alice', 'bob'],
    });
  });

  test('refuses to run without a budget', () => {
    const options = parseOptions(['--once']);

    assert.isTrue(Result.isErr(options));

    assert.include(Result.unwrapErrOr(options, ''), '--max-budget-usd');
  });

  test('refuses a cap that is not a positive whole number', () => {
    const options = parseOptions([
      '--max-budget-usd',
      '5',
      '--max-sessions',
      '0',
    ]);

    assert.isTrue(Result.isErr(options));

    assert.include(Result.unwrapErrOr(options, ''), '--max-sessions');
  });

  test('refuses a concurrency that is not a positive whole number', () => {
    const options = parseOptions([
      '--max-budget-usd',
      '5',
      '--concurrency',
      '0',
    ]);

    assert.isTrue(Result.isErr(options));

    assert.include(Result.unwrapErrOr(options, ''), '--concurrency');
  });

  test('refuses more sessions at once than it allows', () => {
    const options = parseOptions([
      '--max-budget-usd',
      '5',
      '--concurrency',
      (MAX_CONCURRENCY + 1).toString(),
    ]);

    assert.isTrue(Result.isErr(options));

    assert.include(Result.unwrapErrOr(options, ''), '--concurrency');
  });

  test('refuses an empty author', () => {
    const options = parseOptions(['--max-budget-usd', '5', '--author', '@']);

    assert.isTrue(Result.isErr(options));

    assert.include(Result.unwrapErrOr(options, ''), '--author');
  });
});
