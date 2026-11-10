// cspell:ignore unstub
/**
 * Ported from synstate's `flat-map-initial-value`, `flat-map-sync-inner` and
 * `inner-ownership` tests. What was asked of completion is asked of disposal:
 * an owner's cleanups run when what it made goes, and a node that is gone is
 * one its source no longer observes. The cases about a completed source are
 * those of a settled one (`just`).
 */
import {
  batch,
  createOwner,
  derive,
  filter,
  just,
  map,
  mergeMap,
  onCleanup,
  skipWhile,
  source,
  state,
  switchMap,
  type Observable,
  type Source,
} from 'synstate-next';
import { toNode } from 'synstate-next/internal';
import { Optional } from 'ts-std-forge';

describe('the value the source holds when the operator is created is projected', () => {
  test('switchMap: an inner holding a value gives the operator its value at once', () => {
    const a = state(1);

    const s = a.pipe(switchMap((x) => just(x * 10)));

    assert.deepStrictEqual(s.getSnapshot(), Optional.some(10));

    const seen = collect(s);

    a.set(2);

    assert.deepStrictEqual(seen, [10, 20]);
  });

  test('switchMap: a later value of the first inner is passed on', () => {
    const a = state(1);

    const inner = source<string>();

    const mut_projected: number[] = [];

    const s = a.pipe(
      switchMap((x) => {
        mut_projected.push(x);

        return inner;
      }),
    );

    assert.deepStrictEqual(mut_projected, [1]);

    const seen = collect(s);

    inner.emit('a');

    assert.deepStrictEqual(seen, ['a']);
  });

  test('switchMap: the next value of the source switches away from the first inner', () => {
    const a = state(1);

    const first = source<string>();

    const second = source<string>();

    const seen = collect(a.pipe(switchMap((x) => (x === 1 ? first : second))));

    a.set(2);

    first.emit('stale');

    second.emit('b');

    assert.deepStrictEqual(seen, ['b']);
  });

  test('switchMap: what the first projection made is disposed when it is switched away from', () => {
    const a = state(1);

    const mut_disposed: number[] = [];

    collect(
      a.pipe(
        switchMap((x) => {
          onCleanup(() => {
            mut_disposed.push(x);
          });

          return just(x);
        }),
      ),
    );

    assert.deepStrictEqual(mut_disposed, []);

    a.set(2);

    assert.deepStrictEqual(mut_disposed, [1]);
  });

  test('switchMap: a source with no value projects nothing until it emits', () => {
    const a = source<number>();

    const mut_projected: number[] = [];

    const s = a.pipe(
      switchMap((x) => {
        mut_projected.push(x);

        return just(x);
      }),
    );

    assert.isTrue(Optional.isNone(s.getSnapshot()));

    a.emit(1);

    assert.deepStrictEqual(mut_projected, [1]);
  });

  test('switchMap: a value carried through filter and map is projected', () => {
    const a = state<Optional<number>>(Optional.some(42));

    const s = a
      .pipe(filter(Optional.isSome))
      .pipe(map((some) => some.value))
      .pipe(switchMap((id) => just(`item ${id.toString()}`)));

    assert.deepStrictEqual(s.getSnapshot(), Optional.some('item 42'));
  });

  test('switchMap and mergeMap: a settled source holding a value projects it once', () => {
    const mut_projected: number[] = [];

    const project = (x: number): Observable<number> => {
      mut_projected.push(x);

      return just(x);
    };

    const s = just(1).pipe(switchMap(project));

    const m = just(2).pipe(mergeMap(project));

    // synstate projected nothing for a completed source; a settled one holds
    // its value, which is projected as any other held value is.
    assert.deepStrictEqual(mut_projected, [1, 2]);

    assert.deepStrictEqual(s.getSnapshot(), Optional.some(1));

    assert.deepStrictEqual(m.getSnapshot(), Optional.some(2));
  });

  test('mergeMap: the first inner and the later ones are merged', () => {
    const a = state(1);

    const first = source<string>();

    const second = source<string>();

    const seen = collect(a.pipe(mergeMap((x) => (x === 1 ? first : second))));

    a.set(2);

    first.emit('a');

    second.emit('b');

    assert.deepStrictEqual(seen, ['a', 'b']);
  });

  test('mergeMap: an inner holding a value gives the operator its value at once', () => {
    assert.deepStrictEqual(
      state(1)
        .pipe(mergeMap((x) => just(x * 10)))
        .getSnapshot(),
      Optional.some(10),
    );
  });

  test.each([
    ['switchMap', switchMap],
    ['mergeMap', mergeMap],
  ] as const)(
    '%s: a first projection that throws leaves nothing attached to the source',
    (_, operator) => {
      const a = state(1);

      assert.throws(() => {
        a.pipe(
          operator((): Observable<number> => {
            // Made in the projection's owner before it throws.
            a.pipe(map((v) => v + 1)).subscribe(() => {});

            throw new Error('first');
          }),
        );
      }, /first/u);

      assert.isFalse(toNode(a).hasObserver);
    },
  );

  test('switchMap: skipWhile on the held value before it keeps that value from being projected', () => {
    const a = state(1);

    const mut_projected: number[] = [];

    collect(
      a.pipe(skipWhile((x) => x === 1)).pipe(
        switchMap((x) => {
          mut_projected.push(x);

          return just(x);
        }),
      ),
    );

    a.set(2);

    assert.deepStrictEqual(mut_projected, [2]);
  });
});

describe('a projection that writes or throws', () => {
  test('switchMap: a projection that writes to the source follows the newer projection', () => {
    const s = state(0);

    const switched = s.pipe(
      switchMap((v) => {
        if (v === 0) {
          s.set(1);
        }

        return just(v * 10);
      }),
    );

    assert.deepStrictEqual(switched.getSnapshot(), Optional.some(10));
  });

  test.each([
    ['switchMap', switchMap],
    ['mergeMap', mergeMap],
  ] as const)(
    "%s: the projection's exception is thrown, not one from a cleanup it registered",
    (_, operator) => {
      const error = vi.fn();

      vi.stubGlobal('console', { ...console, error });

      onTestFinished(() => {
        vi.unstubAllGlobals();
      });

      const s = state(0);

      const other = state(0);

      assert.throws(
        () =>
          s.pipe(
            operator(() => {
              other.subscribe(() => {});

              onCleanup(() => {
                throw new RangeError('cleanup');
              });

              throw new SyntaxError('projection');
            }),
          ),
        SyntaxError,
      );

      expect(error).toHaveBeenCalledExactlyOnceWith(expect.any(RangeError));

      assert.isFalse(toNode(s).hasObserver);

      assert.isFalse(toNode(other).hasObserver);
    },
  );

  test('an inner let go of whose cleanup throws: the value is passed on, the exception reported', () => {
    const error = vi.fn();

    vi.stubGlobal('console', { ...console, error });

    onTestFinished(() => {
      vi.unstubAllGlobals();
    });

    const s = source<number>();

    const inner = source<number>();

    const seen = collect(
      s.pipe(
        mergeMap(() => {
          onCleanup(() => {
            throw new RangeError('cleanup');
          });

          return inner;
        }),
      ),
    );

    s.emit(0);

    batch(() => {
      inner.emit(5);

      inner.dispose();
    });

    assert.deepStrictEqual(seen, [5]);

    expect(error).toHaveBeenCalledExactlyOnceWith(expect.any(RangeError));
  });

  test('switchMap: switching away from an inner whose cleanup throws still switches', () => {
    const error = vi.fn();

    vi.stubGlobal('console', { ...console, error });

    onTestFinished(() => {
      vi.unstubAllGlobals();
    });

    const s = state(0);

    const switched = s.pipe(
      switchMap((v) => {
        onCleanup(() => {
          if (v === 0) {
            throw new RangeError('cleanup');
          }
        });

        return just(v * 10);
      }),
    );

    const seen = collect(switched);

    s.set(1);

    assert.deepStrictEqual(seen, [0, 10]);

    expect(error).toHaveBeenCalledExactlyOnceWith(expect.any(RangeError));
  });

  test('mergeMap: disposing it disposes every inner, one cleanup throwing or not', () => {
    const s = source<number>();

    const inners = [state(0), state(0), state(0)] as const;

    const merged = s.pipe(
      mergeMap((i) => {
        onCleanup(() => {
          if (i === 2) {
            throw new RangeError('cleanup');
          }
        });

        return inners[i] ?? inners[0];
      }),
    );

    merged.subscribe(() => {});

    s.emit(0);

    s.emit(1);

    s.emit(2);

    assert.throws(() => {
      merged.dispose();
    }, RangeError);

    assert.isTrue(inners.every((inner) => !toNode(inner).hasObserver));
  });
});

describe('an inner observable that holds a value is passed on in the update that projected it', () => {
  test.each([
    ['switchMap', switchMap],
    ['mergeMap', mergeMap],
  ] as const)('%s: a sibling read with it is never stale', (_, operator) => {
    const a = state(1);

    // Made before `m`, so the update visits it first.
    const s = a.pipe(operator((x) => just(`s${x.toString()}`)));

    const m = a.pipe(map((x) => `m${x.toString()}`));

    const seen = collect(
      derive([m, s], (...values) => values).pipe(map(([x, y]) => `${x},${y}`)),
    );

    a.set(2);

    a.set(3);

    assert.deepStrictEqual(seen, ['m1,s1', 'm2,s2', 'm3,s3']);
  });

  test('switchMap: a child of both it and its parent emits once per update', () => {
    const a = state(1);

    const s = a.pipe(switchMap((x) => just(x * 10)));

    const seen = collect(derive([a, s], (...values) => values));

    a.set(2);

    a.set(3);

    assert.deepStrictEqual(seen, [
      [1, 10],
      [2, 20],
      [3, 30],
    ]);
  });

  test('switchMap: an inner that emits later still starts an update of its own', () => {
    const a = source<number>();

    const inner = source<number>();

    const seen = collect(a.pipe(switchMap(() => inner)));

    a.emit(1);

    inner.emit(5);

    inner.emit(6);

    assert.deepStrictEqual(seen, [5, 6]);
  });
});

describe('switchMap and mergeMap release only what their projection made', () => {
  test('switchMap: a shared inner survives a switch', () => {
    const user = source<'a' | 'b'>();

    const a = source<number>();

    const b = source<number>();

    const current = collect(user.pipe(switchMap((u) => (u === 'a' ? a : b))));

    const others = collect(a);

    user.emit('a');

    a.emit(1);

    user.emit('b');

    a.emit(2);

    b.emit(3);

    assert.deepStrictEqual(others, [1, 2]);

    assert.deepStrictEqual(current, [1, 3]);
  });

  test.each([
    ['switchMap', switchMap],
    ['mergeMap', mergeMap],
  ] as const)(
    '%s: a shared inner survives the operator being disposed',
    (_, operator) => {
      const user = source<number>();

      const shared = source<number>();

      const owner = createOwner();

      owner.run(() => {
        collect(user.pipe(operator(() => shared)));
      });

      user.emit(1);

      owner.dispose();

      const others = collect(shared);

      shared.emit(1);

      assert.deepStrictEqual(others, [1]);
    },
  );

  test('switchMap: everything a projection made is released on a switch and on disposal, a node derived from a shared observable included', () => {
    const user = source<number>();

    const shared = source<number>();

    const mut_released: number[] = [];

    const owner = createOwner();

    owner.run(() => {
      collect(
        user.pipe(
          switchMap((u) => {
            const inner = source<number>();

            const derived = shared.pipe(map((x) => x + u));

            onCleanup(() => {
              mut_released.push(u);
            });

            return derive([inner, derived], (...values) => values);
          }),
        ),
      );
    });

    user.emit(1);

    user.emit(2);

    assert.deepStrictEqual(mut_released, [1]);

    owner.dispose();

    assert.deepStrictEqual(mut_released, [1, 2]);

    // Nothing the projections derived from it is left on `shared`.
    assert.isFalse(toNode(shared).hasObserver);
  });

  test('mergeMap: everything the projections made is released on disposal, and the shared observable survives', () => {
    const user = source<number>();

    const shared = source<number>();

    const mut_released: number[] = [];

    const owner = createOwner();

    owner.run(() => {
      collect(
        user.pipe(
          mergeMap((u) => {
            onCleanup(() => {
              mut_released.push(u);
            });

            return shared.pipe(map((x) => x + u));
          }),
        ),
      );
    });

    user.emit(1);

    user.emit(2);

    assert.deepStrictEqual(mut_released, []);

    owner.dispose();

    assert.deepStrictEqual(mut_released, [2, 1]);

    assert.isFalse(toNode(shared).hasObserver);

    const others = collect(shared);

    shared.emit(5);

    assert.deepStrictEqual(others, [5]);
  });
});

describe('a projection that throws on a later value', () => {
  test('switchMap: what it made is released at the throw, and switching goes on', () => {
    const user = source<number>();

    const other = state(0);

    const mut_released: number[] = [];

    const owner = createOwner();

    const seen = owner.run(() =>
      collect(
        user.pipe(
          switchMap((u) => {
            onCleanup(() => {
              mut_released.push(u);
            });

            // Made in the projection's owner before it throws.
            other.pipe(map((v) => v + u)).subscribe(() => {});

            if (u === 2) {
              throw new Error('projection failed');
            }

            return just(u);
          }),
        ),
      ),
    );

    user.emit(1);

    assert.throws(() => {
      user.emit(2);
    }, /projection failed/u);

    assert.deepStrictEqual(mut_released, [1, 2]);

    user.emit(3);

    assert.deepStrictEqual(seen, [1, 3]);

    owner.dispose();

    assert.deepStrictEqual(mut_released, [1, 2, 3]);

    assert.isFalse(toNode(other).hasObserver);
  });

  test('mergeMap: what it made is released at the throw, the others when it is disposed', () => {
    const click = source<number>();

    const other = state(0);

    const mut_released: number[] = [];

    const owner = createOwner();

    owner.run(() => {
      collect(
        click.pipe(
          mergeMap((n): Observable<number> => {
            onCleanup(() => {
              mut_released.push(n);
            });

            if (n === 2) {
              other.pipe(map((v) => v + n)).subscribe(() => {});

              throw new Error('projection failed');
            }

            // Kept live, so that `mergeMap` follows it.
            return source<number>();
          }),
        ),
      );
    });

    click.emit(1);

    assert.throws(() => {
      click.emit(2);
    }, /projection failed/u);

    assert.deepStrictEqual(mut_released, [2]);

    assert.isFalse(toNode(other).hasObserver);

    owner.dispose();

    assert.deepStrictEqual(mut_released, [2, 1]);
  });
});

describe('mergeMap releases an inner observable once it can emit no more', () => {
  test('releases what the projection made once its inner is settled and read', () => {
    const click = source<number>();

    const mut_released: number[] = [];

    const seen = collect(
      click.pipe(
        mergeMap((n) => {
          onCleanup(() => {
            mut_released.push(n);
          });

          return just(n);
        }),
      ),
    );

    click.emit(1);

    click.emit(2);

    assert.deepStrictEqual(seen, [1, 2]);

    assert.deepStrictEqual(mut_released, [1, 2]);
  });

  test('keeps an inner that is still live', () => {
    const click = source<number>();

    const mut_inners: Source<string>[] = [];

    const mut_released: number[] = [];

    const owner = createOwner();

    const seen = owner.run(() =>
      collect(
        click.pipe(
          mergeMap((n) => {
            onCleanup(() => {
              mut_released.push(n);
            });

            const inner = source<string>();

            mut_inners.push(inner);

            return inner;
          }),
        ),
      ),
    );

    click.emit(1);

    click.emit(2);

    mut_inners[0]?.emit('a');

    mut_inners[1]?.emit('b');

    assert.deepStrictEqual(seen, ['a', 'b']);

    assert.deepStrictEqual(mut_released, []);

    owner.dispose();

    // Each projection's owner is disposed once.
    assert.deepStrictEqual(mut_released, [2, 1]);
  });
});

/** Every value `observable` gives a subscriber, the current one first. */
const collect = <A,>(observable: Observable<A>): readonly A[] => {
  const mut_seen: A[] = [];

  observable.subscribe((v) => {
    mut_seen.push(v);
  });

  return mut_seen;
};

// synstate's `inner-ownership` cases of #3666 (issue #3550). A write made
// during the projection is deferred until the round's effects have run here, so
// the projection that wrote finishes first and the write then switches; what
// synstate asked of completion during the projection is asked of disposal.
describe('a source write or disposal during a projection', () => {
  test('switchMap: a write from the projection switches to its value, and the first inner is let go', () => {
    const user$ = source<number>();

    const a$ = source<string>();

    const b$ = source<string>();

    const current$ = user$.pipe(
      switchMap((u) => {
        if (u === 1) {
          user$.emit(2);

          return a$;
        }

        return b$;
      }),
    );

    const mut_current: string[] = [];

    current$.subscribe((v) => {
      mut_current.push(v);
    });

    user$.emit(1);

    a$.emit('a');

    b$.emit('b');

    assert.deepStrictEqual(mut_current, ['b']);

    assert.isFalse(toNode(a$).hasObserver);

    toNode(current$).dispose();

    assert.isFalse(toNode(b$).hasObserver);
  });

  test('switchMap: what the projection that wrote made is disposed when the write switches', () => {
    const user$ = source<number>();

    const store$ = source<number>();

    const mut_made: Observable<number>[] = [];

    const current$ = user$.pipe(
      switchMap((u) => {
        if (u === 1) {
          user$.emit(2);
        }

        const made$ = store$.pipe(map((x) => x));

        mut_made.push(made$);

        return made$;
      }),
    );

    current$.subscribe(() => {});

    user$.emit(1);

    // The projection that wrote (1) ran first, then the one its write made (2).
    assert.deepStrictEqual(
      mut_made.map((made) => toNode(made).disposed),
      [true, false],
    );
  });

  test('switchMap: disposing the operator during the projection subscribes to nothing, and disposes what it made', () => {
    const user$ = source<number>();

    const shared$ = state('shared');

    const store$ = source<number>();

    const mut_made: Observable<number>[] = [];

    const owner = createOwner();

    const current$ = owner.run(() =>
      user$.pipe(
        switchMap(() => {
          owner.dispose();

          const made$ = store$.pipe(map((x) => x));

          mut_made.push(made$);

          return shared$;
        }),
      ),
    );

    current$.subscribe(() => {});

    user$.emit(1);

    assert.isFalse(toNode(shared$).hasObserver);

    assert.isTrue(mut_made.every((made) => toNode(made).disposed));

    assert.isFalse(toNode(store$).hasObserver);
  });

  test('mergeMap: disposing the operator during the projection subscribes to nothing, and disposes what it made', () => {
    const user$ = source<number>();

    const shared$ = state('shared');

    const store$ = source<number>();

    const mut_made: Observable<number>[] = [];

    const owner = createOwner();

    const current$ = owner.run(() =>
      user$.pipe(
        mergeMap(() => {
          owner.dispose();

          const made$ = store$.pipe(map((x) => x));

          mut_made.push(made$);

          return shared$;
        }),
      ),
    );

    current$.subscribe(() => {});

    user$.emit(1);

    assert.isFalse(toNode(shared$).hasObserver);

    assert.isTrue(mut_made.every((made) => toNode(made).disposed));

    assert.isFalse(toNode(store$).hasObserver);
  });
});
