import { Result } from 'ts-data-forge';
import { DEFAULT_INTERVAL_MIN, parseOptions } from './options.mjs';

describe(parseOptions, () => {
  test('asks for a budget, and defaults the rest', () => {
    const options = parseOptions(['--max-budget-usd', '5']);

    assert.isTrue(Result.isOk(options));

    assert.deepStrictEqual(Result.unwrapOkOr(options, undefined), {
      once: false,
      dryRun: false,
      intervalMin: DEFAULT_INTERVAL_MIN,
      maxBudgetUsd: 5,
      model: undefined,
      skill: undefined,
    });
  });

  test('reads every flag', () => {
    const options = parseOptions([
      '--',
      '--once',
      '--dry-run',
      '--interval-min',
      '15',
      '--max-budget-usd',
      '2.5',
      '--model',
      'sonnet',
      '--skill',
      'pr-merge-queue:unblock-prs',
    ]);

    assert.deepStrictEqual(Result.unwrapOkOr(options, undefined), {
      once: true,
      dryRun: true,
      intervalMin: 15,
      maxBudgetUsd: 2.5,
      model: 'sonnet',
      skill: 'pr-merge-queue:unblock-prs',
    });
  });

  test('refuses to run without a budget', () => {
    const options = parseOptions(['--once']);

    assert.isTrue(Result.isErr(options));

    assert.include(Result.unwrapErrOr(options, ''), '--max-budget-usd');
  });

  test.each(['0', '-1', 'five', '1e3', '.5', ''])(
    'refuses a budget of %j',
    (raw) => {
      assert.isTrue(Result.isErr(parseOptions(['--max-budget-usd', raw])));
    },
  );

  test('refuses a wait longer than a day', () => {
    assert.isTrue(
      Result.isOk(
        parseOptions(['--max-budget-usd', '1', '--interval-min', '1440']),
      ),
    );

    assert.isTrue(
      Result.isErr(
        parseOptions(['--max-budget-usd', '1', '--interval-min', '1441']),
      ),
    );
  });

  test('refuses a skill name with a slash in front', () => {
    const options = parseOptions([
      '--max-budget-usd',
      '1',
      '--skill',
      '/unblock-prs',
    ]);

    assert.isTrue(Result.isErr(options));
  });

  test('answers help before anything else', () => {
    assert.deepStrictEqual(
      parseOptions(['--bogus', '--help']),
      Result.ok('help'),
    );
  });
});
