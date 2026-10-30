import { Result } from 'ts-data-forge';
import { describeRange, parseOptions } from './main.mjs';

const today = '2026-10-31';

describe('parseOptions', () => {
  test('defaults to the last 30 days, as Markdown', () => {
    assert.deepStrictEqual(
      parseOptions([], today),
      Result.ok({
        range: { kind: 'since', date: '2026-10-01' },
        format: 'md',
        repo: undefined,
      }),
    );
  });

  test('reads --since, --last, --format and --repo, after a forwarded --', () => {
    assert.deepStrictEqual(
      parseOptions(['--', '--since', '2026-09-01', '--format', 'json'], today),
      Result.ok({
        range: { kind: 'since', date: '2026-09-01' },
        format: 'json',
        repo: undefined,
      }),
    );

    assert.deepStrictEqual(
      parseOptions(['--last', '20', '--repo', 'o/r'], today),
      Result.ok({
        range: { kind: 'last', count: 20 },
        format: 'md',
        repo: 'o/r',
      }),
    );
  });

  test.each([
    [['--since', '2026-9-1']],
    [['--since', '2026-02-30']],
    [['--since', '2026-13-01']],
    [['--last', '0']],
    [['--since', '2026-09-01', '--last', '3']],
    [['--format', 'html']],
    [['--unknown']],
  ])('refuses %j', (args) => {
    assert.isTrue(Result.isErr(parseOptions(args, today)));
  });

  test('answers --help', () => {
    assert.deepStrictEqual(parseOptions(['--help'], today), Result.ok('help'));
  });
});

describe('describeRange', () => {
  test('says what was selected', () => {
    assert.strictEqual(
      describeRange({ kind: 'since', date: '2026-10-01' }),
      'Merged since 2026-10-01',
    );

    assert.strictEqual(
      describeRange({ kind: 'last', count: 5 }),
      'The last 5 merged',
    );
  });
});
