import { hasKey, isRecord, Optional } from 'ts-data-forge';
import { source } from '../create/index.mjs';
import { keepEqualParts } from './keep-equal-parts.mjs';
import { map } from './map.mjs';
import { skipIfNoChange } from './skip-if-no-change.mjs';

type Report = Readonly<{
  readAt: number;
  summary: Readonly<{ open: number }>;
  entries: readonly Readonly<{ number: number; title: string }>[];
}>;

describe(keepEqualParts, () => {
  test('passes on nothing when the next value is deeply equal to the last one', () => {
    const report$ = source<Report>();

    const kept$ = report$.pipe(keepEqualParts());

    const seen = record(kept$);

    report$.next(report(1, [entry(1, 'a')]));

    report$.next(report(1, [entry(1, 'a')]));

    assert.strictEqual(seen.length, 1);
  });

  test('passes on a new root whose unchanged branches are the ones passed on before', () => {
    const report$ = source<Report>();

    const kept$ = report$.pipe(keepEqualParts());

    const seen = record(kept$);

    report$.next(report(1, [entry(1, 'a'), entry(2, 'b')]));

    report$.next(report(2, [entry(1, 'a'), entry(2, 'b (edited)')]));

    assert.strictEqual(seen.length, 2);

    const [first, second] = seen;

    assert.notStrictEqual(second, first);

    assert.strictEqual(second?.summary, first?.summary);

    assert.strictEqual(second?.entries[0], first?.entries[0]);

    assert.notStrictEqual(second?.entries[1], first?.entries[1]);

    assert.strictEqual(second?.readAt, 2);
  });

  test('matches array items by `key`', () => {
    const report$ = source<Report>();

    const kept$ = report$.pipe(
      keepEqualParts({
        key: (item) =>
          isRecord(item) && hasKey(item, 'number') ? item.number : undefined,
      }),
    );

    const seen = record(kept$);

    report$.next(report(1, [entry(1, 'a')]));

    report$.next(report(1, [entry(0, 'new'), entry(1, 'a')]));

    const [first, second] = seen;

    assert.strictEqual(second?.entries[1], first?.entries[0]);
  });

  test('keeps the initial value of an initialized parent', () => {
    const initial = report(1, []);

    const report$ = source<Report>(initial);

    const kept$ = report$.pipe(keepEqualParts());

    assert.strictEqual(
      Optional.unwrapOr(kept$.getSnapshot(), undefined),
      initial,
    );

    const seen = record(kept$);

    report$.next(report(1, []));

    assert.deepStrictEqual(seen, [initial]);
  });

  test('lets `skipIfNoChange()` stop a part that did not change', () => {
    const report$ = source<Report>(report(1, [entry(1, 'a')]));

    const summaries = record(
      report$
        .pipe(keepEqualParts())
        .pipe(map((held) => held.summary))
        .pipe(skipIfNoChange()),
    );

    report$.next(report(2, [entry(1, 'a')]));

    assert.strictEqual(summaries.length, 1);
  });
});

const entry = (
  number: number,
  title: string,
): Readonly<{ number: number; title: string }> => ({ number, title }) as const;

const report = (readAt: number, entries: Report['entries']): Report =>
  ({
    readAt,
    summary: { open: entries.length },
    entries,
  }) as const;

const record = <A,>(
  observable: Readonly<{ subscribe: (onNext: (value: A) => void) => unknown }>,
): readonly A[] => {
  const mut_seen: A[] = [];

  observable.subscribe((value) => {
    mut_seen.push(value);
  });

  return mut_seen;
};
