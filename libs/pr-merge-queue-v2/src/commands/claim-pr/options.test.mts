import { Result } from 'ts-data-forge';
import { parseClaimPrOptions } from './options.mjs';

describe(parseClaimPrOptions, () => {
  test('reads a claim and a release', () => {
    assert.deepStrictEqual(
      parseClaimPrOptions(['2154', '--by', 'me']),
      Result.ok({ number: 2154, by: 'me', release: false, repo: undefined }),
    );

    // `pnpm run claim-pr -- …` passes the `--` on.
    assert.deepStrictEqual(
      parseClaimPrOptions(['--', '2154', '--by', 'me']),
      Result.ok({ number: 2154, by: 'me', release: false, repo: undefined }),
    );

    assert.deepStrictEqual(
      parseClaimPrOptions([
        '--release',
        '--by',
        'me',
        '#2154',
        '--repo',
        'o/n',
      ]),
      Result.ok({ number: 2154, by: 'me', release: true, repo: 'o/n' }),
    );
  });

  test('refuses what it cannot act on', () => {
    for (const args of [
      [],
      ['2154'],
      ['--by', 'me'],
      ['x', '--by', 'me'],
      ['2154', '--by', 'a b'],
      ['2154', '--by'],
      ['2154', '--by', 'me', '--force'],
      ['2154', '2155', '--by', 'me'],
    ]) {
      assert.isTrue(Result.isErr(parseClaimPrOptions(args)));
    }
  });
});
