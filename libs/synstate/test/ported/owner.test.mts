// cspell:ignore unstub
/**
 * Ported from synstate 9's `scope.test.mts`. A scope is an owner here:
 * `createScope(parent)` is `new Owner(parent)` (or `createOwner()` inside the
 * parent's `run`), `getCurrentScope` is `getOwner`, `onScopeDispose` is
 * `onCleanup`. A disposed node is one whose `disposed` is set; synstate 9 asked
 * `isCompleted`.
 */
import {
  createOwner,
  createSource,
  createState,
  getOwner,
  map,
  mergeMap,
  onCleanup,
  Owner,
  source,
  state,
  untracked,
  type Observable,
} from 'synstate';
import { retireOwner, toNode } from 'synstate/internal';
import { expectType } from 'ts-data-forge';

describe(Owner, () => {
  test('run returns what fn returns and makes the owner current only while it runs', () => {
    expectType<ReturnType<typeof createOwner>, Owner>('=');

    expectType<ReturnType<typeof getOwner>, Owner | undefined>('=');

    expectType<ReturnType<typeof untracked<number>>, number>('=');

    const owner = new Owner(undefined);

    assert.isUndefined(getOwner());

    const result = owner.run(() => {
      assert.strictEqual(getOwner(), owner);

      return 42;
    });

    assert.strictEqual(result, 42);

    assert.isUndefined(getOwner());
  });

  test('the outer owner is current again after a nested run, and after fn throws', () => {
    const outer = new Owner(undefined);

    const inner = new Owner(outer);

    outer.run(() => {
      inner.run(() => {
        assert.strictEqual(getOwner(), inner);
      });

      assert.strictEqual(getOwner(), outer);

      assert.throws(() => {
        inner.run(() => {
          throw new SyntaxError('bad');
        });
      }, SyntaxError);

      assert.strictEqual(getOwner(), outer);
    });

    assert.isUndefined(getOwner());
  });

  test('a node made inside run is disposed with the owner; a shared parent outside it is not', () => {
    const store = source<number>();

    const owner = new Owner(undefined);

    const doubled = owner.run(() => store.pipe(map((x) => x * 2)));

    const seen = collect(doubled);

    store.emit(1);

    assert.deepStrictEqual(seen, [2]);

    owner.dispose();

    assert.isTrue(isDisposed(doubled));

    assert.isFalse(isDisposed(store));

    store.emit(2);

    assert.deepStrictEqual(seen, [2]);
  });

  test('a node made outside every owner belongs to none, used inside one or not', () => {
    const store = source<number>();

    const doubled = store.pipe(map((x) => x * 2));

    const owner = new Owner(undefined);

    owner.run(() => {
      doubled.subscribe(() => {});
    });

    owner.dispose();

    assert.isFalse(isDisposed(doubled));
  });

  test('nodes go to the innermost owner', () => {
    const store = source<number>();

    const outer = new Owner(undefined);

    const inner = new Owner(outer);

    const [a, b] = outer.run(() => {
      const x = store.pipe(map((v) => v + 1));

      const y = inner.run(() => store.pipe(map((v) => v + 2)));

      return [x, y] as const;
    });

    inner.dispose();

    assert.isFalse(isDisposed(a));

    assert.isTrue(isDisposed(b));

    outer.dispose();

    assert.isTrue(isDisposed(a));
  });

  test('dispose disposes the child owners, then runs the cleanups in reverse, then disposes the nodes', () => {
    const store = source<number>();

    const parent = new Owner(undefined);

    const child1 = new Owner(parent);

    const child2 = new Owner(parent);

    const mut_order: string[] = [];

    child1.run(() => {
      onCleanup(() => {
        mut_order.push('child1');
      });
    });

    child2.run(() => {
      onCleanup(() => {
        mut_order.push('child2');
      });
    });

    const node = parent.run(() => {
      const n = store.pipe(map((x) => x));

      onCleanup(() => {
        mut_order.push(`cleanup 1, node ${isDisposed(n) ? 'gone' : 'live'}`);
      });

      onCleanup(() => {
        mut_order.push('cleanup 2');
      });

      return n;
    });

    parent.dispose();

    assert.deepStrictEqual(mut_order, [
      'child2',
      'child1',
      'cleanup 2',
      'cleanup 1, node live',
    ]);

    assert.isTrue(isDisposed(node));
  });

  test('a subscription made in the owner ends before its cleanups run, so a value a cleanup writes is not heard (#3609)', () => {
    const store = source<number>();

    const owner = createOwner();

    const mut_seen: number[] = [];

    owner.run(() => {
      onCleanup(() => {
        store.emit(2);
      });

      store.subscribe((x) => {
        mut_seen.push(x);
      });
    });

    store.emit(1);

    owner.dispose();

    assert.deepStrictEqual(mut_seen, [1]);
  });

  test("a subscription made in the owner ends before its child owners are disposed, so it hears no child's cleanup (#3609)", () => {
    const store = source<number>();

    const parent = createOwner();

    const mut_events: string[] = [];

    parent.run(() => {
      const inner = createOwner().run(() => {
        onCleanup(() => {
          store.emit(2);
        });

        return store.pipe(map((x) => x * 10));
      });

      store.subscribe((x) => {
        mut_events.push(`store ${x.toString()}`);
      });

      inner.subscribe((x) => {
        mut_events.push(`inner ${x.toString()}`);
      });
    });

    store.emit(1);

    parent.dispose();

    assert.deepStrictEqual(mut_events, ['store 1', 'inner 10']);
  });

  test("a subscription in a child owner hears no sibling's cleanup", () => {
    const store = source<number>();

    const parent = createOwner();

    const mut_seen: number[] = [];

    parent.run(() => {
      createOwner().run(() => {
        store.subscribe((x) => {
          mut_seen.push(x);
        });
      });

      createOwner().run(() => {
        onCleanup(() => {
          store.emit(2);
        });
      });
    });

    store.emit(1);

    parent.dispose();

    assert.deepStrictEqual(mut_seen, [1]);
  });

  test("a subscription made in a source's setup hears no cleanup of the source's owner", () => {
    const store = source<number>();

    const owner = createOwner();

    const mut_seen: number[] = [];

    owner.run(() => {
      createSource(() => {
        store.subscribe((x) => {
          mut_seen.push(x);
        });
      });

      onCleanup(() => {
        store.emit(2);
      });
    });

    store.emit(1);

    owner.dispose();

    assert.deepStrictEqual(mut_seen, [1]);
  });

  test('a cleanup reads the derived values the nodes of its owner held when the disposal began', () => {
    const count = state(1);

    const owner = createOwner();

    const mut_read: number[] = [];

    owner.run(() => {
      const doubled = count.pipe(map((x) => x * 2));

      doubled.subscribe(() => {});

      onCleanup(() => {
        count.set(5);

        mut_read.push(doubled.value);
      });
    });

    owner.dispose();

    assert.deepStrictEqual(mut_read, [2]);
  });

  test('a subscription made in a retired owner stays out of the updates, the cleanups included', () => {
    const store = source<number>();

    const owner = createOwner();

    owner.run(() => {
      onCleanup(() => {
        store.emit(2);
      });
    });

    retireOwner(owner);

    const mut_seen: number[] = [];

    owner.run(() => {
      store.subscribe((x) => {
        mut_seen.push(x);
      });
    });

    store.emit(1);

    owner.dispose();

    assert.deepStrictEqual(mut_seen, []);
  });

  test("a subscription made later in a retired source's setup owner stays out of the updates, the cleanups included", () => {
    const store = source<number>();

    const owner = createOwner();

    const mut_setup: { owner: Owner | undefined } = { owner: undefined };

    owner.run(() => {
      createSource(() => {
        mut_setup.owner = getOwner();
      });

      onCleanup(() => {
        store.emit(2);
      });
    });

    retireOwner(owner);

    const mut_seen: number[] = [];

    assert.isDefined(mut_setup.owner);

    mut_setup.owner.run(() => {
      store.subscribe((x) => {
        mut_seen.push(x);
      });
    });

    store.emit(1);

    owner.dispose();

    assert.deepStrictEqual(mut_seen, []);
  });

  test('disposing nested owners retires each node once', () => {
    const root = createOwner();

    const mut_retired: number[] = [0, 0, 0, 0, 0, 0];

    let mut_owner: Owner = root;

    for (const level of [0, 1, 2, 3, 4, 5]) {
      mut_owner.adopt({
        dispose: () => {},
        disposed: false,
        retire: () => {
          mut_retired[level] = (mut_retired[level] ?? 0) + 1;
        },
      });

      mut_owner = mut_owner.run(createOwner);
    }

    root.dispose();

    assert.deepStrictEqual(mut_retired, [1, 1, 1, 1, 1, 1]);
  });

  test('a subscription a cleanup makes in an older child owner hears no cleanup of that owner', () => {
    const store = source<number>();

    const parent = createOwner();

    const mut_seen: number[] = [];

    parent.run(() => {
      const older = createOwner();

      older.run(() => {
        onCleanup(() => {
          store.emit(2);
        });
      });

      createOwner().run(() => {
        onCleanup(() => {
          older.run(() => {
            store.subscribe((x) => {
              mut_seen.push(x);
            });
          });
        });
      });
    });

    store.emit(1);

    parent.dispose();

    // The first call is the subscription's own, with the value held.
    assert.deepStrictEqual(mut_seen, [1]);
  });

  test("a subscription a cleanup makes in a source's setup owner, in an older child owner, hears no cleanup of that owner", () => {
    const store = source<number>();

    const parent = createOwner();

    const mut_setup: { owner: Owner | undefined } = { owner: undefined };

    const mut_seen: number[] = [];

    parent.run(() => {
      createOwner().run(() => {
        createSource(() => {
          mut_setup.owner = getOwner();
        });

        onCleanup(() => {
          store.emit(2);
        });
      });

      createOwner().run(() => {
        onCleanup(() => {
          mut_setup.owner?.run(() => {
            store.subscribe((x) => {
              mut_seen.push(x);
            });
          });
        });
      });
    });

    store.emit(1);

    parent.dispose();

    // The first call is the subscription's own, with the value held.
    assert.deepStrictEqual(mut_seen, [1]);
  });

  test('an owner retired by retireOwner and then disposed retires each node once', () => {
    const owner = createOwner();

    const mut_count = { retired: 0 };

    owner.adopt({
      dispose: () => {},
      disposed: false,
      retire: () => {
        mut_count.retired += 1;
      },
    });

    retireOwner(owner);

    owner.dispose();

    assert.strictEqual(mut_count.retired, 1);
  });

  test("a subscription a cleanup makes in a source's setup owner hears no later cleanup of the source's owner", () => {
    const store = source<number>();

    const parent = createOwner();

    const mut_setup: { owner: Owner | undefined } = { owner: undefined };

    const mut_seen: number[] = [];

    const subscribeInSetup = (): void => {
      mut_setup.owner?.run(() => {
        store.subscribe((x) => {
          mut_seen.push(x);
        });
      });
    };

    parent.run(() => {
      createSource(() => {
        mut_setup.owner = getOwner();
      });

      onCleanup(() => {
        store.emit(2);
      });

      onCleanup(subscribeInSetup);

      createOwner().run(() => {
        onCleanup(subscribeInSetup);
      });
    });

    store.emit(1);

    parent.dispose();

    // The first calls are the subscriptions' own, with the value held.
    assert.deepStrictEqual(mut_seen, [1, 1]);
  });

  test("a mergeMap inner whose node's retire throws does not keep the next inner in the updates", () => {
    const error = vi.fn();

    vi.stubGlobal('console', { ...console, error });

    onTestFinished(() => {
      vi.unstubAllGlobals();
    });

    const trigger = source<number>();

    const store = source<number>();

    const owner = createOwner();

    const mut_seen: number[] = [];

    owner.run(() => {
      trigger
        .pipe(
          mergeMap((i) => {
            if (i === 0) {
              getOwner()?.adopt({
                dispose: () => {},
                disposed: false,
                retire: () => {
                  throw new RangeError('retire');
                },
              });
            } else {
              store.subscribe((x) => {
                mut_seen.push(x);
              });
            }

            return source<number>();
          }),
        )
        .subscribe(() => {});

      onCleanup(() => {
        store.emit(9);
      });
    });

    trigger.emit(0);

    trigger.emit(1);

    store.emit(1);

    retireOwner(owner);

    assert.strictEqual(error.mock.calls.length, 1);

    // Retired once: the disposal does not try the node again.
    owner.dispose();

    assert.strictEqual(error.mock.calls.length, 1);

    assert.deepStrictEqual(mut_seen, [1]);
  });

  test('a subscription made after a retire threw, in the owner that threw, stays out of the updates', () => {
    const error = vi.fn();

    vi.stubGlobal('console', { ...console, error });

    onTestFinished(() => {
      vi.unstubAllGlobals();
    });

    const trigger = source<number>();

    const store = source<number>();

    const owner = createOwner();

    const mut_inner: { owner: Owner | undefined } = { owner: undefined };

    const mut_seen: number[] = [];

    owner.run(() => {
      trigger
        .pipe(
          mergeMap(() => {
            mut_inner.owner = getOwner();

            mut_inner.owner?.adopt({
              dispose: () => {},
              disposed: false,
              retire: () => {
                throw new RangeError('retire');
              },
            });

            return source<number>();
          }),
        )
        .subscribe(() => {});

      onCleanup(() => {
        store.emit(9);
      });
    });

    trigger.emit(0);

    retireOwner(owner);

    mut_inner.owner?.run(() => {
      store.subscribe((x) => {
        mut_seen.push(x);
      });
    });

    owner.dispose();

    assert.deepStrictEqual(mut_seen, []);
  });

  test("a subscription a child owner's cleanup makes in a source's setup owner hears no older child's cleanup", () => {
    const store = source<number>();

    const parent = createOwner();

    const mut_setup: { owner: Owner | undefined } = { owner: undefined };

    const mut_seen: number[] = [];

    parent.run(() => {
      createSource(() => {
        mut_setup.owner = getOwner();
      });

      createOwner().run(() => {
        onCleanup(() => {
          store.emit(2);
        });
      });

      createOwner().run(() => {
        onCleanup(() => {
          mut_setup.owner?.run(() => {
            store.subscribe((x) => {
              mut_seen.push(x);
            });
          });
        });
      });
    });

    parent.dispose();

    assert.deepStrictEqual(mut_seen, []);
  });

  test('a node in a child owner whose retire throws is retired once in a disposal, and its exception is thrown, not reported', () => {
    const error = vi.fn();

    vi.stubGlobal('console', { ...console, error });

    onTestFinished(() => {
      vi.unstubAllGlobals();
    });

    const root = createOwner();

    const mut_count = { retired: 0 };

    root.run(createOwner).adopt({
      dispose: () => {},
      disposed: false,
      retire: () => {
        mut_count.retired += 1;

        throw new RangeError('retire');
      },
    });

    assert.throws(() => {
      root.dispose();
    }, RangeError);

    assert.strictEqual(mut_count.retired, 1);

    assert.strictEqual(error.mock.calls.length, 0);
  });

  test('a subscription made in a retired owner is retired by a disposal in the same run', () => {
    const store = source<number>();

    const owner = createOwner();

    owner.run(() => {
      onCleanup(() => {
        store.emit(2);
      });
    });

    retireOwner(owner);

    const mut_seen: number[] = [];

    owner.run(() => {
      store.subscribe((x) => {
        mut_seen.push(x);
      });

      owner.dispose();
    });

    assert.deepStrictEqual(mut_seen, []);
  });

  test('a child owner made after its parent was disposed during its run hears updates until that run ends', () => {
    const [count, setCount] = createState(0);

    const parent = createOwner();

    const mut_seen: number[] = [];

    parent.run(() => {
      parent.dispose();

      createOwner().run(() => {
        count.subscribe((x) => {
          mut_seen.push(x);
        });
      });

      setCount(1);
    });

    setCount(2);

    assert.deepStrictEqual(mut_seen, [0, 1]);
  });

  test('a node whose retire throws does not stop the disposal; the exception is thrown at its end', () => {
    const owner = createOwner();

    const mut_order: string[] = [];

    owner.adopt({
      dispose: () => {
        mut_order.push('node disposed');
      },
      disposed: false,
      retire: () => {
        throw new RangeError('retire');
      },
    });

    owner.onCleanup(() => {
      mut_order.push('cleanup');
    });

    assert.throws(() => {
      owner.dispose();
    }, RangeError);

    assert.isTrue(owner.disposed);

    assert.deepStrictEqual(mut_order, ['cleanup', 'node disposed']);
  });

  test('a throwing cleanup does not stop the disposal; the first exception is thrown at its end', () => {
    const error = vi.fn();

    vi.stubGlobal('console', { ...console, error });

    onTestFinished(() => {
      vi.unstubAllGlobals();
    });

    const store = source<number>();

    const owner = new Owner(undefined);

    const mut_order: string[] = [];

    const node = owner.run(() => {
      const child = createOwner();

      child.run(() => {
        onCleanup(() => {
          throw new RangeError('child');
        });
      });

      onCleanup(() => {
        mut_order.push('cleanup 1');
      });

      onCleanup(() => {
        throw new SyntaxError('cleanup 2');
      });

      return store.pipe(map((x) => x));
    });

    assert.throws(() => {
      owner.dispose();
    }, RangeError);

    assert.deepStrictEqual(mut_order, ['cleanup 1']);

    assert.isTrue(isDisposed(node));

    expect(error).toHaveBeenCalledExactlyOnceWith(expect.any(SyntaxError));
  });

  test('a cleanup is called with no this, registered before or after dispose', () => {
    const owner = new Owner(undefined);

    const mut_thisValues: unknown[] = [];

    // A function expression, since an arrow function has no `this` to record.
    const record = function record(this: unknown): void {
      mut_thisValues.push(this);
    };

    owner.run(() => {
      onCleanup(record);
    });

    owner.dispose();

    owner.onCleanup(record);

    assert.deepStrictEqual(mut_thisValues, [undefined, undefined]);
  });

  test('dispose is idempotent', () => {
    const owner = new Owner(undefined);

    const mut_calls: number[] = [];

    owner.run(() => {
      onCleanup(() => {
        mut_calls.push(1);
      });
    });

    owner.dispose();

    owner.dispose();

    assert.deepStrictEqual(mut_calls, [1]);
  });

  test('a disposed child leaves its parent, so the parent does not dispose it again', () => {
    const parent = new Owner(undefined);

    const child = new Owner(parent);

    const mut_calls: string[] = [];

    child.run(() => {
      onCleanup(() => {
        mut_calls.push('child');
      });
    });

    child.dispose();

    parent.dispose();

    assert.deepStrictEqual(mut_calls, ['child']);
  });

  test('after many children are disposed on their own, the parent disposes the rest once, newest first', () => {
    const parent = new Owner(undefined);

    const mut_order: number[] = [];

    const children = Array.from({ length: 100 }, (_, i) => {
      const child = new Owner(parent);

      child.run(() => {
        onCleanup(() => {
          mut_order.push(i);
        });
      });

      return child;
    });

    // 66 children go on their own: enough for the parent to compact its list.
    for (const [i, child] of children.entries()) {
      if (i % 3 !== 0) {
        child.dispose();
      }
    }

    const disposedAlone = mut_order.length;

    parent.dispose();

    assert.strictEqual(disposedAlone, 66);

    assert.deepStrictEqual(
      mut_order.slice(disposedAlone),
      Array.from({ length: 34 }, (_, k) => (33 - k) * 3),
    );
  });

  test('after many owned nodes are disposed on their own, the owner disposes the rest', () => {
    const store = source<number>();

    const owner = new Owner(undefined);

    const nodes = owner.run(() =>
      Array.from({ length: 100 }, (_, i) => store.pipe(map((x) => x + i))),
    );

    for (const [i, node] of nodes.entries()) {
      if (i % 3 !== 0) {
        node.dispose();
      }
    }

    owner.dispose();

    assert.isTrue(nodes.every(isDisposed));

    assert.isFalse(toNode(store).hasObserver);
  });

  test('nodes made inside untracked belong to no owner', () => {
    const store = source<number>();

    const owner = new Owner(undefined);

    const [owned, free] = owner.run(() => {
      const o = store.pipe(map((x) => x));

      const f = untracked(() => {
        assert.isUndefined(getOwner());

        return store.pipe(map((x) => x));
      });

      assert.strictEqual(getOwner(), owner);

      return [o, f] as const;
    });

    owner.dispose();

    assert.isTrue(isDisposed(owned));

    assert.isFalse(isDisposed(free));
  });

  test('a node made after await belongs to no owner', async () => {
    const store = source<number>();

    const owner = new Owner(undefined);

    const late = await owner.run(async () => {
      await Promise.resolve();

      assert.isUndefined(getOwner());

      return store.pipe(map((x) => x));
    });

    owner.dispose();

    assert.isFalse(isDisposed(late));
  });

  test('run on a disposed owner still runs fn, and owns nothing it makes', () => {
    const store = source<number>();

    const owner = new Owner(undefined);

    owner.dispose();

    const free = owner.run(() => {
      assert.isUndefined(getOwner());

      return store.pipe(map((x) => x));
    });

    // synstate 9 also warned here.
    assert.isFalse(isDisposed(free));
  });

  test('onCleanup outside every owner warns and registers nothing', () => {
    const warn = vi.fn();

    vi.stubGlobal('console', { ...console, warn });

    try {
      onCleanup(() => {});

      expect(warn).toHaveBeenCalledExactlyOnceWith(
        expect.stringContaining('outside any owner'),
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });

  test('an owner made under a disposed parent is born disposed, and owns nothing', () => {
    const store = source<number>();

    const parent = new Owner(undefined);

    parent.dispose();

    const child = new Owner(parent);

    assert.isTrue(child.disposed);

    const node = child.run(() => {
      assert.isUndefined(getOwner());

      return store.pipe(map((x) => x));
    });

    // synstate 9 also warned here.
    assert.isFalse(isDisposed(node));
  });

  test('disposing a parent disposes the nodes of its child owners', () => {
    const store = source<number>();

    const parent = new Owner(undefined);

    const owned = parent.run(() => {
      const child = createOwner();

      return child.run(() => store.pipe(map((x) => x)));
    });

    parent.dispose();

    assert.isTrue(isDisposed(owned));
  });
});

const isDisposed = (observable: Observable<unknown>): boolean =>
  toNode(observable).disposed;

/** Every value `observable` gives a subscriber, the current one first. */
const collect = <A,>(observable: Observable<A>): readonly A[] => {
  const mut_seen: A[] = [];

  observable.subscribe((v) => {
    mut_seen.push(v);
  });

  return mut_seen;
};
