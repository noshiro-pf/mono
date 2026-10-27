// A `Date` is one of the values compared whole, so the cases build some.
/* eslint-disable unicorn/prefer-temporal */
import type { DeepReadonly, ReadonlyRecord } from 'ts-type-forge';
import { expectType } from '../expect-type.mjs';
import { hasKey, isRecord } from '../guard/index.mjs';
import { replaceEqualDeep } from './replace-equal-deep.mjs';

describe(replaceEqualDeep, () => {
  test('returns the current value when the next one is deeply equal', () => {
    const current = {
      id: 1,
      tags: ['a', 'b'],
      owner: { name: 'x', roles: [{ role: 'admin' }] },
    } as const;

    const next = {
      id: 1,
      tags: ['a', 'b'],
      owner: { name: 'x', roles: [{ role: 'admin' }] },
    } as const;

    assert.strictEqual(replaceEqualDeep(current, next), current);
  });

  test('keeps the branches that did not change and replaces the rest', () => {
    const current: Snapshot = {
      summary: { open: 3, merged: 1 },
      queue: [{ number: 1 }, { number: 2 }],
      readAt: 100,
    } as const;

    const next: Snapshot = {
      summary: { open: 3, merged: 1 },
      queue: [{ number: 1 }, { number: 3 }],
      readAt: 200,
    } as const;

    const shared = replaceEqualDeep(current, next);

    assert.deepStrictEqual(shared, next);

    assert.notStrictEqual(shared, current);

    assert.strictEqual(shared.summary, current.summary);

    assert.notStrictEqual(shared.queue, current.queue);

    assert.strictEqual(shared.queue[0], current.queue[0]);

    assert.strictEqual(shared.queue[1], next.queue[1]);

    assert.strictEqual(shared.readAt, 200);
  });

  test('returns the next primitive when it differs', () => {
    assert.strictEqual(replaceEqualDeep(1, 2), 2);

    assert.strictEqual(replaceEqualDeep('a', 'a'), 'a');

    assert.isTrue(Number.isNaN(replaceEqualDeep(Number.NaN, Number.NaN)));
  });

  test('replaces a value whose kind changed whole', () => {
    const next: unknown = { 0: 'a' } as const;

    assert.strictEqual(replaceEqualDeep<unknown>(['a'], next), next);

    const nextArray: unknown = ['a'] as const;

    assert.strictEqual(
      replaceEqualDeep<unknown>({ 0: 'a' }, nextArray),
      nextArray,
    );

    const nextNull: unknown = null;

    assert.strictEqual(replaceEqualDeep<unknown>({}, nextNull), null);
  });

  test('builds a new object when a property is added or removed', () => {
    const inner = { x: 1 } as const;

    const added = replaceEqualDeep<ReadonlyRecord<string, unknown>>(
      { inner },
      { inner: { x: 1 }, extra: true },
    );

    assert.deepStrictEqual(added, { inner: { x: 1 }, extra: true });

    assert.strictEqual(added['inner'], inner);

    const current: ReadonlyRecord<string, unknown> = {
      inner,
      gone: 1,
    } as const;

    const removed = replaceEqualDeep(current, { inner: { x: 1 } });

    assert.deepStrictEqual(removed, { inner: { x: 1 } });

    assert.notStrictEqual(removed, current);

    assert.isFalse(Object.hasOwn(removed, 'gone'));

    assert.strictEqual(removed['inner'], inner);
  });

  test('builds a new object when a property set to undefined goes missing', () => {
    const current: Readonly<{ a?: number | undefined }> = {
      a: undefined,
    } as const;

    const shared = replaceEqualDeep(current, {});

    assert.notStrictEqual(shared, current);

    assert.isFalse(Object.hasOwn(shared, 'a'));
  });

  test('matches array items by index by default', () => {
    const one: Numbered = { number: 1 } as const;

    const two: Numbered = { number: 2 } as const;

    const current: readonly Numbered[] = [one, two] as const;

    const shorter = replaceEqualDeep(current, [{ number: 1 }]);

    assert.deepStrictEqual(shorter, [{ number: 1 }]);

    assert.strictEqual(shorter[0], one);

    const longer = replaceEqualDeep(current, [
      { number: 1 },
      { number: 2 },
      { number: 3 },
    ]);

    assert.strictEqual(longer[0], one);

    assert.strictEqual(longer[1], two);

    // An item put in front moves every one after it, so nothing matches.
    const shifted = replaceEqualDeep(current, [
      { number: 0 },
      { number: 1 },
      { number: 2 },
    ]);

    assert.notStrictEqual(shifted[1], one);

    assert.notStrictEqual(shifted[2], two);
  });

  test('matches array items by key when `key` returns one', () => {
    const one: Pull = { number: 1, title: 'one' } as const;

    const two: Pull = { number: 2, title: 'two' } as const;

    const current: readonly Pull[] = [one, two] as const;

    const key = (item: unknown): unknown =>
      isRecord(item) && hasKey(item, 'number') ? item.number : undefined;

    const shared = replaceEqualDeep(
      current,
      [
        { number: 0, title: 'zero' },
        { number: 1, title: 'one' },
        { number: 2, title: 'two (edited)' },
      ],
      { key },
    );

    assert.strictEqual(shared[1], one);

    assert.notStrictEqual(shared[2], two);

    assert.deepStrictEqual(shared[2], { number: 2, title: 'two (edited)' });

    const reordered = replaceEqualDeep(
      current,
      [
        { number: 2, title: 'two' },
        { number: 1, title: 'one' },
      ],
      { key },
    );

    assert.notStrictEqual(reordered, current);

    assert.strictEqual(reordered[0], two);

    assert.strictEqual(reordered[1], one);

    const same = replaceEqualDeep(
      current,
      [
        { number: 1, title: 'one' },
        { number: 2, title: 'two' },
      ],
      { key },
    );

    assert.strictEqual(same, current);
  });

  test('matches by index the items `key` gives no key, at every depth', () => {
    const key = (item: unknown): unknown =>
      isRecord(item) && hasKey(item, 'id') ? item.id : undefined;

    const labels: readonly string[] = ['bug', 'ui'] as const;

    const current: readonly Labeled[] = [{ id: 'a', labels }] as const;

    const shared = replaceEqualDeep(
      current,
      [
        { id: 'b', labels: ['x'] },
        { id: 'a', labels: ['bug', 'ui'] },
      ],
      { key },
    );

    assert.strictEqual(shared[1], current[0]);

    assert.strictEqual(shared[1]?.labels, labels);
  });

  test('compares a Map, a Set, a Date or a class instance whole', () => {
    const map = new Map<string, Readonly<{ x: number }>>([['a', { x: 1 }]]);

    assert.strictEqual(
      replaceEqualDeep(
        map,
        new Map<string, Readonly<{ x: number }>>([['a', { x: 1 }]]),
      ),
      map,
    );

    const changedMap = new Map<string, Readonly<{ x: number }>>([
      ['a', { x: 1 }],
      ['b', { x: 2 }],
    ]);

    const sharedMap = replaceEqualDeep(map, changedMap);

    assert.strictEqual(sharedMap, changedMap);

    // Nothing inside is reused.
    assert.notStrictEqual(sharedMap.get('a'), map.get('a'));

    const set = new Set<number>([1, 2]);

    assert.strictEqual(replaceEqualDeep(set, new Set<number>([1, 2])), set);

    const date = new Date(0);

    assert.strictEqual(replaceEqualDeep(date, new Date(0)), date);

    const laterDate = new Date(1);

    assert.strictEqual(replaceEqualDeep(date, laterDate), laterDate);

    class Point {
      readonly x: number;

      readonly inner: Readonly<{ y: number }>;

      constructor(x: number, y: number) {
        this.x = x;

        this.inner = { y };
      }
    }

    const point = new Point(1, 2);

    assert.strictEqual(replaceEqualDeep(point, new Point(1, 2)), point);

    const moved = new Point(3, 2);

    const sharedPoint = replaceEqualDeep(point, moved);

    assert.strictEqual(sharedPoint, moved);

    assert.notStrictEqual(sharedPoint.inner, point.inner);
  });

  test('reuses a Map compared whole inside a plain object', () => {
    const map = new Map<string, number>([['a', 1]]);

    const current = { map, count: 1 } as const;

    const shared = replaceEqualDeep(current, {
      map: new Map<string, number>([['a', 1]]),
      count: 2,
    });

    assert.strictEqual(shared.map, map);

    assert.strictEqual(shared.count, 2);
  });

  test('changes neither argument', () => {
    const current: Listed = { list: [{ a: 1 }, { a: 2 }] } as const;

    const next: Listed = { list: [{ a: 1 }, { a: 3 }] } as const;

    const currentCopy = structuredClone(current);

    const nextCopy = structuredClone(next);

    replaceEqualDeep(current, next);

    assert.deepStrictEqual(current, currentCopy);

    assert.deepStrictEqual(next, nextCopy);
  });

  test('keeps the type of its arguments', () => {
    type PullReport = Readonly<{
      entries: readonly Readonly<{ number: number }>[];
    }>;

    const report: PullReport = { entries: [] } as const;

    const shared = replaceEqualDeep(report, { entries: [{ number: 1 }] });

    expectType<typeof shared, PullReport>('=');

    assert.deepStrictEqual(shared, { entries: [{ number: 1 }] });
  });
});

type Snapshot = DeepReadonly<{
  summary: { open: number; merged: number };
  queue: { number: number }[];
  readAt: number;
}>;

type Numbered = Readonly<{ number: number }>;

type Pull = Readonly<{ number: number; title: string }>;

type Labeled = Readonly<{ id: string; labels: readonly string[] }>;

type Listed = DeepReadonly<{ list: { a: number }[] }>;
