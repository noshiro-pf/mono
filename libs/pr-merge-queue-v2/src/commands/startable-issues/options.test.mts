import { Result } from 'ts-data-forge';
import { parseStartableIssuesOptions } from './options.mjs';

describe(parseStartableIssuesOptions, () => {
  test('reads every flag, authors without @ and once each', () => {
    assert.deepStrictEqual(
      parseStartableIssuesOptions([
        '--limit',
        '3',
        '--author',
        '@me',
        '--author',
        'me',
        '--theme',
        ' ci ',
        '--by',
        ' session-a ',
        '--repo',
        'o/n',
      ]),
      Result.ok({
        limit: 3,
        authors: ['me'],
        theme: 'ci',
        by: 'session-a',
        repo: 'o/n',
      }),
    );
  });

  test('defaults, help, and what it refuses', () => {
    assert.deepStrictEqual(
      parseStartableIssuesOptions([]),
      Result.ok({
        limit: undefined,
        authors: [],
        theme: undefined,
        by: undefined,
        repo: undefined,
      }),
    );

    assert.deepStrictEqual(
      parseStartableIssuesOptions(['--help']),
      Result.ok('help'),
    );

    for (const args of [
      ['--limit', '0'],
      ['--theme', ' '],
      ['--author', '@'],
      ['--by', ' '],
      ['--unknown'],
    ]) {
      assert.isTrue(Result.isErr(parseStartableIssuesOptions(args)));
    }
  });
});
