import { Result } from 'ts-data-forge';
import { parseCommandArgs, positiveInteger } from './args.mjs';

describe(parseCommandArgs, () => {
  test('answers help before refusing an unknown flag', () => {
    assert.deepStrictEqual(
      parseCommandArgs(['--nope', '-h'], { repo: { type: 'string' } }),
      Result.ok('help'),
    );
  });

  test('drops the `--` pnpm forwards', () => {
    assert.deepStrictEqual(
      Result.unwrapThrow(
        parseCommandArgs(['--', '--repo', 'o/n'], { repo: { type: 'string' } }),
      ),
      { repo: 'o/n' },
    );
  });

  test('an unknown flag is the error', () => {
    assert.isTrue(
      Result.isErr(parseCommandArgs(['--nope'], { repo: { type: 'string' } })),
    );
  });
});

describe(positiveInteger, () => {
  test('the fallback when absent, the number when whole and positive', () => {
    assert.deepStrictEqual(positiveInteger('n', undefined, 7), Result.ok(7));

    assert.deepStrictEqual(positiveInteger('n', '12', 7), Result.ok(12));
  });

  test('refuses what is not', () => {
    for (const raw of ['0', '-3', 'two', '1.5', '012']) {
      assert.isTrue(Result.isErr(positiveInteger('n', raw, 7)));
    }
  });
});
