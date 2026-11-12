import { Result } from 'ts-data-forge';
import {
  DEFAULT_CONCURRENCY,
  DEFAULT_MAX_SESSIONS,
  MAX_CONCURRENCY,
  parseRunIssueResolverOptions,
  RUN_ISSUE_RESOLVER_INTERVAL_MIN,
} from './options.mjs';

describe(parseRunIssueResolverOptions, () => {
  test('asks for a budget, and defaults the rest', () => {
    assert.deepStrictEqual(
      Result.unwrapOkOr(
        parseRunIssueResolverOptions(['--max-total-usd', '5']),
        undefined,
      ),
      {
        once: false,
        dryRun: false,
        intervalMin: RUN_ISSUE_RESOLVER_INTERVAL_MIN,
        maxTotalUsd: 5,
        maxSessions: DEFAULT_MAX_SESSIONS,
        concurrency: DEFAULT_CONCURRENCY,
        model: undefined,
        authors: [],
      },
    );
  });

  test('reads every flag, and an author as often as it is given', () => {
    const options = parseRunIssueResolverOptions([
      '--',
      '--once',
      '--dry-run',
      '--interval-min',
      '15',
      '--max-total-usd',
      '20.5',
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
      maxTotalUsd: 20.5,
      maxSessions: 3,
      concurrency: 2,
      model: 'sonnet',
      authors: ['alice', 'bob'],
    });
  });

  test('refuses to run without a budget', () => {
    const options = parseRunIssueResolverOptions(['--once']);

    assert.isTrue(Result.isErr(options));

    assert.include(Result.unwrapErrOr(options, ''), '--max-total-usd');
  });

  test('takes no cap per session: what a session may spend follows what issues cost', () => {
    const options = parseRunIssueResolverOptions([
      '--max-total-usd',
      '5',
      '--max-budget-usd',
      '1',
    ]);

    assert.isTrue(Result.isErr(options));

    assert.include(Result.unwrapErrOr(options, ''), 'max-budget-usd');
  });

  test('refuses a cap that is not a positive whole number', () => {
    const options = parseRunIssueResolverOptions([
      '--max-total-usd',
      '5',
      '--max-sessions',
      '0',
    ]);

    assert.isTrue(Result.isErr(options));

    assert.include(Result.unwrapErrOr(options, ''), '--max-sessions');
  });

  test('refuses a concurrency that is not a positive whole number', () => {
    const options = parseRunIssueResolverOptions([
      '--max-total-usd',
      '5',
      '--concurrency',
      '0',
    ]);

    assert.isTrue(Result.isErr(options));

    assert.include(Result.unwrapErrOr(options, ''), '--concurrency');
  });

  test('refuses more sessions at once than it allows', () => {
    const options = parseRunIssueResolverOptions([
      '--max-total-usd',
      '5',
      '--concurrency',
      (MAX_CONCURRENCY + 1).toString(),
    ]);

    assert.isTrue(Result.isErr(options));

    assert.include(Result.unwrapErrOr(options, ''), '--concurrency');
  });

  test('refuses a total that is not an amount', () => {
    const options = parseRunIssueResolverOptions(['--max-total-usd', '1e3']);

    assert.isTrue(Result.isErr(options));

    assert.include(Result.unwrapErrOr(options, ''), '--max-total-usd');
  });

  test('refuses an empty author', () => {
    const options = parseRunIssueResolverOptions([
      '--max-total-usd',
      '5',
      '--author',
      '@',
    ]);

    assert.isTrue(Result.isErr(options));

    assert.include(Result.unwrapErrOr(options, ''), '--author');
  });
});
