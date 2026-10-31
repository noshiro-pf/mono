import dedent from 'dedent';
import { parseLcov, uncoveredChangedLines } from './coverage.mjs';

describe('parseLcov', () => {
  const rootDir = '/repo';

  const packageDir = '/repo/libs/pkg';

  test('resolves package-relative, repository-relative and absolute SF paths alike', () => {
    const lcov = dedent`
      TN:
      SF:src/a.mts
      DA:1,3
      DA:2,0
      end_of_record
      SF:libs/pkg/src/b.mts
      DA:5,1
      end_of_record
      SF:/repo/libs/pkg/src/c.mts
      DA:7,0
      end_of_record
    `;

    assert.deepStrictEqual(
      parseLcov({ lcov, packageDir, rootDir }),
      new Map<string, ReadonlyMap<number, number>>([
        [
          'libs/pkg/src/a.mts',
          new Map<number, number>([
            [1, 3],
            [2, 0],
          ]),
        ],
        ['libs/pkg/src/b.mts', new Map<number, number>([[5, 1]])],
        ['libs/pkg/src/c.mts', new Map<number, number>([[7, 0]])],
      ]),
    );
  });

  test('adds up the hits of a file reported twice', () => {
    const lcov = dedent`
      SF:src/a.mts
      DA:1,0
      end_of_record
      SF:src/a.mts
      DA:1,2
      end_of_record
    `;

    assert.deepStrictEqual(
      parseLcov({ lcov, packageDir, rootDir }),
      new Map<string, ReadonlyMap<number, number>>([
        ['libs/pkg/src/a.mts', new Map<number, number>([[1, 2]])],
      ]),
    );
  });

  test('at the root, a path is repository-relative', () => {
    const lcov = dedent`
      SF:tools/scripts/x.mts
      DA:4,0
      end_of_record
    `;

    assert.deepStrictEqual(
      parseLcov({ lcov, packageDir: rootDir, rootDir }),
      new Map<string, ReadonlyMap<number, number>>([
        ['tools/scripts/x.mts', new Map<number, number>([[4, 0]])],
      ]),
    );
  });
});

describe('uncoveredChangedLines', () => {
  test('keeps the changed lines the report knows and no test ran', () => {
    const coverage = new Map<string, ReadonlyMap<number, number>>([
      [
        'src/a.mts',
        new Map<number, number>([
          [1, 0],
          [2, 4],
          [3, 0],
        ]),
      ],
      ['src/b.mts', new Map<number, number>([[1, 1]])],
    ]);

    const changedLines = new Map<string, readonly number[]>([
      // 3 is uncovered, 2 is covered, 9 is not executable (no DA record).
      ['src/a.mts', [2, 3, 9]],
      // Fully covered.
      ['src/b.mts', [1]],
      // Outside the coverage include altogether.
      ['scripts/c.mts', [1, 2]],
    ]);

    assert.deepStrictEqual(
      uncoveredChangedLines({ changedLines, coverage }),
      new Map<string, readonly number[]>([['src/a.mts', [3]]]),
    );
  });
});
