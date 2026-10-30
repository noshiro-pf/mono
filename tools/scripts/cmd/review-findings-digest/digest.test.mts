import dedent from 'dedent';
import { buildDigest, renderMarkdown, type MergedPull } from './digest.mjs';

const pulls: readonly MergedPull[] = [
  {
    number: 12,
    title: 'feat: a | b',
    url: 'https://github.com/o/r/pull/12',
    mergedAt: '2026-10-30T00:00:00Z',
    body: dedent`
      ## Review

      \`/code-review high\` ran three rounds. Fixed: helper order, the barrel. Dismissed:

      - **\`autocomplete="off"\`**: the browser ignores it anyway.

      Deferred to #13:

      - stale README

      Claude-Session: x
    `,
    additions: 120,
    deletions: 7,
  },
  {
    number: 11,
    title: 'chore: bump',
    url: 'https://github.com/o/r/pull/11',
    mergedAt: '2026-10-29T00:00:00Z',
    body: 'No review section.',
    additions: undefined,
    deletions: undefined,
  },
  {
    number: 10,
    title: 'fix: x',
    url: 'https://github.com/o/r/pull/10',
    mergedAt: '2026-10-28T00:00:00Z',
    body: '## Review\n\nFor several rounds. Fixed: declaration order.',
    additions: 3,
    deletions: 1,
  },
] as const;

describe('buildDigest', () => {
  const digest = buildDigest({ range: 'Merged since 2026-10-01', pulls });

  test('reads the pull requests with a review section only', () => {
    assert.strictEqual(digest.merged, 3);

    assert.deepStrictEqual(
      digest.reviewed.map(({ number, rounds, levels }) => [
        number,
        rounds,
        levels,
      ]),
      [
        [12, 3, ['high']],
        [10, undefined, []],
      ],
    );
  });

  test('counts each class by disposition, with the pull requests in it', () => {
    const order = digest.categories.find(({ id }) => id === 'order');

    assert.deepStrictEqual(order?.counts, {
      fixed: 2,
      dismissed: 0,
      deferred: 0,
      unknown: 0,
    });

    assert.deepStrictEqual(order?.pulls, [12, 10]);
  });

  test('lists what no class matched, verbatim', () => {
    assert.deepStrictEqual(digest.other, [
      {
        pull: 12,
        disposition: 'dismissed',
        text: '**`autocomplete="off"`**: the browser ignores it anyway.',
      },
    ]);
  });
});

describe('renderMarkdown', () => {
  test('a table of rounds, the classes, the deferred and the rest', () => {
    const markdown = renderMarkdown(
      buildDigest({ range: 'Merged since 2026-10-01', pulls }),
    );

    assert.include(
      markdown,
      'Merged since 2026-10-01: 3 merged pull requests, 2 with a `## Review` section, 5 findings read from them.',
    );

    assert.include(
      markdown,
      '3 rounds over the 1 pull requests that state a count; 1 do not.',
    );

    assert.include(
      markdown,
      String.raw`| #12 | feat: a \| b | high | 3 | +120 −7 | 4 |`,
    );

    assert.include(markdown, '| #10 | fix: x |  | ? | +3 −1 | 1 |');

    assert.include(
      markdown,
      '| Declaration / file order | 2 | 0 | 0 | 0 | #12 #10 |',
    );

    assert.include(markdown, '- #12 → #13: stale README');

    assert.include(
      markdown,
      '- #12 (dismissed): **`autocomplete="off"`**: the browser ignores it anyway.',
    );
  });
});
