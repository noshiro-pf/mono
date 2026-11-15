// cspell:ignore fetsh loadin
import { expectType } from 'ts-data-forge';
import type { RelaxedExtract } from 'ts-type-forge';
import { defineMachine, type SourceStateType } from './define-machine.mjs';

type State = Readonly<
  | { type: 'idle' }
  | { type: 'loading'; startedAt: number }
  | { type: 'success'; data: string }
  | { type: 'error'; message: string }
  | { type: 'closed' }
>;

type Action = Readonly<
  | { type: 'fetch'; now: number }
  | { type: 'resolve'; data: string }
  | { type: 'reject'; message: string }
  | { type: 'reset' }
  | { type: 'close' }
>;

type StateOf<K extends State['type']> = RelaxedExtract<
  State,
  Readonly<{ type: K }>
>;

const fetchMachine = defineMachine<State, Action>()(
  {
    idle: { fetch: 'loading', close: 'closed' },
    loading: { resolve: 'success', reject: 'error', reset: 'idle' },
    success: { fetch: 'loading', reset: 'idle' },
    error: { fetch: ['loading', 'closed'], reset: 'idle' },
    closed: {},
  },
  {
    idle: {
      fetch: (_, a) => ({ type: 'loading', startedAt: a.now }),
      close: () => ({ type: 'closed' }),
    },
    loading: {
      resolve: (_, a) => ({ type: 'success', data: a.data }),
      reject: (_, a) => ({ type: 'error', message: a.message }),
      reset: () => ({ type: 'idle' }),
    },
    success: {
      fetch: (_, a) => ({ type: 'loading', startedAt: a.now }),
      reset: () => ({ type: 'idle' }),
    },
    error: {
      // A payload-dependent outcome: the graph declares both targets.
      fetch: (s, a) =>
        s.message === 'fatal'
          ? { type: 'closed' }
          : { type: 'loading', startedAt: a.now },
      reset: () => ({ type: 'idle' }),
    },
  },
);

const idle: StateOf<'idle'> = { type: 'idle' } as const;

const loading: StateOf<'loading'> = { type: 'loading', startedAt: 0 } as const;

const failed: StateOf<'error'> = { type: 'error', message: 'timeout' } as const;

/** Forgets what the compiler knows of a state beyond `State`. */
const widen = (s: State): State => s;

/**
 * `can` with a type parameter for the action type: `false` narrows nothing,
 * since `T` may be instantiated with a union, and `true` narrows to a type that
 * still depends on `T`.
 */
const canDo = <T extends Action['type']>(
  state: State,
  actionType: T,
): State | undefined => {
  if (!fetchMachine.can(state, actionType)) {
    expectType<typeof state, State>('=');

    return undefined;
  }

  // Assignable only if narrowed: `State` is not assignable to a type that
  // depends on `T`.
  const narrowed: RelaxedExtract<
    State,
    Readonly<{ type: SourceStateType<typeof fetchMachine.graph, T> }>
  > = state;

  return narrowed;
};

/** An action type the compiler knows only as one of two. */
const fetchOrResolve = (): 'fetch' | 'resolve' => 'fetch';

describe(defineMachine, () => {
  describe('reducer', () => {
    test('applies the handler of an edge the graph declares', () => {
      assert.deepStrictEqual(
        fetchMachine.reducer(idle, { type: 'fetch', now: 1 }),
        { type: 'loading', startedAt: 1 },
      );

      assert.deepStrictEqual(
        fetchMachine.reducer(loading, { type: 'resolve', data: 'x' }),
        { type: 'success', data: 'x' },
      );
    });

    test('returns the same state for a pair the graph leaves out', () => {
      const next = fetchMachine.reducer(idle, { type: 'resolve', data: 'x' });

      // Takes and returns the whole unions: it is a plain reducer.
      expectType<Parameters<typeof fetchMachine.reducer>[0], State>('=');

      expectType<Parameters<typeof fetchMachine.reducer>[1], Action>('=');

      expectType<typeof next, State>('=');

      assert.strictEqual(next, idle);
    });

    test('folds a sequence of actions, ignoring the ones out of place', () => {
      const actions: readonly Action[] = [
        { type: 'resolve', data: 'too early' },
        { type: 'fetch', now: 1 },
        { type: 'fetch', now: 2 },
        { type: 'reject', message: 'timeout' },
        { type: 'fetch', now: 3 },
        { type: 'resolve', data: 'ok' },
      ] as const;

      assert.deepStrictEqual(
        actions.reduce<State>(fetchMachine.reducer, idle),
        { type: 'success', data: 'ok' },
      );
    });

    test('calls onIllegal with the pair it ignores', () => {
      const mut_ignored: string[] = [];

      const machine = defineMachine<State, Action>()(
        {
          idle: { close: 'closed' },
          loading: {},
          success: {},
          error: {},
          closed: {},
        },
        { idle: { close: () => ({ type: 'closed' }) } },
        {
          onIllegal: (s, a) => {
            mut_ignored.push(`${s.type} ${a.type}`);
          },
        },
      );

      machine.reducer(idle, { type: 'fetch', now: 0 });

      machine.reducer(idle, { type: 'close' });

      assert.deepStrictEqual(mut_ignored, ['idle fetch']);
    });

    test('throws when a handler returns a state its edge does not declare', () => {
      const machine = defineMachine<State, Action>()(
        {
          idle: { close: 'closed' },
          loading: {},
          success: {},
          error: {},
          closed: {},
        },
        {
          idle: {
            // Only a cast can get this past the compiler, which is the case the
            // runtime check is for.
            // eslint-disable-next-line total-functions/no-unsafe-type-assertion
            close: () => ({ type: 'idle' }) as unknown as StateOf<'closed'>,
          },
        },
      );

      assert.throws(
        () => machine.reducer(idle, { type: 'close' }),
        /idle --close--> idle is not an edge/u,
      );
    });
  });

  describe('transition', () => {
    test('returns the target state, typed by the edge', () => {
      const next = fetchMachine.transition(idle, { type: 'fetch', now: 5 });

      expectType<typeof next, StateOf<'loading'>>('=');

      assert.deepStrictEqual(next, { type: 'loading', startedAt: 5 });
    });

    test('types an edge with several targets as their union', () => {
      const next = fetchMachine.transition(failed, { type: 'fetch', now: 5 });

      expectType<typeof next, StateOf<'closed' | 'loading'>>('=');

      assert.deepStrictEqual(next, { type: 'loading', startedAt: 5 });

      assert.deepStrictEqual(
        fetchMachine.transition(
          { type: 'error', message: 'fatal' },
          { type: 'fetch', now: 5 },
        ),
        { type: 'closed' },
      );
    });

    test('accepts on a union of states only the actions every member allows', () => {
      const s: StateOf<'loading' | 'success'> = loading;

      const next = fetchMachine.transition(s, { type: 'reset' });

      expectType<typeof next, StateOf<'idle'>>('=');

      assert.deepStrictEqual(next, { type: 'idle' });
    });

    test('rejects at compile time a pair the graph leaves out', () => {
      assert.throws(() => {
        // @ts-expect-error `idle` has no `resolve` edge.
        fetchMachine.transition(idle, { type: 'resolve', data: 'x' });
      }, /no edge idle --resolve-->/u);

      const s = widen(loading);

      assert.throws(() => {
        // @ts-expect-error Not every state has a `fetch` edge.
        fetchMachine.transition(s, { type: 'fetch', now: 0 });
      }, /no edge loading --fetch-->/u);
    });
  });

  describe('can', () => {
    test('narrows the state to those with an edge for the action', () => {
      const s = widen(loading);

      assert.isTrue(fetchMachine.can(s, 'resolve'));

      if (fetchMachine.can(s, 'resolve')) {
        expectType<typeof s, StateOf<'loading'>>('=');

        assert.deepStrictEqual(
          fetchMachine.transition(s, { type: 'resolve', data: 'x' }),
          { type: 'success', data: 'x' },
        );
      }

      assert.isFalse(fetchMachine.can(idle, 'resolve'));

      assert.isFalse(fetchMachine.can({ type: 'closed' }, 'reset'));
    });
  });

  describe('can, given a union of action types', () => {
    test('narrows nothing, since `false` speaks only of the one passed', () => {
      const s = widen(loading);

      if (fetchMachine.can(s, fetchOrResolve())) {
        return;
      }

      expectType<typeof s, State>('=');

      assert.strictEqual(s.type, 'loading');
    });

    test('narrows nothing on `false` for a type parameter, which may be a union', () => {
      assert.deepStrictEqual(canDo(loading, 'resolve'), loading);

      assert.isUndefined(canDo(loading, 'fetch'));
    });
  });

  describe('allowedActionTypes', () => {
    test('lists the actions the state has an edge for, in declaration order', () => {
      assert.deepStrictEqual(fetchMachine.allowedActionTypes(loading), [
        'resolve',
        'reject',
        'reset',
      ]);

      assert.deepStrictEqual(
        fetchMachine.allowedActionTypes({ type: 'closed' }),
        [],
      );

      const types = fetchMachine.allowedActionTypes(idle);

      expectType<typeof types, readonly ('close' | 'fetch')[]>('=');

      assert.deepStrictEqual(types, ['fetch', 'close']);

      const some = fetchMachine.allowedActionTypes(widen(loading));

      // Any state's list: the union of what each type allows.
      expectType<typeof some, readonly Action['type'][]>('=');

      assert.deepStrictEqual(some, ['resolve', 'reject', 'reset']);

      // One frozen array per state type, so a UI can memoize on it.
      assert.strictEqual(
        fetchMachine.allowedActionTypes(loading),
        fetchMachine.allowedActionTypes({ type: 'loading', startedAt: 9 }),
      );

      assert.isTrue(Object.isFrozen(some));
    });
  });

  describe('definition', () => {
    test('rejects at compile time a definition that breaks its graph', () => {
      assert.throws(
        () =>
          defineMachine<State, Action>()(
            { idle: {}, loading: {}, success: {}, error: {}, closed: {} },
            {
              // @ts-expect-error No edge leaves `idle`, so it takes no handler.
              idle: {
                fetch: (_: unknown, a: Readonly<{ now: number }>) => ({
                  type: 'loading',
                  startedAt: a.now,
                }),
              },
            },
          ),
        /a handler for idle --fetch-->, which the graph has no edge for/u,
      );

      defineMachine<State, Action>()(
        {
          idle: { fetch: 'loading' },
          loading: {},
          success: {},
          error: {},
          closed: {},
        },
        // @ts-expect-error The handler returns `success`, not `loading`.
        { idle: { fetch: () => ({ type: 'success', data: '' }) } },
      );

      assert.throws(
        () =>
          defineMachine<State, Action>()(
            {
              // @ts-expect-error A misspelled action.
              idle: { fetsh: 'loading' },
              loading: {},
              success: {},
              error: {},
              closed: {},
            },
            {},
          ),
        /no handler for idle --fetsh-->/u,
      );

      assert.throws(
        () =>
          defineMachine<State, Action>()(
            {
              // @ts-expect-error A misspelled target state.
              idle: { fetch: 'loadin' },
              loading: {},
              success: {},
              error: {},
              closed: {},
            },
            { idle: { fetch: () => ({ type: 'idle' }) } },
          ),
        /idle --fetch--> loadin leads to no state/u,
      );

      defineMachine<State, Action>()(
        // @ts-expect-error `closed` is missing: every state is listed.
        { idle: {}, loading: {}, success: {}, error: {} },
        {},
      );
    });

    test('throws when a target names no state of the graph', () => {
      assert.throws(
        () =>
          defineMachine<State, Action>()(
            {
              // The cast stands for a graph built without its types.
              // eslint-disable-next-line total-functions/no-unsafe-type-assertion
              idle: { close: 'gone' as 'closed' },
              loading: {},
              success: {},
              error: {},
              closed: {},
            },
            { idle: { close: () => ({ type: 'closed' }) } },
          ),
        /idle --close--> gone/u,
      );
    });

    test('throws when an edge has no handler', () => {
      assert.throws(
        () =>
          defineMachine<State, Action>()(
            {
              idle: { close: 'closed' },
              loading: {},
              success: {},
              error: {},
              closed: {},
            },
            // The cast stands for handlers built without their types.
            // eslint-disable-next-line total-functions/no-unsafe-type-assertion
            {} as never,
          ),
        /no handler for idle --close-->/u,
      );
    });

    test('throws when an edge has no target', () => {
      assert.throws(
        () =>
          defineMachine<State, Action>()(
            {
              // The cast stands for a graph built without its types.
              // eslint-disable-next-line total-functions/no-unsafe-type-assertion
              idle: { close: [] as unknown as readonly ['closed'] },
              loading: {},
              success: {},
              error: {},
              closed: {},
            },
            { idle: { close: () => ({ type: 'closed' }) } },
          ),
        /the edge idle --close--> has no target/u,
      );
    });

    test('names each target once when a handler leaves its edge', () => {
      const machine = defineMachine<State, Action>()(
        {
          idle: { close: ['closed', 'error', 'closed'] },
          loading: {},
          success: {},
          error: {},
          closed: {},
        },
        {
          idle: {
            // Only a cast can get this past the compiler.
            // eslint-disable-next-line total-functions/no-unsafe-type-assertion
            close: () => ({ type: 'idle' }) as unknown as StateOf<'closed'>,
          },
        },
      );

      assert.throws(
        () => machine.reducer(idle, { type: 'close' }),
        /the edge leads only to closed \| error\.$/u,
      );
    });

    test('throws when a target is not a state type', () => {
      assert.throws(
        () =>
          defineMachine<State, Action>()(
            {
              // The cast stands for a graph built without its types.
              // eslint-disable-next-line total-functions/no-unsafe-type-assertion
              idle: { close: 5 as unknown as 'closed' },
              loading: {},
              success: {},
              error: {},
              closed: {},
            },
            { idle: { close: () => ({ type: 'closed' }) } },
          ),
        /the edge idle --close--> leads to something other than state types/u,
      );
    });

    test('finds no handler on Object.prototype', () => {
      assert.throws(
        () =>
          defineMachine<State, Action>()(
            {
              // The cast stands for a graph built without its types.
              // eslint-disable-next-line total-functions/no-unsafe-type-assertion
              idle: { constructor: 'idle' } as never,
              loading: {},
              success: {},
              error: {},
              closed: {},
            },

            { idle: {} },
          ),
        /no handler for idle --constructor-->/u,
      );
    });

    test('keeps a frozen copy of the graph', () => {
      const closeTargets = ['closed', 'idle', 'closed'] as const;

      const graph = {
        idle: { close: closeTargets },
        loading: {},
        success: {},
        error: {},
        closed: {},
      } as const;

      const machine = defineMachine<State, Action>()(graph, {
        idle: { close: () => ({ type: 'closed' }) },
      });

      assert.notStrictEqual(machine.graph, graph);

      assert.isTrue(Object.isFrozen(machine.graph));

      assert.isTrue(Object.isFrozen(machine.graph.idle));

      assert.isFalse(Object.isFrozen(graph));

      // A target tuple is copied as written, repeat kept, and frozen; the
      // caller's is left as it was.
      assert.notStrictEqual(machine.graph.idle.close, closeTargets);

      assert.deepStrictEqual(machine.graph.idle.close, closeTargets);

      assert.isTrue(Object.isFrozen(machine.graph.idle.close));

      assert.isFalse(Object.isFrozen(closeTargets));
    });

    test('keeps the graph it was given', () => {
      assert.deepStrictEqual(fetchMachine.graph.error, {
        fetch: ['loading', 'closed'],
        reset: 'idle',
      });
    });
  });

  describe('another discriminating property', () => {
    type Door = Readonly<{ kind: 'closed' } | { kind: 'open'; by: string }>;

    type DoorAction = Readonly<
      { kind: 'close' } | { kind: 'open'; by: string }
    >;

    const door = defineMachine<Door, DoorAction, 'kind'>('kind')(
      {
        closed: { open: 'open' },
        open: { close: 'closed' },
      },
      {
        closed: { open: (_, a) => ({ kind: 'open', by: a.by }) },
        open: { close: () => ({ kind: 'closed' }) },
      },
    );

    const closed: Door = { kind: 'closed' } as const;

    test('reads the states and actions by it', () => {
      assert.deepStrictEqual(door.reducer(closed, { kind: 'open', by: 'me' }), {
        kind: 'open',
        by: 'me',
      });

      assert.strictEqual(door.reducer(closed, { kind: 'close' }), closed);

      assert.deepStrictEqual(door.allowedActionTypes(closed), ['open']);
    });

    test('narrows by it', () => {
      const s: Door = door.reducer(closed, { kind: 'open', by: 'me' });

      if (door.can(s, 'close')) {
        expectType<typeof s, Readonly<{ kind: 'open'; by: string }>>('=');

        expectType<
          ReturnType<
            typeof door.transition<typeof s, Readonly<{ kind: 'close' }>>
          >,
          Readonly<{ kind: 'closed' }>
        >('=');
      }

      assert.isTrue(door.can(s, 'close'));
    });

    test('checks what a handler returns by it', () => {
      const stillClosed: Door = { kind: 'closed' } as const;

      // A handler that lies about where it goes, as only an assertion can.
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      const lying = stillClosed as unknown as Readonly<{
        kind: 'open';
        by: string;
      }>;

      const broken = defineMachine<Door, DoorAction, 'kind'>('kind')(
        { closed: { open: 'open' }, open: {} },
        { closed: { open: () => lying } },
      );

      assert.throws(
        () => broken.reducer(closed, { kind: 'open', by: 'me' }),
        /closed is not an edge of the graph/u,
      );
    });

    test('ignores a state or an action without it', () => {
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      const untagged = { type: 'closed' } as unknown as Door;

      assert.strictEqual(door.reducer(untagged, { kind: 'close' }), untagged);

      assert.isFalse(door.can(untagged, 'open'));

      assert.deepStrictEqual(door.allowedActionTypes(untagged), []);

      assert.strictEqual(
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        door.reducer(closed, {
          type: 'open',
          by: 'me',
        } as unknown as DoorAction),
        closed,
      );
    });

    test('is named in the type arguments and the call alike', () => {
      // The checks are the compiler's; both calls still run.
      // @ts-expect-error With no argument, the unions are read by `type`.
      const unnamed = defineMachine<Door, DoorAction, 'kind'>();

      // @ts-expect-error The argument must be the property the type argument names.
      const misnamed = defineMachine<Door, DoorAction, 'kind'>('name');

      assert.isFunction(unnamed);

      assert.isFunction(misnamed);
    });
  });
});
