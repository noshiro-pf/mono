import * as path from 'node:path';
import { Arr } from 'ts-data-forge';
import { prettierArguments } from './format-package.mjs';

describe(prettierArguments, () => {
  test('passes the root ignore files and config, and formats `.` by default', () => {
    assert.deepStrictEqual(
      prettierArguments({
        rootDir: '/repo',
        packageIgnoreFile: undefined,
        patterns: [],
      }),
      [
        '--config',
        path.join('/repo', '.prettierrc'),
        '--ignore-path',
        path.join('/repo', '.prettierignore'),
        '--ignore-path',
        path.join('/repo', '.gitignore'),
        '--ignore-unknown',
        '--no-error-on-unmatched-pattern',
        '--write',
        '.',
      ],
    );
  });

  test("adds the package's own .prettierignore after the root ones", () => {
    assert.deepStrictEqual(
      Arr.take(
        prettierArguments({
          rootDir: '/repo',
          packageIgnoreFile: '/repo/languages/sumi/conformance/.prettierignore',
          patterns: [],
        }),
        8,
      ),
      [
        '--config',
        path.join('/repo', '.prettierrc'),
        '--ignore-path',
        path.join('/repo', '.prettierignore'),
        '--ignore-path',
        path.join('/repo', '.gitignore'),
        '--ignore-path',
        '/repo/languages/sumi/conformance/.prettierignore',
      ],
    );
  });

  test('formats the patterns given instead of `.`, failing on one that matches nothing', () => {
    assert.deepStrictEqual(
      prettierArguments({
        rootDir: '/repo',
        packageIgnoreFile: undefined,
        patterns: ['src/a/*.mts', 'src/b/*.mts'],
      }),
      [
        '--config',
        path.join('/repo', '.prettierrc'),
        '--ignore-path',
        path.join('/repo', '.prettierignore'),
        '--ignore-path',
        path.join('/repo', '.gitignore'),
        '--ignore-unknown',
        '--write',
        'src/a/*.mts',
        'src/b/*.mts',
      ],
    );
  });
});
