import { Optional } from 'ts-data-forge';
import { panic } from 'ts-std-forge';
import { toNode } from '../class/index.mjs';
import { just, source } from '../create/index.mjs';
import { createScope, onScopeDispose } from '../scope/index.mjs';
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

describe('switchMap and mergeMap release at once what a projection that threw on a later value made (#3134)', () => {
  test('switchMap: disposes it at the throw, and goes on switching', () => {
    const user$ = source<number>();

    const other$ = source<number>(0);

    const mut_disposed: number[] = [];

    const current$ = user$.pipe(
      switchMap((u) => {
        onScopeDispose(() => {
          mut_disposed.push(u);
        });

        // Made in the projection's scope before it throws.
        other$.pipe(map((v) => v + u));

        if (u === 2) {
          panic('projection failed');
        }

        return just(u);
      }),
    );

    const mut_values: number[] = [];

    current$.subscribe((v) => {
      mut_values.push(v);
    });

    user$.next(1);

    expect(() => {
      user$.next(2);
    }).toThrow('projection failed');

    assert.deepStrictEqual(mut_disposed, [1, 2]);

    assert.isFalse(toNode(other$).hasChild);

    user$.next(3);

    assert.deepStrictEqual(mut_values, [1, 3]);

    current$.complete();

    assert.deepStrictEqual(mut_disposed, [1, 2, 3]);
  });

  test('switchMap: keeps the inner a write from inside the projection switched to before it threw', () => {
    const user$ = source<number>();

    const mut_disposed: number[] = [];

    const current$ = user$.pipe(
      switchMap((u) => {
        onScopeDispose(() => {
          mut_disposed.push(u);
        });

        if (u === 1) {
          user$.next(2);

          panic('projection failed');
        }

        return source<number>();
      }),
    );

    current$.subscribe(() => {});

    expect(() => {
      user$.next(1);
    }).toThrow('projection failed');

    assert.deepStrictEqual(mut_disposed, [1]);

    current$.complete();

    assert.deepStrictEqual(mut_disposed, [1, 2]);
  });

  test('switchMap: disposes it at once when subscribing to the inner observable throws', () => {
    const user$ = source<number>();

    const mut_disposed: number[] = [];

    const current$ = user$.pipe(
      switchMap((u) => {
        onScopeDispose(() => {
          mut_disposed.push(u);
        });

        return source<number>(u);
      }),
    );

    current$.subscribe(() => {
      panic('subscriber failed');
    });

    expect(() => {
      user$.next(1);
    }).toThrow('subscriber failed');

    assert.deepStrictEqual(mut_disposed, [1]);
  });

  test('mergeMap: disposes it at the throw, not when mergeMap completes', () => {
    const click$ = source<number>();

    const other$ = source<number>(0);

    const mut_disposed: number[] = [];

    const merged$ = click$.pipe(
      mergeMap((n) => {
        onScopeDispose(() => {
          mut_disposed.push(n);
        });

        if (n === 2) {
          // Made in the projection's scope before it throws.
          other$.pipe(map((v) => v + n));

          panic('projection failed');
        }

        // Kept live, so that neither it nor `mergeMap` completes.
        return source<number>();
      }),
    );

    merged$.subscribe(() => {});

    click$.next(1);

    expect(() => {
      click$.next(2);
    }).toThrow('projection failed');

    assert.deepStrictEqual(mut_disposed, [2]);

    assert.isFalse(toNode(other$).hasChild);

    merged$.complete();

    assert.deepStrictEqual(mut_disposed, [2, 1]);
  });

  test('mergeMap: disposes it at once when subscribing to the inner observable throws', () => {
    const click$ = source<number>();

    const mut_disposed: number[] = [];

    const merged$ = click$.pipe(
      mergeMap((n) => {
        onScopeDispose(() => {
          mut_disposed.push(n);
        });

        return source<number>(n);
      }),
    );

    merged$.subscribe(() => {
      panic('subscriber failed');
    });

    expect(() => {
      click$.next(1);
    }).toThrow('subscriber failed');

    assert.deepStrictEqual(mut_disposed, [1]);
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

describe('mergeMap releases an inner observable as soon as it completes (#2769)', () => {
  test('disposes what the projection made once its inner observable completes', () => {
    const click$ = source<number>();

    const mut_inners: ReturnType<typeof source<string>>[] = [];

    const mut_disposed: number[] = [];

    const merged$ = click$.pipe(
      mergeMap((n) => {
        onScopeDispose(() => {
          mut_disposed.push(n);
        });

        const inner$ = source<string>();

        mut_inners.push(inner$);

        return inner$;
      }),
    );

    const mut_values: string[] = [];

    merged$.subscribe((v) => {
      mut_values.push(v);
    });

    click$.next(1);

    click$.next(2);

    mut_inners[0]?.next('a');

    mut_inners[0]?.complete();

    assert.deepStrictEqual(mut_disposed, [1]);

    mut_inners[1]?.next('b');

    assert.deepStrictEqual(mut_values, ['a', 'b']);

    merged$.complete();

    // Each projection's scope is disposed once.
    assert.deepStrictEqual(mut_disposed, [1, 2]);
  });

  test('disposes at once what the projection made when its inner observable completes while subscribed', () => {
    const click$ = source<number>();

    const mut_disposed: number[] = [];

    const merged$ = click$.pipe(
      mergeMap((n) => {
        onScopeDispose(() => {
          mut_disposed.push(n);
        });

        return just(n);
      }),
    );

    const mut_values: number[] = [];

    merged$.subscribe((v) => {
      mut_values.push(v);
    });

    click$.next(1);

    click$.next(2);

    assert.deepStrictEqual(mut_values, [1, 2]);

    assert.deepStrictEqual(mut_disposed, [1, 2]);

    merged$.complete();

    assert.deepStrictEqual(mut_disposed, [1, 2]);
  });

  test('releases an inner observable when mergeMap completes while subscribing to it', () => {
    const click$ = source<number>();

    const inner$ = source<string>('first');

    const mut_disposed: number[] = [];

    const merged$ = click$.pipe(
      mergeMap((n) => {
        onScopeDispose(() => {
          mut_disposed.push(n);
        });

        return inner$;
      }),
    );

    merged$.subscribe((v) => {
      if (v === 'first') {
        merged$.complete();
      }
    });

    click$.next(1);

    assert.isTrue(merged$.isCompleted);

    assert.deepStrictEqual(mut_disposed, [1]);

    assert.isFalse(toNode(inner$).hasSubscriber);
  });
});

describe('a source write or completion during a projection (#3550)', () => {
  test('switchMap: a write from the projection switches to its value, and the outer projection subscribes to nothing', () => {
    const user$ = source<number>();

    const a$ = source<string>();

    const b$ = source<string>();

    const current$ = user$.pipe(
      switchMap((u) => {
        if (u === 1) {
          user$.next(2);

          return a$;
        }

        return b$;
      }),
    );

    const mut_current: string[] = [];

    current$.subscribe((v) => {
      mut_current.push(v);
    });

    user$.next(1);

    a$.next('a');

    b$.next('b');

    assert.deepStrictEqual(mut_current, ['b']);

    assert.isFalse(toNode(a$).hasSubscriber);

    current$.complete();

    assert.isFalse(toNode(b$).hasSubscriber);
  });

  test('switchMap: what the switched-away projection makes after the write is disposed', () => {
    const user$ = source<number>();

    const store$ = source<number>();

    const mut_made: { isCompleted: boolean }[] = [];

    const current$ = user$.pipe(
      switchMap((u) => {
        if (u === 1) {
          user$.next(2);
        }

        const made$ = store$.pipe(map((x) => x));

        mut_made.push(made$);

        return made$;
      }),
    );

    current$.subscribe(() => {});

    user$.next(1);

    // The inner projection (2) ran first, inside the outer one (1).
    assert.deepStrictEqual(
      mut_made.map((made) => made.isCompleted),
      [false, true],
    );
  });

  test('switchMap: completing during the projection subscribes to nothing, and disposes what it made', () => {
    const user$ = source<number>();

    const shared$ = source<string>('shared');

    const store$ = source<number>();

    const mut_made: { isCompleted: boolean }[] = [];

    const mut_current: string[] = [];

    const current$ = user$.pipe(
      switchMap(() => {
        current$.complete();

        mut_made.push(store$.pipe(map((x) => x)));

        return shared$;
      }),
    );

    current$.subscribe((v) => {
      mut_current.push(v);
    });

    user$.next(1);

    assert.isTrue(current$.isCompleted);

    assert.isFalse(toNode(shared$).hasSubscriber);

    assert.deepStrictEqual(
      mut_made.map((made) => made.isCompleted),
      [true],
    );

    shared$.next('later');

    assert.deepStrictEqual(mut_current, []);

    assert.isTrue(Optional.isNone(current$.getSnapshot()));
  });

  test('switchMap: completing while subscribing to the inner releases it', () => {
    const user$ = source<number>();

    const inner$ = source<string>('first');

    const mut_disposed: number[] = [];

    const current$ = user$.pipe(
      switchMap((u) => {
        onScopeDispose(() => {
          mut_disposed.push(u);
        });

        return inner$;
      }),
    );

    current$.subscribe((v) => {
      if (v === 'first') {
        current$.complete();
      }
    });

    user$.next(1);

    assert.isTrue(current$.isCompleted);

    assert.deepStrictEqual(mut_disposed, [1]);

    assert.isFalse(toNode(inner$).hasSubscriber);
  });

  test('mergeMap: completing during the projection subscribes to nothing, and disposes what it made', () => {
    const click$ = source<number>();

    const shared$ = source<string>('shared');

    const store$ = source<number>();

    const mut_made: { isCompleted: boolean }[] = [];

    const merged$ = click$.pipe(
      mergeMap(() => {
        merged$.complete();

        mut_made.push(store$.pipe(map((x) => x)));

        return shared$;
      }),
    );

    merged$.subscribe(() => {});

    click$.next(1);

    assert.isTrue(merged$.isCompleted);

    assert.isFalse(toNode(shared$).hasSubscriber);

    assert.deepStrictEqual(
      mut_made.map((made) => made.isCompleted),
      [true],
    );

    assert.isTrue(Optional.isNone(merged$.getSnapshot()));
  });
});
