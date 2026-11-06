import {
  batch,
  createBooleanState,
  createEventEmitter,
  createReducer,
  createState,
  createValueEmitter,
  map,
  state,
  type InitializedObservable,
  type Observable,
} from 'synstate-next';
import { expectType, hasKey, isRecord } from 'ts-data-forge';
import type { DeepReadonly, FixedLengthTuple } from 'ts-type-forge';

describe(createState, () => {
  test('setState, updateState and resetState pass on only a changed value', () => {
    const [s, setState, { updateState, resetState, getSnapshot }] =
      createState(0);

    expectType<typeof s, InitializedObservable<number>>('=');

    const seen = collect(s);

    setState(0);

    updateState((current) => current);

    resetState();

    setState(1);

    setState(1);

    updateState((current) => current + 1);

    assert.strictEqual(getSnapshot(), 2);

    resetState();

    assert.deepStrictEqual(seen, [0, 1, 2, 0]);
  });

  test('writes that come back within one round deliver the value again; a derived node cuts it off', () => {
    const [s, setState] = createState(0);

    const seen = collect(s);

    const doubled = collect(s.pipe(map((x) => x * 2)));

    batch(() => {
      setState(1);

      setState(0);
    });

    assert.deepStrictEqual(seen, [0, 0]);

    assert.deepStrictEqual(doubled, [0]);
  });

  test('passes on every update with `equals: () => false`', () => {
    const [s, setState] = createState(0, { equals: () => false });

    const seen = collect(s);

    setState(0);

    setState(0);

    assert.deepStrictEqual(seen, [0, 0, 0]);
  });

  test('keeps the current object when `equals` finds the next one equal', () => {
    const initial: Readonly<{ id: number; label: string }> = {
      id: 1,
      label: 'a',
    } as const;

    const [s, setState, { getSnapshot }] = createState(initial, {
      equals: (current, next) => current.id === next.id,
    });

    const seen = collect(s);

    setState({ id: 1, label: 'b' });

    assert.strictEqual(getSnapshot(), initial);

    assert.deepStrictEqual(seen, [initial]);
  });

  test('`updateState` during propagation reads the state the writes before it left', () => {
    const [s, , { updateState, getSnapshot }] = createState(0);

    const trigger = state(0);

    collect(
      trigger.pipe(
        map((x) => {
          if (x > 0) {
            updateState((current) => current + 1);

            updateState((current) => current + 1);
          }

          return x;
        }),
      ),
    );

    const seen = collect(s);

    trigger.set(1);

    assert.strictEqual(getSnapshot(), 2);

    assert.deepStrictEqual(seen, [0, 2]);
  });

  test('`initialState` is the value it was created with', () => {
    const [, setState, { initialState }] = createState('a');

    setState('b');

    assert.strictEqual(initialState, 'a');
  });
});

describe('createState with keepEqualParts', () => {
  test('passes nothing on, and keeps the current object, for a deeply equal state', () => {
    const initial: DeepReadonly<{ a: { b: number }; c: number[] }> = {
      a: { b: 1 },
      c: [1, 2],
    } as const;

    const [s, setState, { getSnapshot }] = createState(initial, {
      keepEqualParts: true,
    });

    const seen = collect(s);

    setState({ a: { b: 1 }, c: [1, 2] });

    assert.strictEqual(getSnapshot(), initial);

    assert.deepStrictEqual(seen, [initial]);
  });

  test('a new state keeps the branches that did not change', () => {
    const initial: DeepReadonly<{ a: { b: number }; c: { d: number } }> = {
      a: { b: 1 },
      c: { d: 2 },
    } as const;

    const [, setState, { getSnapshot }] = createState(initial, {
      keepEqualParts: true,
    });

    setState({ a: { b: 1 }, c: { d: 3 } });

    assert.strictEqual(getSnapshot().a, initial.a);

    assert.deepStrictEqual(getSnapshot().c, { d: 3 });
  });

  test('matches array items by `key`', () => {
    const first = { id: 1, v: 'x' } as const;

    const second = { id: 2, v: 'y' } as const;

    const { updateState, getSnapshot } = createState(
      [first, second] as readonly Readonly<{ id: number; v: string }>[],
      {
        keepEqualParts: {
          key: (item) =>
            isRecord(item) && hasKey(item, 'id') ? item.id : undefined,
        },
      },
    )[2];

    updateState(() => [
      { id: 2, v: 'y' },
      { id: 1, v: 'x' },
    ]);

    assert.strictEqual(getSnapshot()[0], second);

    assert.strictEqual(getSnapshot()[1], first);
  });

  test('is off by default', () => {
    const initial: Readonly<{ a: number }> = { a: 1 } as const;

    const [s, setState, { getSnapshot }] = createState(initial);

    const seen = collect(s);

    setState({ a: 1 });

    assert.notStrictEqual(getSnapshot(), initial);

    assert.strictEqual(seen.length, 2);
  });
});

describe('state with keepEqualParts', () => {
  test('applies to `set` and `update`', () => {
    const initial: DeepReadonly<{ a: { b: number } }> = {
      a: { b: 1 },
    } as const;

    const s = state(initial, { keepEqualParts: true });

    const seen = collect(s);

    s.set({ a: { b: 1 } });

    s.update(() => ({ a: { b: 1 } }));

    assert.strictEqual(s.value, initial);

    assert.deepStrictEqual(seen, [initial]);
  });
});

describe('state with keepEqualParts and equals', () => {
  test('`equals: () => false` passes on a deeply equal write with `keepEqualParts`', () => {
    const initial: Readonly<{ a: number }> = { a: 1 } as const;

    const s = state(initial, { keepEqualParts: true, equals: () => false });

    const seen = collect(s);

    s.set({ a: 1 });

    assert.strictEqual(seen.length, 2);

    // The parts kept are the held ones.
    assert.strictEqual(s.value, initial);
  });

  test('a write deeply equal to the value held keeps it, even while waiting for its round', () => {
    const s = state<DeepReadonly<{ a: { x: number } }>>(
      { a: { x: 1 } },
      { keepEqualParts: true },
    );

    collect(s);

    batch(() => {
      s.set({ a: { x: 2 } });

      const first = s.value;

      s.set({ a: { x: 2 } });

      assert.strictEqual(s.value, first);
    });
  });
});

describe(createReducer, () => {
  type Action = Readonly<{ type: 'add'; n: number } | { type: 'noop' }>;

  const reducer = (current: number, action: Action): number =>
    action.type === 'add' ? current + action.n : current;

  test('reduces each action and passes on only a changed state', () => {
    const [s, dispatch, { getSnapshot, initialState }] = createReducer(
      reducer,
      0,
    );

    const seen = collect(s);

    dispatch({ type: 'add', n: 2 });

    dispatch({ type: 'noop' });

    dispatch({ type: 'add', n: 3 });

    assert.strictEqual(getSnapshot(), 5);

    assert.strictEqual(initialState, 0);

    assert.deepStrictEqual(seen, [0, 2, 5]);
  });

  test('compares with `Object.is` by default', () => {
    const [s, dispatch] = createReducer(
      (_current: number, next: number) => next,
      Number.NaN,
    );

    const seen = collect(s);

    dispatch(Number.NaN);

    dispatch(0);

    dispatch(-0);

    assert.deepStrictEqual(seen, [Number.NaN, 0, -0]);
  });

  test('asks `equals` with the current state first and the next second', () => {
    const mut_asked: FixedLengthTuple<2, number>[] = [];

    const [, dispatch] = createReducer(reducer, 1, {
      equals: (current, next) => {
        mut_asked.push([current, next]);

        return false;
      },
    });

    dispatch({ type: 'add', n: 1 });

    assert.deepStrictEqual(mut_asked, [[1, 2]]);
  });

  test('a dispatch during propagation reduces the state the writes before it left', () => {
    const [s, dispatch] = createReducer(reducer, 0);

    const trigger = state(0);

    collect(
      trigger.pipe(
        map((x) => {
          if (x > 0) {
            dispatch({ type: 'add', n: 1 });

            dispatch({ type: 'add', n: 10 });
          }

          return x;
        }),
      ),
    );

    const seen = collect(s);

    trigger.set(1);

    assert.deepStrictEqual(seen, [0, 11]);
  });
});

describe(createBooleanState, () => {
  test('setTrue, setFalse and toggle pass on only a change', () => {
    const [s, { setTrue, setFalse, toggle, resetState, getSnapshot }] =
      createBooleanState(false);

    const seen = collect(s);

    setFalse();

    setTrue();

    setTrue();

    toggle();

    toggle();

    resetState();

    assert.isFalse(getSnapshot());

    assert.deepStrictEqual(seen, [false, true, false, true, false]);
  });

  test('passes on every update with `equals: () => false`', () => {
    const [s, { setTrue }] = createBooleanState(true, { equals: () => false });

    const seen = collect(s);

    setTrue();

    assert.deepStrictEqual(seen, [true, true]);
  });
});

describe(createEventEmitter, () => {
  test('emits `undefined` on every call', () => {
    const [event, emit] = createEventEmitter();

    expectType<typeof event, Observable<void>>('=');

    const seen = collect(event);

    emit();

    emit();

    assert.deepStrictEqual(seen, [undefined, undefined]);
  });
});

describe(createValueEmitter, () => {
  test('emits every value, equal or not', () => {
    const [event, emit] = createValueEmitter<number>();

    const seen = collect(event);

    emit(1);

    emit(1);

    assert.deepStrictEqual(seen, [1, 1]);
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
