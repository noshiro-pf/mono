import { Arr } from 'ts-data-forge';
import { needsNextPage, selectMerged, type PullListItem } from './github.mjs';

const pull = (
  number: number,
  mergedAt: string | null,
  updatedAt: string,
): PullListItem =>
  ({
    number,
    title: `#${number}`,
    html_url: `https://github.com/o/r/pull/${number}`,
    body: null,
    merged_at: mergedAt,
    updated_at: updatedAt,
  }) as const;

// Newest update first, as the list endpoint returns them. #3 was commented on
// after it merged, so it is listed before #4, which merged later.
const seen = [
  pull(3, '2026-10-20T10:00:00Z', '2026-10-30T00:00:00Z'),
  pull(4, '2026-10-25T10:00:00Z', '2026-10-25T10:00:01Z'),
  pull(9, null, '2026-10-22T00:00:00Z'),
  pull(2, '2026-10-10T10:00:00Z', '2026-10-10T10:00:01Z'),
] as const;

describe('selectMerged', () => {
  test('keeps the merged ones on or after the date, newest merge first', () => {
    assert.deepStrictEqual(
      selectMerged({ kind: 'since', date: '2026-10-20' }, seen).map(
        (p) => p.number,
      ),
      [4, 3],
    );
  });

  test('counts a pull request once when the pages shifted under it', () => {
    assert.deepStrictEqual(
      selectMerged(
        { kind: 'since', date: '2026-10-01' },
        Arr.toPushed(
          seen,
          pull(2, '2026-10-10T10:00:00Z', '2026-10-10T10:00:01Z'),
        ),
      ).map((p) => p.number),
      [4, 3, 2],
    );
  });

  test('keeps the last n merged', () => {
    assert.deepStrictEqual(
      selectMerged({ kind: 'last', count: 3 }, seen).map((p) => p.number),
      [4, 3, 2],
    );
  });
});

describe('needsNextPage', () => {
  test('never after a short page', () => {
    assert.isFalse(
      needsNextPage({ kind: 'since', date: '2000-01-01' }, seen, false),
    );
  });

  test('since: while the oldest update seen is still in range', () => {
    assert.isTrue(
      needsNextPage({ kind: 'since', date: '2026-10-10' }, seen, true),
    );

    assert.isFalse(
      needsNextPage({ kind: 'since', date: '2026-10-11' }, seen, true),
    );
  });

  test('last: until n are seen and nothing later could have merged after the nth', () => {
    assert.isTrue(needsNextPage({ kind: 'last', count: 4 }, seen, true));

    // The 2nd newest merge is #3 at 10-20; a later page holds only pull
    // requests updated — so merged — no later than 10-10.
    assert.isFalse(needsNextPage({ kind: 'last', count: 2 }, seen, true));

    // The 3rd newest is #2 itself, merged just before its update at 10-10;
    // a later page could hold one merged at 10-10 between the two.
    assert.isTrue(needsNextPage({ kind: 'last', count: 3 }, seen, true));
  });
});
