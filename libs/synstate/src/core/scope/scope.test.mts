// cspell:ignore unstub
import { expectType } from 'ts-data-forge';
import type { Mock } from 'vitest';
import { toNode } from '../class/index.mjs';
import { source } from '../create/index.mjs';
import { map } from '../operators/index.mjs';
import type { Scope } from '../types/index.mjs';
import {
  createScope,
  getCurrentScope,
  onScopeDispose,
  untracked,
} from './scope.mjs';

describe(createScope, () => {
  test('types', () => {
    expectType<ReturnType<typeof createScope>, Scope>('=');

    expectType<ReturnType<typeof getCurrentScope>, Scope | undefined>('=');

    expectType<ReturnType<typeof untracked<number>>, number>('=');
  });

  test('run returns what fn returns and makes the scope current only while it runs', () => {
    const scope = createScope();

    assert.isUndefined(getCurrentScope());

    const result = scope.run(() => {
      assert.strictEqual(getCurrentScope(), scope);

      return 42;
    });

    assert.strictEqual(result, 42);

    assert.isUndefined(getCurrentScope());
  });

  test('the outer scope is current again after a nested run, and after fn throws', () => {
    const outer = createScope();

    const inner = createScope(outer);

    outer.run(() => {
      inner.run(() => {
        assert.strictEqual(getCurrentScope(), inner);
      });

      assert.strictEqual(getCurrentScope(), outer);

      assert.throws(() => {
        // throws a SyntaxError
        inner.run(() => JSON.parse('{'));
      }, SyntaxError);

      assert.strictEqual(getCurrentScope(), outer);
    });

    assert.isUndefined(getCurrentScope());
  });

  test('an observable created inside run is disposed with the scope; a shared parent outside it is not', () => {
    const store$ = source<number>();

    const scope = createScope();

    const doubled$ = scope.run(() => store$.pipe(map((x) => x * 2)));

    const mut_history: number[] = [];

    doubled$.subscribe((x) => {
      mut_history.push(x);
    });

    store$.next(1);

    assert.deepStrictEqual(mut_history, [2]);

    scope.dispose();

    assert.isTrue(doubled$.isCompleted);

    assert.isFalse(store$.isCompleted);

    assert.isFalse(toNode(store$).hasChild);

    store$.next(2);

    assert.deepStrictEqual(mut_history, [2]);
  });

  test('an observable created outside any scope belongs to nothing', () => {
    const store$ = source<number>();

    const doubled$ = store$.pipe(map((x) => x * 2));

    const scope = createScope();

    scope.run(() => {
      // a derived node created elsewhere is not adopted by being used here
      doubled$.subscribe(() => {});
    });

    scope.dispose();

    assert.isFalse(doubled$.isCompleted);
  });

  test('nodes go to the innermost scope', () => {
    const store$ = source<number>();

    const outer = createScope();

    const inner = createScope(outer);

    const [a$, b$] = outer.run(() => {
      const a = store$.pipe(map((x) => x + 1));

      const b = inner.run(() => store$.pipe(map((x) => x + 2)));

      return [a, b] as const;
    });

    inner.dispose();

    assert.isFalse(a$.isCompleted);

    assert.isTrue(b$.isCompleted);

    outer.dispose();

    assert.isTrue(a$.isCompleted);
  });

  test('dispose runs child scopes, then cleanups in reverse, then owned nodes in reverse creation order', () => {
    const store$ = source<number>();

    const parent = createScope();

    const child1 = createScope(parent);

    const child2 = createScope(parent);

    const mut_order: string[] = [];

    child1.run(() => {
      onScopeDispose(() => {
        mut_order.push('child1');
      });
    });

    child2.run(() => {
      onScopeDispose(() => {
        mut_order.push('child2');
      });
    });

    parent.run(() => {
      const first$ = store$.pipe(map((x) => x));

      first$.subscribe(
        () => {},
        () => {
          mut_order.push('node first');
        },
      );

      onScopeDispose(() => {
        mut_order.push('cleanup 1');
      });

      const second$ = store$.pipe(map((x) => x));

      second$.subscribe(
        () => {},
        () => {
          mut_order.push('node second');
        },
      );

      onScopeDispose(() => {
        mut_order.push('cleanup 2');
      });
    });

    parent.dispose();

    assert.deepStrictEqual(mut_order, [
      'child2',
      'child1',
      'cleanup 2',
      'cleanup 1',
      'node second',
      'node first',
    ]);
  });

  test('dispose is idempotent', () => {
    const scope = createScope();

    const mut_calls: number[] = [];

    scope.run(() => {
      onScopeDispose(() => {
        mut_calls.push(1);
      });
    });

    scope.dispose();

    scope.dispose();

    assert.deepStrictEqual(mut_calls, [1]);
  });

  test('a disposed child scope leaves its parent, so the parent does not dispose it again', () => {
    const parent = createScope();

    const child = createScope(parent);

    const mut_calls: string[] = [];

    child.run(() => {
      onScopeDispose(() => {
        mut_calls.push('child');
      });
    });

    child.dispose();

    parent.dispose();

    assert.deepStrictEqual(mut_calls, ['child']);
  });

  test('a node that completes on its own is released by its scope', () => {
    const store$ = source<number>();

    const scope = createScope();

    const mut_completions: number[] = [];

    const doubled$ = scope.run(() => store$.pipe(map((x) => x * 2)));

    doubled$.subscribe(
      () => {},
      () => {
        mut_completions.push(1);
      },
    );

    doubled$.complete();

    scope.dispose();

    assert.deepStrictEqual(mut_completions, [1]);
  });

  test('nodes created inside untracked belong to no scope', () => {
    const store$ = source<number>();

    const scope = createScope();

    const [owned$, free$] = scope.run(() => {
      const owned = store$.pipe(map((x) => x));

      const free = untracked(() => {
        assert.isUndefined(getCurrentScope());

        return store$.pipe(map((x) => x));
      });

      assert.strictEqual(getCurrentScope(), scope);

      return [owned, free] as const;
    });

    scope.dispose();

    assert.isTrue(owned$.isCompleted);

    assert.isFalse(free$.isCompleted);
  });

  test('a node created after await belongs to no scope', async () => {
    const store$ = source<number>();

    const scope = createScope();

    const promise = scope.run(async () => {
      await Promise.resolve();

      assert.isUndefined(getCurrentScope());

      return store$.pipe(map((x) => x));
    });

    const late$ = await promise;

    scope.dispose();

    assert.isFalse(late$.isCompleted);
  });

  test('run on a disposed scope warns, still runs fn, and owns nothing it creates', () => {
    const warn = stubConsoleWarn();

    const store$ = source<number>();

    const scope = createScope();

    scope.dispose();

    const free$ = scope.run(() => {
      assert.isUndefined(getCurrentScope());

      return store$.pipe(map((x) => x));
    });

    assert.isFalse(free$.isCompleted);

    expect(warn).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining('disposed scope'),
    );

    vi.unstubAllGlobals();
  });

  test('onScopeDispose outside any scope warns and registers nothing', () => {
    const warn = stubConsoleWarn();

    onScopeDispose(() => {});

    expect(warn).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining('outside any scope'),
    );

    vi.unstubAllGlobals();
  });

  test('a scope created under a disposed parent is born disposed', () => {
    const warn = stubConsoleWarn();

    const parent = createScope();

    parent.dispose();

    const child = createScope(parent);

    expect(warn).toHaveBeenCalledExactlyOnceWith(
      expect.stringContaining('disposed parent'),
    );

    child.run(() => {
      assert.isUndefined(getCurrentScope());
    });

    expect(warn).toHaveBeenCalledTimes(2);

    vi.unstubAllGlobals();
  });

  test('disposing a parent disposes nodes of its child scopes', () => {
    const store$ = source<number>();

    const parent = createScope();

    const child = createScope(parent);

    const owned$ = child.run(() => store$.pipe(map((x) => x)));

    parent.dispose();

    assert.isTrue(owned$.isCompleted);
  });
});

const stubConsoleWarn = (): Mock => {
  const warn = vi.fn();

  vi.stubGlobal('console', { ...console, warn });

  return warn;
};
