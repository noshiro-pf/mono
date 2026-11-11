import { Result } from 'ts-data-forge';
import { parsePushFixedPrOptions } from './options.mjs';

const SHA = 'a'.repeat(40);

describe(parsePushFixedPrOptions, () => {
  test('reads the number, the claimant and the commit', () => {
    assert.deepStrictEqual(
      parsePushFixedPrOptions(['#7', '--by', 'session-a', '--head', SHA]),
      Result.ok({ number: 7, by: 'session-a', head: SHA }),
    );
  });

  test.each([
    [['7', '--head', SHA], '--by names the claimant'],
    [['7', '--by', 'session-a'], '--head names the commit'],
    [['7', '--by', 'session-a', '--head', 'main'], '--head names the commit'],
    [['7', '8', '--by', 'session-a', '--head', SHA], 'unexpected argument: 8'],
  ] as const)('refuses %j', (args, message) => {
    const parsed = parsePushFixedPrOptions(args);

    assert.isTrue(Result.isErr(parsed));

    expect(parsed.value).toContain(message);
  });
});
