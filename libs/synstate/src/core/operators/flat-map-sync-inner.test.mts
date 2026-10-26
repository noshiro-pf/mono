import type { FixedLengthTuple } from 'ts-type-forge';
import { combine } from '../combine/index.mjs';
import { just, source } from '../create/index.mjs';
import { map } from './map.mjs';
import { mergeMap } from './merge-map.mjs';
import { switchMap } from './switch-map.mjs';

describe('an inner observable that holds a value is passed on in the update that projected it', () => {
  test('switchMap: a sibling read with it is never stale', () => {
    const a$ = source<number>(1);

    // Created before `m$`, so the update visits it first.
    const s$ = a$.pipe(switchMap((x) => just(`s${x.toString()}`)));

    const m$ = a$.pipe(map((x) => `m${x.toString()}`));

    const mut_history: string[] = [];

    combine([m$, s$]).subscribe(([m, s]) => {
      mut_history.push(`${m},${s}`);
    });

    a$.next(2);

    a$.next(3);

    assert.deepStrictEqual(mut_history, ['m2,s2', 'm3,s3']);
  });

  test('switchMap: a child of both it and its parent emits once per update', () => {
    const a$ = source<number>(1);

    const s$ = a$.pipe(switchMap((x) => just(x * 10)));

    const mut_history: FixedLengthTuple<2, number>[] = [];

    combine([a$, s$]).subscribe((pair) => {
      mut_history.push(pair);
    });

    a$.next(2);

    a$.next(3);

    assert.deepStrictEqual(mut_history, [
      [2, 20],
      [3, 30],
    ]);
  });

  test('switchMap: an inner that emits later still starts an update of its own', () => {
    const a$ = source<number>();

    const inner$ = source<number>();

    const s$ = a$.pipe(switchMap(() => inner$));

    const mut_history: number[] = [];

    s$.subscribe((v) => {
      mut_history.push(v);
    });

    a$.next(1);

    inner$.next(5);

    inner$.next(6);

    assert.deepStrictEqual(mut_history, [5, 6]);
  });

  test('mergeMap: a sibling read with it is never stale', () => {
    const a$ = source<number>(1);

    const s$ = a$.pipe(mergeMap((x) => just(`s${x.toString()}`)));

    const m$ = a$.pipe(map((x) => `m${x.toString()}`));

    const mut_history: string[] = [];

    combine([m$, s$]).subscribe(([m, s]) => {
      mut_history.push(`${m},${s}`);
    });

    a$.next(2);

    assert.deepStrictEqual(mut_history, ['m2,s2']);
  });
});
