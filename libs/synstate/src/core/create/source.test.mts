import { expectType } from 'ts-data-forge';
import type { SourceObservable } from '../types/index.mjs';
import { source } from './source.mjs';

describe(source, () => {
  test('`next` returns the value it passed on', () => {
    const count$ = source<number>(0);

    assert.strictEqual(count$.next(1), 1);

    assert.strictEqual(count$.getSnapshot().value, 1);
  });

  test('once completed, `next` passes nothing on and returns the value held', () => {
    const count$ = source<number>(0);

    const mut_seen: number[] = [];

    count$.subscribe((value) => {
      mut_seen.push(value);
    });

    count$.next(1);

    count$.complete();

    assert.strictEqual(count$.next(2), 1);

    assert.deepStrictEqual(mut_seen, [0, 1]);
  });

  test('`next` returns the value only on a source with an initial value', () => {
    const passed = source<number>(0).next(1);

    expectType<typeof passed, number>('=');

    assert.strictEqual(passed, 1);

    expectType<SourceObservable<number>['next'], (value: number) => void>('=');
  });
});
