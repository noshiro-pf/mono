import { findNoticeProblems } from './check-third-party-notices.mjs';

/** A source forked from elsewhere that names `notice`. */
const sourceNaming = (notice: string): string =>
  `// Forked from https://example.com/upstream v1;\n// its license ships as ${notice}\nexport const a = 1;\n` as const;

describe(findNoticeProblems, () => {
  const NOTICE = 'third-party/upstream/LICENSE.txt';

  test('accepts a fork that names a notice the package has and ships', () => {
    assert.deepStrictEqual(
      findNoticeProblems({
        packages: [{ dir: 'libs/a', files: ['src', 'dist', 'third-party'] }],
        sources: new Map<string, string>([
          ['libs/a/src/a.mts', sourceNaming(NOTICE)],
        ]),
        tracked: [`libs/a/${NOTICE}`],
      }),
      [],
    );
  });

  test('reports a fork that names no notice', () => {
    assert.deepStrictEqual(
      findNoticeProblems({
        packages: [{ dir: 'libs/a', files: ['src'] }],
        sources: new Map<string, string>([
          [
            'libs/a/src/a.mts',
            '// copied from https://example.com/upstream/a.js\nexport const a = 1;\n',
          ],
        ]),
        tracked: [],
      }),
      [
        'libs/a/src/a.mts says it was forked or copied from elsewhere and names no third-party/<name>/LICENSE.txt',
      ],
    );
  });

  test('reports a notice named but missing, one not shipped, and one no source names', () => {
    assert.deepStrictEqual(
      findNoticeProblems({
        packages: [
          { dir: 'libs/a', files: ['src', 'dist'] },
          { dir: 'libs/b', files: ['src', 'third-party'] },
        ],
        sources: new Map<string, string>([
          ['libs/a/src/a.mts', sourceNaming(NOTICE)],
          ['libs/b/src/b.mts', sourceNaming('third-party/gone/LICENSE.txt')],
        ]),
        tracked: [`libs/a/${NOTICE}`, 'libs/b/third-party/stale/LICENSE.txt'],
      }),
      [
        'libs/b/src/b.mts names third-party/gone/LICENSE.txt, which libs/b does not have',
        'libs/a has third-party notices, and the "files" of its package.json do not list third-party',
        'libs/b/third-party/stale/LICENSE.txt is named by no source of libs/b',
      ],
    );
  });

  test('reads a scoped name, and a package that lists no files ships everything', () => {
    assert.deepStrictEqual(
      findNoticeProblems({
        packages: [{ dir: 'libs/a', files: undefined }],
        sources: new Map<string, string>([
          [
            'libs/a/src/a.mts',
            sourceNaming('third-party/@scope/icons/LICENSE.txt'),
          ],
        ]),
        tracked: ['libs/a/third-party/@scope/icons/LICENSE.txt'],
      }),
      [],
    );
  });
});
