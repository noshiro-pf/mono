import { source } from '../create/index.mjs';
import { map, mergeMap, switchMap, takeUntil } from '../operators/index.mjs';
import { createScope, onScopeDispose, untracked } from './scope.mjs';

describe('subscribe in a scope', () => {
  test('a subscription made inside run ends when the scope is disposed', () => {
    const store$ = source<number>();

    const scope = createScope();

    const mut_seen: number[] = [];

    scope.run(() => {
      store$.subscribe((x) => {
        mut_seen.push(x);
      });
    });

    store$.next(1);

    scope.dispose();

    store$.next(2);

    assert.deepStrictEqual(mut_seen, [1]);
  });

  test('a subscription made outside every scope, or inside untracked, is not ended by a scope', () => {
    const store$ = source<number>();

    const scope = createScope();

    const mut_outside: number[] = [];

    const mut_untracked: number[] = [];

    store$.subscribe((x) => {
      mut_outside.push(x);
    });

    scope.run(() => {
      untracked(() => {
        store$.subscribe((x) => {
          mut_untracked.push(x);
        });
      });
    });

    scope.dispose();

    store$.next(1);

    assert.deepStrictEqual(mut_outside, [1]);

    assert.deepStrictEqual(mut_untracked, [1]);
  });

  test('unsubscribing before the scope is disposed ends the subscription, and dispose is then harmless', () => {
    const store$ = source<number>();

    const scope = createScope();

    const mut_seen: number[] = [];

    const subscription = scope.run(() =>
      store$.subscribe((x) => {
        mut_seen.push(x);
      }),
    );

    store$.next(1);

    subscription.unsubscribe();

    store$.next(2);

    scope.dispose();

    subscription.unsubscribe();

    assert.deepStrictEqual(mut_seen, [1]);
  });

  test('a subscription made in the scope ends before the scope disposes its nodes, so it hears no completion', () => {
    const store$ = source<number>();

    const scope = createScope();

    const mut_events: string[] = [];

    scope.run(() => {
      const owned$ = store$.pipe(map((x) => x));

      owned$.subscribe(
        () => {
          mut_events.push('next');
        },
        () => {
          mut_events.push('complete');
        },
      );
    });

    scope.dispose();

    assert.deepStrictEqual(mut_events, []);
  });

  test('a subscription made in the scope ends before its cleanups run, so a value a cleanup writes is not heard', () => {
    const store$ = source<number>();

    const scope = createScope();

    const mut_seen: number[] = [];

    scope.run(() => {
      onScopeDispose(() => {
        store$.next(2);
      });

      store$.subscribe((x) => {
        mut_seen.push(x);
      });
    });

    store$.next(1);

    scope.dispose();

    assert.deepStrictEqual(mut_seen, [1]);
  });

  test("a subscription made in the scope ends before its child scopes are disposed, so it hears neither a child's cleanup nor a child's observable completing", () => {
    const store$ = source<number>();

    const parent = createScope();

    const mut_events: string[] = [];

    parent.run(() => {
      const child = createScope(parent);

      const inner$ = child.run(() => {
        onScopeDispose(() => {
          store$.next(2);
        });

        return store$.pipe(map((x) => x * 10));
      });

      store$.subscribe((x) => {
        mut_events.push(`store ${x.toString()}`);
      });

      inner$.subscribe(
        (x) => {
          mut_events.push(`inner ${x.toString()}`);
        },
        () => {
          mut_events.push('inner complete');
        },
      );
    });

    store$.next(1);

    parent.dispose();

    assert.deepStrictEqual(mut_events, ['store 1', 'inner 10']);
  });

  test('a subscription made in a child scope ends with the parent', () => {
    const store$ = source<number>();

    const parent = createScope();

    const child = createScope(parent);

    const mut_seen: number[] = [];

    child.run(() => {
      store$.subscribe((x) => {
        mut_seen.push(x);
      });
    });

    parent.dispose();

    store$.next(1);

    assert.deepStrictEqual(mut_seen, []);
  });

  test("switchMap's inner subscription made while another scope runs is not ended by that scope", () => {
    const trigger$ = source<number>();

    const inner$ = source<string>();

    const out$ = trigger$.pipe(switchMap(() => inner$));

    const mut_seen: string[] = [];

    out$.subscribe((x) => {
      mut_seen.push(x);
    });

    const unrelated = createScope();

    unrelated.run(() => {
      trigger$.next(1);
    });

    unrelated.dispose();

    inner$.next('a');

    assert.deepStrictEqual(mut_seen, ['a']);
  });

  test("mergeMap's inner subscription made while another scope runs is not ended by that scope", () => {
    const trigger$ = source<number>();

    const inner$ = source<string>();

    const out$ = trigger$.pipe(mergeMap(() => inner$));

    const mut_seen: string[] = [];

    out$.subscribe((x) => {
      mut_seen.push(x);
    });

    const unrelated = createScope();

    unrelated.run(() => {
      trigger$.next(1);
    });

    unrelated.dispose();

    inner$.next('a');

    assert.deepStrictEqual(mut_seen, ['a']);
  });

  test('a subscription a subscriber makes while a scope writes a value is not ended by that scope', () => {
    const trigger$ = source<number>();

    const other$ = source<string>();

    const mut_seen: string[] = [];

    trigger$.subscribe(() => {
      other$.subscribe((x) => {
        mut_seen.push(x);
      });
    });

    const component = createScope();

    component.run(() => {
      trigger$.next(1);
    });

    component.dispose();

    other$.next('a');

    assert.deepStrictEqual(mut_seen, ['a']);
  });

  test('a subscription a subscriber makes on hearing a completion inside a scope is not ended by that scope', () => {
    const trigger$ = source<number>();

    const other$ = source<string>();

    const mut_seen: string[] = [];

    trigger$.subscribe(
      () => {},
      () => {
        other$.subscribe((x) => {
          mut_seen.push(x);
        });
      },
    );

    const component = createScope();

    component.run(() => {
      trigger$.complete();
    });

    component.dispose();

    other$.next('a');

    assert.deepStrictEqual(mut_seen, ['a']);
  });

  test('a subscription in a scope still hears its observable complete', () => {
    const store$ = source<number>();

    const scope = createScope();

    const mut_events: string[] = [];

    scope.run(() => {
      store$.subscribe(
        (x) => {
          mut_events.push(`next ${x.toString()}`);
        },
        () => {
          mut_events.push('complete');
        },
      );
    });

    store$.next(1);

    store$.complete();

    scope.dispose();

    assert.deepStrictEqual(mut_events, ['next 1', 'complete']);
  });

  test('a subscription made in a scope disposed during its own run ends at once', () => {
    const store$ = source<number>();

    const scope = createScope();

    const mut_seen: number[] = [];

    scope.run(() => {
      scope.dispose();

      store$.subscribe((x) => {
        mut_seen.push(x);
      });
    });

    store$.next(1);

    assert.deepStrictEqual(mut_seen, []);
  });

  test('many subscriptions ended one by one in a long-lived scope leave the rest working', () => {
    const store$ = source<number>();

    const scope = createScope();

    const mut_seen: number[] = [];

    const subscriptions = scope.run(() =>
      Array.from({ length: 100 }, (_, i) =>
        store$.subscribe(() => {
          mut_seen.push(i);
        }),
      ),
    );

    for (const [i, subscription] of subscriptions.entries()) {
      if (i % 10 !== 0) {
        subscription.unsubscribe();
      }
    }

    store$.next(0);

    scope.dispose();

    store$.next(1);

    assert.deepStrictEqual(
      mut_seen,
      Array.from({ length: 10 }, (_, k) => k * 10),
    );
  });

  test('an operator created inside a scope subscribes to its notifier as part of its node, which the scope disposes', () => {
    const store$ = source<number>();

    const notifier$ = source<string>();

    const scope = createScope();

    const until$ = scope.run(() => store$.pipe(takeUntil(notifier$)));

    scope.dispose();

    assert.isTrue(until$.isCompleted);
  });
});
