// cspell:ignore unstub
/**
 * Ported from synstate's `scope.test.mts`. A scope is an owner here:
 * `createScope(parent)` is `new Owner(parent)` (or `createOwner()` inside the
 * parent's `run`), `getCurrentScope` is `getOwner`, `onScopeDispose` is
 * `onCleanup`. A disposed node is one whose `disposed` is set; synstate asked
 * `isCompleted`.
 */
import {
  createOwner,
  getOwner,
  map,
  onCleanup,
  Owner,
  source,
  untracked,
  type Observable,
} from 'synstate-next';
import { toNode } from 'synstate-next/internal';
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

    // synstate also warned here.
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

    // synstate also warned here.
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
