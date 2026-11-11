import { Result } from 'ts-data-forge';
import { parseReworkPrOptions } from './options.mjs';

describe(parseReworkPrOptions, () => {
  test('reads the phase, the hand-back and a dry run', () => {
    assert.deepStrictEqual(
      [
        parseReworkPrOptions(['start']),
        parseReworkPrOptions(['--', 'done', '--requeue', '--dry-run']),
        parseReworkPrOptions(['done', '--review']),
        parseReworkPrOptions(['--help']),
      ],
      [
        Result.ok({ phase: 'start', dryRun: false }),
        Result.ok({ phase: 'done', handBack: 'requeue', dryRun: true }),
        Result.ok({ phase: 'done', handBack: 'review', dryRun: false }),
        Result.ok('help'),
      ],
    );
  });

  test.each([
    [[], 'give one of start or done'],
    [['stop'], 'give one of start or done'],
    [['start', 'done'], 'unexpected argument: done'],
    [['start', '--review'], '--requeue and --review go with done, not start'],
    [
      ['done'],
      'done takes one of --requeue (the work changes nothing the description says) or --review (it does)',
    ],
    [
      ['done', '--requeue', '--review'],
      'done takes one of --requeue (the work changes nothing the description says) or --review (it does)',
    ],
  ] as const)('refuses %j', (args, message) => {
    assert.deepStrictEqual(parseReworkPrOptions(args), Result.err(message));
  });
});
