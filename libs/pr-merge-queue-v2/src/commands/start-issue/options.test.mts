import { Result } from 'ts-data-forge';
import { parseStartIssueOptions } from './options.mjs';

const ME = 'https://claude.ai/code/session_01me';

describe(parseStartIssueOptions, () => {
  test('reads the number, with or without #, the claimant and the mode', () => {
    assert.deepStrictEqual(
      parseStartIssueOptions(['--', '#2701', '--by', ME]),
      Result.ok({
        number: 2701,
        by: ME,
        mode: 'start',
        force: false,
        repo: undefined,
      }),
    );

    assert.deepStrictEqual(
      parseStartIssueOptions(['--by', ME, '2701', '--force', '--repo', 'o/n']),
      Result.ok({
        number: 2701,
        by: ME,
        mode: 'start',
        force: true,
        repo: 'o/n',
      }),
    );

    assert.deepStrictEqual(
      Result.map(
        parseStartIssueOptions(['2701', '--plan', '--by', ME]),
        (options) => (options === 'help' ? options : options.mode),
      ),
      Result.ok('plan'),
    );

    assert.deepStrictEqual(
      Result.map(
        parseStartIssueOptions(['--release', '2701', '--by', ME]),
        (options) => (options === 'help' ? options : options.mode),
      ),
      Result.ok('release'),
    );
  });

  test('says what is wrong with the command line', () => {
    const errors = [
      [['--by', ME], 'name the issue by its number'],
      [['1', '2', '--by', ME], 'unexpected argument: 2'],
      [
        ['1', '--plan', '--release', '--by', ME],
        '--plan and --release do not go together',
      ],
      [
        ['1'],
        '--by names who starts it: a session URL, or any other word unique to you',
      ],
      [
        ['1', '--by', 'two words'],
        '--by names who starts it: a session URL, or any other word unique to you',
      ],
    ] as const;

    assert.deepStrictEqual(
      errors.map(([args]) => parseStartIssueOptions(args)),
      errors.map(([, message]) => Result.err(message)),
    );

    assert.isTrue(
      Result.isErr(parseStartIssueOptions(['1', '--assign', '--by', ME])),
    );
  });
});
