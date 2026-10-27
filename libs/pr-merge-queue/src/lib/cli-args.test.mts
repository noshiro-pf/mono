import { Result } from 'ts-data-forge';
import {
  parseCommandArgs,
  positiveInteger,
  pullRequestNumber,
} from './cli-args.mjs';

describe(parseCommandArgs, () => {
  const options = {
    title: { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
  } as const;

  test('reads the flags the command declares', () => {
    assert.deepStrictEqual(
      parseCommandArgs(['--title', 'x', '--dry-run'], options),
      Result.ok({ title: 'x', 'dry-run': true }),
    );
  });

  test('drops the `--` that `pnpm run <command> --` forwards', () => {
    assert.deepStrictEqual(
      parseCommandArgs(['--', '--dry-run'], options),
      Result.ok({ 'dry-run': true }),
    );
  });

  test('answers help for `--help` and `-h`, even beside a flag it would refuse', () => {
    assert.deepStrictEqual(
      parseCommandArgs(['--help'], options),
      Result.ok('help'),
    );

    assert.deepStrictEqual(
      parseCommandArgs(['--', '-h'], options),
      Result.ok('help'),
    );

    assert.deepStrictEqual(
      parseCommandArgs(['--nope', '--help'], options),
      Result.ok('help'),
    );
  });

  test('says what was wrong with an unknown flag, rather than throwing', () => {
    const parsed = parseCommandArgs(['--nope'], options);

    assert.isTrue(Result.isErr(parsed));

    assert.include(parsed.value, '--nope');
  });
});

describe(positiveInteger, () => {
  test('falls back when the flag was not given', () => {
    assert.deepStrictEqual(
      positiveInteger('limit', undefined, 7),
      Result.ok(7),
    );
  });

  test('reads a positive whole number', () => {
    assert.deepStrictEqual(positiveInteger('limit', '12', 7), Result.ok(12));
  });

  test.each(['0', '-3', '1.5', '12abc', 'two', ''])(
    'refuses %j rather than falling back',
    (raw) => {
      assert.deepStrictEqual(
        positiveInteger('limit', raw, 7),
        Result.err(
          `--limit must be a positive whole number, got ${JSON.stringify(raw)}`,
        ),
      );
    },
  );
});

describe(pullRequestNumber, () => {
  test('reads a number with or without the `#`', () => {
    assert.strictEqual(pullRequestNumber('1901'), 1901);

    assert.strictEqual(pullRequestNumber('#1901'), 1901);
  });

  test.each(['0', '#', '##1', '-1', '19o1', ''])(
    'names nothing by %j',
    (raw) => {
      assert.isUndefined(pullRequestNumber(raw));
    },
  );
});
