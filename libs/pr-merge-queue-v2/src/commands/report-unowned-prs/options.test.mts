import { Result } from 'ts-data-forge';
import { parseReportUnownedPrsOptions } from './options.mjs';

describe(parseReportUnownedPrsOptions, () => {
  test('reads a run and a dry run', () => {
    assert.deepStrictEqual(
      [
        parseReportUnownedPrsOptions([]),
        parseReportUnownedPrsOptions(['--', '--dry-run', '--repo', 'o/n']),
        parseReportUnownedPrsOptions(['-h']),
      ],
      [
        Result.ok({ dryRun: false, repo: undefined }),
        Result.ok({ dryRun: true, repo: 'o/n' }),
        Result.ok('help'),
      ],
    );
  });

  test('refuses what it cannot act on', () => {
    for (const args of [['7'], ['--force'], ['--repo']]) {
      assert.isTrue(Result.isErr(parseReportUnownedPrsOptions(args)));
    }
  });
});
