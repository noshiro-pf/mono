import { source } from '../create/index.mjs';
import { createScope } from '../scope/index.mjs';
import { map } from './map.mjs';
import { mergeMap } from './merge-map.mjs';
import { switchMap } from './switch-map.mjs';

describe('switchMap releases only the inner observables its projection created (#2335)', () => {
  test('a shared inner survives a switch', () => {
    const user$ = source<'a' | 'b'>();

    const a$ = source<number>();

    const b$ = source<number>();

    const current$ = user$.pipe(switchMap((u) => (u === 'a' ? a$ : b$)));

    const mut_current: number[] = [];

    current$.subscribe((v) => {
      mut_current.push(v);
    });

    const mut_others: number[] = [];

    a$.subscribe((v) => {
      mut_others.push(v);
    });

    user$.next('a');

    a$.next(1);

    user$.next('b');

    assert.isFalse(a$.isCompleted);

    a$.next(2);

    b$.next(3);

    assert.deepStrictEqual(mut_others, [1, 2]);

    assert.deepStrictEqual(mut_current, [1, 3]);
  });

  test('a shared inner survives the completion of switchMap', () => {
    const user$ = source<'a'>();

    const a$ = source<number>();

    const current$ = user$.pipe(switchMap(() => a$));

    current$.subscribe(() => {});

    user$.next('a');

    current$.complete();

    assert.isFalse(a$.isCompleted);

    const mut_others: number[] = [];

    a$.subscribe((v) => {
      mut_others.push(v);
    });

    a$.next(1);

    assert.deepStrictEqual(mut_others, [1]);
  });

  test('a node derived in the projection from a shared observable is released, and the shared one survives', () => {
    const user$ = source<number>();

    const shared$ = source<number>();

    const mut_derived: { isCompleted: boolean }[] = [];

    const current$ = user$.pipe(
      switchMap((u) => {
        const derived$ = shared$.pipe(map((x) => x + u));

        mut_derived.push(derived$);

        return derived$;
      }),
    );

    current$.subscribe(() => {});

    user$.next(1);

    user$.next(2);

    assert.deepStrictEqual(
      mut_derived.map((o) => o.isCompleted),
      [true, false],
    );

    assert.isFalse(shared$.isCompleted);

    current$.complete();

    assert.deepStrictEqual(
      mut_derived.map((o) => o.isCompleted),
      [true, true],
    );

    assert.isFalse(shared$.isCompleted);
  });

  test('every node the projection created is released on a switch, not only the returned one', () => {
    const user$ = source<number>();

    const mut_created: { isCompleted: boolean }[] = [];

    const current$ = user$.pipe(
      switchMap((u) => {
        const inner$ = source<number>();

        const mapped$ = inner$.pipe(map((x) => x + u));

        mut_created.push(inner$, mapped$);

        return mapped$;
      }),
    );

    current$.subscribe(() => {});

    user$.next(1);

    user$.next(2);

    assert.deepStrictEqual(
      mut_created.map((o) => o.isCompleted),
      [true, true, false, false],
    );

    current$.complete();

    assert.deepStrictEqual(
      mut_created.map((o) => o.isCompleted),
      [true, true, true, true],
    );
  });
});

describe('the scope switchMap and mergeMap were created in (#2335)', () => {
  test('disposing it releases what their projections created, and the shared inners survive', () => {
    const user$ = source<number>();

    const shared$ = source<number>();

    const mut_created: { isCompleted: boolean }[] = [];

    const scope = createScope();

    scope.run(() => {
      user$
        .pipe(
          switchMap(() => {
            const inner$ = source<number>();

            mut_created.push(inner$);

            return inner$;
          }),
        )
        .subscribe(() => {});

      user$.pipe(mergeMap(() => shared$)).subscribe(() => {});
    });

    user$.next(1);

    assert.deepStrictEqual(
      mut_created.map((o) => o.isCompleted),
      [false],
    );

    scope.dispose();

    assert.deepStrictEqual(
      mut_created.map((o) => o.isCompleted),
      [true],
    );

    assert.isFalse(shared$.isCompleted);

    assert.isFalse(user$.isCompleted);
  });
});

describe('mergeMap releases only the inner observables its projection created (#2335)', () => {
  test('a shared inner survives the completion of mergeMap', () => {
    const user$ = source<'a' | 'b'>();

    const a$ = source<number>();

    const b$ = source<number>();

    const merged$ = user$.pipe(mergeMap((u) => (u === 'a' ? a$ : b$)));

    const mut_merged: number[] = [];

    merged$.subscribe((v) => {
      mut_merged.push(v);
    });

    user$.next('a');

    user$.next('b');

    a$.next(1);

    b$.next(2);

    assert.deepStrictEqual(mut_merged, [1, 2]);

    merged$.complete();

    assert.isFalse(a$.isCompleted);

    assert.isFalse(b$.isCompleted);

    const mut_others: number[] = [];

    a$.subscribe((v) => {
      mut_others.push(v);
    });

    a$.next(3);

    // A new subscriber receives the current value first.
    assert.deepStrictEqual(mut_others, [1, 3]);

    assert.deepStrictEqual(mut_merged, [1, 2]);
  });

  test('every node the projection created is released on completion', () => {
    const user$ = source<number>();

    const shared$ = source<number>();

    const mut_created: { isCompleted: boolean }[] = [];

    const merged$ = user$.pipe(
      mergeMap((u) => {
        const inner$ = source<number>();

        const derived$ = shared$.pipe(map((x) => x + u));

        mut_created.push(inner$, derived$);

        return inner$;
      }),
    );

    merged$.subscribe(() => {});

    user$.next(1);

    user$.next(2);

    assert.deepStrictEqual(
      mut_created.map((o) => o.isCompleted),
      [false, false, false, false],
    );

    merged$.complete();

    assert.deepStrictEqual(
      mut_created.map((o) => o.isCompleted),
      [true, true, true, true],
    );

    assert.isFalse(shared$.isCompleted);
  });
});
