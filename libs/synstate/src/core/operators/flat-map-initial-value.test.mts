import { Optional } from 'ts-data-forge';
import { panic } from 'ts-std-forge';
import { toNode } from '../class/index.mjs';
import { just, source } from '../create/index.mjs';
import { onScopeDispose } from '../scope/index.mjs';
import type { Observable } from '../types/index.mjs';
import { filter } from './filter.mjs';
import { map } from './map.mjs';
import { mergeMap } from './merge-map.mjs';
import { skipWhile } from './skip-while.mjs';
import { switchMap } from './switch-map.mjs';

describe('the value the source holds when the operator is created is projected', () => {
  test('switchMap: a sync inner gives the operator its value at once', () => {
    const a$ = source<number>(1);

    const s$ = a$.pipe(switchMap((x) => just(x * 10)));

    assert.deepStrictEqual(s$.getSnapshot(), Optional.some(10));

    const mut_history: number[] = [];

    s$.subscribe((v) => {
      mut_history.push(v);
    });

    a$.next(2);

    assert.deepStrictEqual(mut_history, [10, 20]);
  });

  test('switchMap: a later value of the first inner is passed on', () => {
    const a$ = source<number>(1);

    const inner$ = source<string>();

    const mut_projected: number[] = [];

    const s$ = a$.pipe(
      switchMap((x) => {
        mut_projected.push(x);

        return inner$;
      }),
    );

    assert.deepStrictEqual(mut_projected, [1]);

    const mut_history: string[] = [];

    s$.subscribe((v) => {
      mut_history.push(v);
    });

    inner$.next('a');

    assert.deepStrictEqual(mut_history, ['a']);
  });

  test('switchMap: the next value of the source switches away from the first inner', () => {
    const a$ = source<number>(1);

    const first$ = source<string>();

    const second$ = source<string>();

    const s$ = a$.pipe(switchMap((x) => (x === 1 ? first$ : second$)));

    const mut_history: string[] = [];

    s$.subscribe((v) => {
      mut_history.push(v);
    });

    a$.next(2);

    first$.next('stale');

    second$.next('b');

    assert.deepStrictEqual(mut_history, ['b']);
  });

  test('switchMap: what the first projection created is disposed when it is switched away from', () => {
    const a$ = source<number>(1);

    const mut_disposed: number[] = [];

    const s$ = a$.pipe(
      switchMap((x) => {
        onScopeDispose(() => {
          mut_disposed.push(x);
        });

        return just(x);
      }),
    );

    s$.subscribe(() => undefined);

    assert.deepStrictEqual(mut_disposed, []);

    a$.next(2);

    assert.deepStrictEqual(mut_disposed, [1]);
  });

  test('switchMap: a source with no value projects nothing until it emits', () => {
    const a$ = source<number>();

    const mut_projected: number[] = [];

    const s$ = a$.pipe(
      switchMap((x) => {
        mut_projected.push(x);

        return just(x);
      }),
    );

    assert.isTrue(Optional.isNone(s$.getSnapshot()));

    a$.next(1);

    assert.deepStrictEqual(mut_projected, [1]);
  });

  test('switchMap: a value carried through filter and map is projected', () => {
    const a$ = source<Optional<number>>(Optional.some(42));

    const s$ = a$
      .pipe(filter(Optional.isSome))
      .pipe(map((some) => Optional.unwrap(some)))
      .pipe(switchMap((id) => just(`item ${id.toString()}`)));

    assert.deepStrictEqual(s$.getSnapshot(), Optional.some('item 42'));
  });

  test('switchMap: a completed source projects nothing and completes', () => {
    const a$ = just(1);

    const mut_projected: number[] = [];

    const s$ = a$.pipe(
      switchMap((x) => {
        mut_projected.push(x);

        return just(x);
      }),
    );

    assert.deepStrictEqual(mut_projected, []);

    assert.isTrue(s$.isCompleted);
  });

  test('mergeMap: a completed source projects nothing and completes', () => {
    const a$ = just(1);

    const mut_projected: number[] = [];

    const s$ = a$.pipe(
      mergeMap((x) => {
        mut_projected.push(x);

        return just(x);
      }),
    );

    assert.deepStrictEqual(mut_projected, []);

    assert.isTrue(s$.isCompleted);
  });

  test('mergeMap: the first inner and the later ones are merged', () => {
    const a$ = source<number>(1);

    const first$ = source<string>();

    const second$ = source<string>();

    const s$ = a$.pipe(mergeMap((x) => (x === 1 ? first$ : second$)));

    const mut_history: string[] = [];

    s$.subscribe((v) => {
      mut_history.push(v);
    });

    a$.next(2);

    first$.next('a');

    second$.next('b');

    assert.deepStrictEqual(mut_history, ['a', 'b']);
  });

  test('mergeMap: a sync inner gives the operator its value at once', () => {
    const a$ = source<number>(1);

    const s$ = a$.pipe(mergeMap((x) => just(x * 10)));

    assert.deepStrictEqual(s$.getSnapshot(), Optional.some(10));
  });

  test('switchMap: a first projection that throws leaves nothing attached to the source', () => {
    const a$ = source<number>(1);

    const mut_projected: number[] = [];

    assert.throws(() => {
      a$.pipe(
        switchMap((x) => {
          mut_projected.push(x);

          // Made in the projection's scope before it throws.
          a$.pipe(map((v) => v + 1));

          if (x === 1) {
            panic('first');
          }

          return just(x);
        }),
      );
    }, /first/u);

    assert.isFalse(toNode(a$).hasChild);

    a$.next(2);

    assert.deepStrictEqual(mut_projected, [1]);
  });

  test('mergeMap: a first projection that throws leaves nothing attached to the source', () => {
    const a$ = source<number>(1);

    assert.throws(() => {
      a$.pipe(
        mergeMap((): Observable<number> => {
          a$.pipe(map((v) => v + 1));

          panic('first');
        }),
      );
    }, /first/u);

    assert.isFalse(toNode(a$).hasChild);
  });

  test('switchMap: skipWhile on the held value before it keeps that value from being projected', () => {
    const a$ = source<number>(1);

    const mut_projected: number[] = [];

    a$.pipe(skipWhile((_, index) => index === -1)).pipe(
      switchMap((x) => {
        mut_projected.push(x);

        return just(x);
      }),
    );

    a$.next(2);

    assert.deepStrictEqual(mut_projected, [2]);
  });
});
