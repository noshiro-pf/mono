// cspell:ignore vanjs
import dedent from 'dedent';
import { Arr, Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  checkPlacement,
  embedPlacement,
  englishList,
  pageLocale,
  parseResults,
  placementFigures,
  type Table,
  worstCases,
  worstKey,
} from './synstate-dom-benchmark-results.mjs';

describe(englishList, () => {
  test('joins one, two and three names', () => {
    assert.strictEqual(englishList([]), '');

    assert.strictEqual(englishList(['Solid']), 'Solid');

    assert.strictEqual(englishList(['Solid', 'Preact']), 'Solid and Preact');

    assert.strictEqual(
      englishList(['Solid', 'Preact', 'Preact + Signals']),
      'Solid, Preact and Preact + Signals',
    );
  });
});

describe(worstKey, () => {
  test('keeps letters and digits, and joins the rest with one hyphen', () => {
    assert.strictEqual(worstKey('synstate-dom'), 'worst/synstate-dom');

    assert.strictEqual(worstKey('Preact + Signals'), 'worst/preact-signals');

    assert.strictEqual(worstKey('Vue 3'), 'worst/vue-3');
  });
});

/**
 * Each library's slowest operation over the fastest, as the rows below make it:
 * synstate-dom 1.5, Solid 1.2, Preact 1.1, Preact + Signals 1.4, React 4,
 * VanJS 5.
 */
const table = (
  overrides: Partial<ReadonlyRecord<string, number>> = {},
): Table => {
  const worst: ReadonlyRecord<string, number> = {
    'synstate-dom': 1.5,
    Solid: 1.2,
    'Preact + Signals': 1.4,
    Preact: 1.1,
    React: 4,
    VanJS: 5,
    ...overrides,
  } as const;

  const libraries = Object.keys(worst);

  return {
    libraries,
    rows: libraries.map((library) => ({
      operation: `slow for ${library}`,
      medians: libraries.map((l) => (l === library ? (worst[l] ?? 1) : 1)),
    })),
  };
};

describe(checkPlacement, () => {
  test('accepts a table that bears out the placement', () => {
    assert.isTrue(Result.isOk(checkPlacement(table())));
  });

  test('rejects a library said to be ahead that is no longer faster', () => {
    const placed = checkPlacement(table({ Preact: 1.6 }));

    assert.isTrue(Result.isErr(placed));

    expect(placed.value).toContain('no longer hold for Preact (');
  });

  test('rejects a library said to be well behind that is not twice as slow', () => {
    assert.isTrue(Result.isErr(checkPlacement(table({ React: 2.9 }))));
  });

  test('rejects a library the placement does not name', () => {
    assert.isTrue(
      Result.isErr(
        checkPlacement({
          libraries: Arr.toPushed(table().libraries, 'Vue'),
          rows: table().rows.map(({ operation, medians }) => ({
            operation,
            medians: Arr.toPushed(medians, 1),
          })),
        }),
      ),
    );
  });
});

describe(worstCases, () => {
  test('leaves a library with no time at all NaN, not -Infinity', () => {
    const [, missing] = worstCases({
      libraries: ['synstate-dom', 'Solid'],
      rows: [{ operation: 'a', medians: [1, Number.NaN] }],
    });

    assert.isTrue(Number.isNaN(missing?.overFastest ?? 0));
  });
});

describe(placementFigures, () => {
  test('quotes synstate-dom and the libraries well behind it, and lists those ahead', () => {
    const en = placementFigures(table(), 'en');

    assert.deepStrictEqual(Object.keys(en).toSorted(), [
      'placement/behind',
      'worst/react',
      'worst/synstate-dom',
      'worst/vanjs',
    ]);

    assert.strictEqual(en['worst/synstate-dom']?.text, '1.50');

    assert.strictEqual(
      en['placement/behind']?.text,
      'behind Solid, Preact and Preact + Signals',
    );

    assert.strictEqual(
      placementFigures(table(), 'ja')['placement/behind']?.text,
      'Solid・Preact・Preact + Signals には及びません',
    );
  });
});

describe(embedPlacement, () => {
  test('fills the figures a page quotes and the claim', () => {
    assert.deepStrictEqual(
      embedPlacement(
        'At {/* benchmark:worst/synstate-dom */}0{/* /benchmark */}×: {/* benchmark:placement/behind */}ahead of all{/* /benchmark */}.',
        table(),
        'en',
      ),
      Result.ok(
        'At {/* benchmark:worst/synstate-dom */}1.50{/* /benchmark */}×: {/* benchmark:placement/behind */}behind Solid, Preact and Preact + Signals{/* /benchmark */}.',
      ),
    );
  });

  test('leaves the other markers of a page as they are when asked to', () => {
    const page =
      '<!-- benchmark:medians -->…<!-- /benchmark --> <!-- benchmark:placement/behind -->behind Solid<!-- /benchmark -->';

    assert.isTrue(Result.isErr(embedPlacement(page, table(), 'en')));

    assert.deepStrictEqual(
      embedPlacement(page, table(), 'en', 'keep'),
      Result.ok(
        '<!-- benchmark:medians -->…<!-- /benchmark --> <!-- benchmark:placement/behind -->behind Solid, Preact and Preact + Signals<!-- /benchmark -->',
      ),
    );
  });

  test('rejects a page that lost the claim', () => {
    assert.isTrue(
      Result.isErr(
        embedPlacement(
          'At <!-- benchmark:worst/synstate-dom -->0<!-- /benchmark -->×, behind Solid.',
          table(),
          'en',
        ),
      ),
    );
  });
});

describe(pageLocale, () => {
  test('reads the locale from where Starlight keeps the page', () => {
    assert.strictEqual(pageLocale('/a/src/content/docs/ja/index.mdx'), 'ja');

    assert.strictEqual(pageLocale('/a/src/content/docs/index.mdx'), 'en');
  });
});

describe(parseResults, () => {
  test('reads the environment, the operations and the scenarios', () => {
    const parsed = parseResults(dedent`
      # Results

      Measured in \`Chrome\`. Each figure is the median of 8 runs of \`pnpm run benchmark\`.

      | operation (median ms) | synstate-dom | Solid |
      | :-- | --: | --: |
      | create 1,000 rows | 24.85 | 19.70 |

      ## Scenarios

      | operation (median ms) | synstate-dom | Solid |
      | :-- | --: | --: |
      | loan: build the table | 2.71 | wrong |
    `);

    assert.isTrue(Result.isOk(parsed));

    assert.strictEqual(parsed.value.runs, 8);

    assert.deepStrictEqual(parsed.value.operations.rows, [
      { operation: 'create 1,000 rows', medians: [24.85, 19.7] },
    ]);

    assert.isTrue(
      Number.isNaN(parsed.value.scenarios.rows[0]?.medians[1] ?? 0),
    );
  });

  test('rejects a page without the environment sentence', () => {
    assert.isTrue(Result.isErr(parseResults('| a | b |')));
  });
});
