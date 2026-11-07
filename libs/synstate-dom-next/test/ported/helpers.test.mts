import {
  constant,
  createAfterUpdate,
  deriveBindable,
  isImeKeyDown,
  listenInScope,
  mapBindable,
  toObservable,
  type Bindable,
  type Constant,
} from 'synstate-dom-next';
import { createOwner, isObservable, map, state } from 'synstate-next';
import { expectType } from 'ts-data-forge';

// synstate-dom's tests of its helpers: `constant/*.test.mts`,
// `keyboard/is-ime-key-down.test.mts` and `scope/scope-effects.test.mts`.

describe(toObservable, () => {
  // synstate-dom's asks for a completed observable; one that never emits is
  // what that meant.
  test('a constant becomes an observable holding it, which never emits', () => {
    const result = toObservable(constant('a'));

    assert.isTrue(isObservable(result));

    assert.strictEqual(result.value, 'a');

    const mut_seen: string[] = [];

    const unsubscribe = result.subscribe((value) => {
      mut_seen.push(value);
    });

    unsubscribe();

    assert.deepStrictEqual(mut_seen, ['a']);
  });

  test('an observable is returned as is', () => {
    const count = state(0);

    assert.strictEqual(toObservable(count), count);
  });
});

describe(mapBindable, () => {
  test('a constant gives a constant without creating a node', () => {
    const fn = vi.fn((n: number) => n * 2);

    const result = mapBindable(constant(3), fn);

    expectType<typeof result, Bindable<number>>('=');

    assert.isFalse(isObservable(result));

    assert.strictEqual<unknown>(result, 6);

    expect(fn).toHaveBeenCalledExactlyOnceWith(3);
  });

  test('an observable gives a mapped observable', () => {
    const count = state(1);

    const result = mapBindable(count, (n) => n * 10);

    assert.isTrue(isObservable(result));

    const result$ = toObservable(result);

    assert.strictEqual(result$.value, 10);

    count.set(2);

    assert.strictEqual(result$.value, 20);
  });
});

describe(deriveBindable, () => {
  test('constants only give a constant without creating a node', () => {
    const fn = vi.fn((a: number, b: string) => `${b}${a}`);

    const result = deriveBindable([constant(1), constant('x')], fn);

    expectType<typeof result, Bindable<string>>('=');

    assert.isFalse(isObservable(result));

    assert.strictEqual<unknown>(result, 'x1');

    expect(fn).toHaveBeenCalledExactlyOnceWith(1, 'x');
  });

  test('passes each value with its own type', () => {
    const count = state(0);

    deriveBindable(
      [count, constant('a'), count.pipe(map((n) => n > 0))],
      (n, s, b) => {
        expectType<typeof n, number>('=');

        expectType<typeof s, 'a'>('=');

        expectType<typeof b, boolean>('=');

        return 0;
      },
    );

    assert.isTrue(true);
  });

  test('observables and constants are combined', () => {
    const count = state(1);

    const label = state('a');

    const result = deriveBindable(
      [count, constant('-'), label.pipe(map((s) => s.toUpperCase()))],
      (n, sep, l) => `${n}${sep}${l}`,
    );

    assert.isTrue(isObservable(result));

    const result$ = toObservable(result);

    assert.strictEqual(result$.value, '1-A');

    count.set(2);

    assert.strictEqual(result$.value, '2-A');

    label.set('b');

    assert.strictEqual(result$.value, '2-B');
  });

  // synstate-dom's also checks that the inputs are the parents, through
  // `isChildObservable`, which is gone: that `fn` runs once per update says
  // there is one node.
  test('observables give one observable that follows the inputs', () => {
    const a = state(1);

    const b = state(2);

    const fn = vi.fn((x: number, y: number) => x + y);

    const result$ = toObservable(deriveBindable([a, b], fn));

    a.set(2);

    assert.strictEqual(result$.value, 4);

    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe(constant, () => {
  test('returns the value unchanged', () => {
    const value = { a: 1 } as const;

    assert.strictEqual(constant(value), value);

    assert.strictEqual(constant('btn'), 'btn');
  });

  test('keeps the literal type', () => {
    const c = constant('btn');

    expectType<typeof c, Constant<'btn'>>('=');

    assert.strictEqual<unknown>(c, 'btn');
  });

  test('a constant can be read as its value', () => {
    const n: number = constant(1);

    assert.strictEqual(n, 1);
  });

  test('rejects null, undefined and observables', () => {
    const count = state(0);

    // @ts-expect-error null is not a constant: omit the prop instead
    constant(null);

    // @ts-expect-error undefined is not a constant: omit the prop instead
    constant(undefined);

    // @ts-expect-error wrapping an observable would bind it once
    constant(count);

    const maybe = Math.random() > 2 ? 'a' : undefined;

    // @ts-expect-error a value that may be undefined is an observable of `T | undefined`
    constant(maybe);

    assert.isTrue(true);
  });

  test('a plain value is not a Bindable', () => {
    const count = state(0);

    // @ts-expect-error a plain value would be written once and never updated
    const plain: Bindable<string> = 'btn';

    // @ts-expect-error the value is read once
    const snapshot: Bindable<number> = count.value;

    const fromConstant: Bindable<string> = constant('btn');

    const fromObservable: Bindable<number> = count;

    assert.strictEqual<unknown>(plain, 'btn');

    assert.strictEqual<unknown>(snapshot, 0);

    assert.strictEqual<unknown>(fromConstant, 'btn');

    assert.strictEqual(fromObservable, count);
  });
});

// Plain objects stand in for `KeyboardEvent`s: it reads only these fields, and
// Node.js has no `KeyboardEvent`.
describe(isImeKeyDown, () => {
  test('is a key down sent while an input method is composing', () => {
    assert.isTrue(isImeKeyDown(keyDown('a', 229, true)));

    assert.isTrue(isImeKeyDown(keyDown('ArrowUp', 229, true)));
  });

  test.each(['Enter', 'Escape'])(
    'is %s with key code 229, which Safari sends after compositionend',
    (key) => {
      assert.isTrue(isImeKeyDown(keyDown(key, 229)));
    },
  );

  test('is not another key with key code 229, as an Android virtual keyboard sends every key', () => {
    assert.isFalse(isImeKeyDown(keyDown('ArrowUp', 229)));
  });

  test.each([
    ['Enter', 13],
    ['Escape', 27],
    ['a', 65],
  ] as const)('is not a plain %s', (key, code) => {
    assert.isFalse(isImeKeyDown(keyDown(key, code)));
  });
});

describe(createAfterUpdate, () => {
  test('runs the work in a microtask, and drops it once the owner is disposed', async () => {
    const owner = createOwner();

    const afterUpdate = owner.run(createAfterUpdate);

    const mut_log: string[] = [];

    afterUpdate(() => {
      mut_log.push('first');
    });

    assert.deepStrictEqual(mut_log, []);

    await Promise.resolve();

    assert.deepStrictEqual(mut_log, ['first']);

    afterUpdate(() => {
      mut_log.push('second');
    });

    owner.dispose();

    await Promise.resolve();

    assert.deepStrictEqual(mut_log, ['first']);
  });
});

describe(listenInScope, () => {
  test('listens, with the options it is given, until the owner is disposed', () => {
    const owner = createOwner();

    const target = new EventTarget();

    const mut_received: string[] = [];

    owner.run(() => {
      listenInScope(
        target,
        'ping',
        (event) => {
          mut_received.push(event.type);
        },
        { capture: true },
      );
    });

    target.dispatchEvent(new Event('ping'));

    owner.dispose();

    target.dispatchEvent(new Event('ping'));

    assert.deepStrictEqual(mut_received, ['ping']);
  });

  test('removes the listener with the capture flag it was added with', () => {
    const owner = createOwner();

    const target = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as const;

    owner.run(() => {
      listenInScope(target, 'ping', ignore, { capture: true });
    });

    owner.dispose();

    expect(target.removeEventListener).toHaveBeenCalledExactlyOnceWith(
      'ping',
      ignore,
      { capture: true },
    );
  });
});

const ignore = (): void => {};

/** The fields of a key down that `isImeKeyDown` reads. */
const keyDown = (
  key: string,
  code: number,
  isComposing: boolean = false,
): Readonly<{ key: string; keyCode: number; isComposing: boolean }> =>
  ({
    key,
    keyCode: code,
    isComposing,
  }) as const;
