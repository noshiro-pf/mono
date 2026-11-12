import { Result } from 'ts-data-forge';
import {
  numberOperand,
  parseCommandArgs,
  parseCommandLine,
  positiveInteger,
} from './args.mjs';

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

describe(parseCommandLine, () => {
  test('reads the operands beside the flags, past the `--` pnpm forwards', () => {
    assert.deepStrictEqual(
      Result.unwrapThrow(
        parseCommandLine(['--', '12', '--by', 'me'], {
          by: { type: 'string' },
        }),
      ),
      { values: { by: 'me' }, operands: ['12'] },
    );
  });

  test('answers help first, and refuses an unknown flag', () => {
    assert.deepStrictEqual(
      parseCommandLine(['12', '--nope', '--help'], {}),
      Result.ok('help'),
    );

    assert.isTrue(Result.isErr(parseCommandLine(['12', '--nope'], {})));
  });
});

describe(numberOperand, () => {
  test('takes 12 and #12', () => {
    assert.deepStrictEqual(numberOperand('issue', '12'), Result.ok(12));

    assert.deepStrictEqual(numberOperand('issue', '#12'), Result.ok(12));
  });

  test('refuses what is no number, and says when there is none', () => {
    for (const raw of ['0', 'x', '1.5', '#', '012']) {
      assert.isTrue(Result.isErr(numberOperand('issue', raw)));
    }

    assert.deepStrictEqual(
      numberOperand('issue', undefined),
      Result.err('name the issue by its number'),
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
