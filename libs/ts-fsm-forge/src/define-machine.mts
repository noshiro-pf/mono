import { Arr, hasKey } from 'ts-data-forge';
import type {
  IsUnion,
  NonEmptyTuple,
  ReadonlyRecord,
  RelaxedExtract,
} from 'ts-type-forge';
import { edgeTargets } from './internal/index.mjs';

/**
 * Defines a state machine whose reducer is restricted to a declared transition
 * graph.
 *
 * A plain reducer `(state, action) => state` accepts every pair, which for a
 * finite set of states is a complete graph. Here the graph is data: for each
 * state type, the action types it has an edge for and the state type(s) each
 * edge leads to. From it come
 *
 * - **per-edge handlers**, each given the source state and the action already
 *   narrowed, and required to return one of the edge's target states;
 * - a total {@link Machine.reducer} that returns the state unchanged for a pair
 *   the graph leaves out, for `useReducer`, Redux, or folding a log of actions;
 * - {@link Machine.transition}, which the compiler refuses for such a pair, and
 *   {@link Machine.can}, the type guard that narrows a state to one it accepts.
 *
 * The state type and the action type are given first and the graph is
 * inferred, so the call is curried: `defineMachine<State, Action>()(graph,
 * handlers)`. Both are discriminated by a `type` property.
 *
 * The definition is checked when it is made: an edge with no target, with a
 * target that is not a string or an array of them, or with a target that names
 * no state of the graph, an edge without a handler and a handler for no edge
 * throw. The machine keeps a frozen copy of the graph, so changing the object
 * passed in afterwards changes neither.
 *
 * @template S The state union, discriminated by `type`.
 * @template A The action union, discriminated by `type`.
 */
export const defineMachine =
  <S extends Tagged, A extends Tagged>() =>
  <const G extends TransitionGraph<S, A>>(
    graph: G,
    handlers: EdgeHandlers<S, A, G>,
    options?: MachineOptions<S, A>,
  ): Machine<S, A, G> => {
    const rows = compileRows<S, A>(graph, handlers);

    const findEdge = (state: S, action: A): Edge<S, A> | undefined =>
      rows.get(state.type)?.edges.get(action.type);

    const reducer = (state: S, action: A): S => {
      const edge = findEdge(state, action);

      if (edge === undefined) {
        options?.onIllegal?.(state, action);

        return state;
      }

      return follow(edge, state, action);
    };

    const transition = (state: S, action: A): S => {
      const edge = findEdge(state, action);

      if (edge === undefined) {
        throw new Error(
          `ts-fsm-forge: no edge ${state.type} --${action.type}--> in the graph. \`transition\` takes only the pairs the graph declares; \`reducer\` ignores the others.`,
        );
      }

      return follow(edge, state, action);
    };

    const can = (state: S, actionType: A['type']): boolean =>
      rows.get(state.type)?.edges.has(actionType) ?? false;

    const allowedActionTypes = (state: S): readonly A['type'][] =>
      rows.get(state.type)?.actionTypes ?? noActionTypes;

    // The signatures `Machine` declares are generic over the state passed in,
    // which these implementations, written over `S` and `A`, cannot state.
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return {
      graph: graphOf(rows),
      reducer,
      transition,
      can,
      allowedActionTypes,
    } as unknown as Machine<S, A, G>;
  };

/** A state or an action: an object discriminated by its `type`. */
export type Tagged = Readonly<{ type: string }>;

/**
 * Where an edge leads: one state type, or several when which one depends on the
 * payload (the handler decides, and must return one of them).
 */
export type EdgeTarget<S extends Tagged> = S['type'] | NonEmptyTuple<S['type']>;

/**
 * The transition graph: every state type, each with the action types it has an
 * edge for and the target(s) of each edge. A state with no outgoing edge is
 * listed with `{}`, so that adding a state to the union asks where it goes.
 */
export type TransitionGraph<
  S extends Tagged,
  A extends Tagged,
> = ReadonlyRecord<
  S['type'],
  Partial<ReadonlyRecord<A['type'], EdgeTarget<S>>>
>;

/**
 * One handler per edge of `G`, keyed like the graph. A handler takes the source
 * state and the action, both narrowed by `type`, and returns a state whose
 * `type` is one of the edge's targets. A state with no outgoing edge takes no
 * entry.
 */
export type EdgeHandlers<S extends Tagged, A extends Tagged, G> = Readonly<
  Readonly<{
    [K in keyof G as [keyof G[K]] extends [never] ? never : K]: Readonly<{
      [T in keyof G[K]]: (
        state: RelaxedExtract<S, Readonly<{ type: K }>>,
        action: RelaxedExtract<A, Readonly<{ type: T }>>,
      ) => RelaxedExtract<S, Readonly<{ type: TargetStateType<G[K][T]> }>>;
    }>;
  }> &
    Readonly<{
      [K in keyof G as [keyof G[K]] extends [never] ? K : never]?: never;
    }>
>;

/** Options of {@link defineMachine}. */
export type MachineOptions<S extends Tagged, A extends Tagged> = Readonly<{
  /**
   * Called by {@link Machine.reducer} with each pair it ignores because the
   * graph has no edge for it, e.g. to log it in development.
   */
  onIllegal?: (state: S, action: A) => void;
}>;

/** What {@link defineMachine} returns. */
export type Machine<
  S extends Tagged,
  A extends Tagged,
  G extends TransitionGraph<S, A>,
> = Readonly<{
  /**
   * A frozen copy of the graph the machine was defined with, target arrays
   * copied too: never the object passed in.
   */
  graph: G;

  /**
   * A total reducer: the handler's result for an edge of the graph, and the
   * same `state` for a pair the graph leaves out (after calling `onIllegal`).
   * Throws if a handler returns a state its edge does not lead to, which only a
   * type assertion in the handler can bring about.
   */
  reducer: (state: S, action: A) => S;

  /**
   * The handler's result for an edge of the graph, typed by the edge's
   * target(s). The compiler accepts only the actions every member of the
   * state's type has an edge for, so the state is narrowed first — with a
   * `switch` on `type`, or with {@link Machine.can}. Throws for a pair the
   * graph leaves out, which only an assertion can pass the compiler.
   */
  transition: <
    Cur extends S,
    Act extends RelaxedExtract<
      A,
      Readonly<{ type: AllowedActionType<G, Cur['type']> }>
    >,
  >(
    state: Cur,
    action: Act,
  ) => RelaxedExtract<
    S,
    Readonly<{ type: NextStateType<G, Cur['type'], Act['type']> }>
  >;

  /**
   * Whether `state` has an edge for `actionType`, narrowing it to the state
   * types that do. Given a union of action types, it narrows nothing: `false`
   * then says only that the one passed has no edge, not that none of them has.
   */
  can: {
    // For a type parameter `T`, the narrowed type stays generic in `T`, so
    // `false` excludes nothing: `T` may be instantiated with a union.
    <T extends A['type']>(
      state: S,
      actionType: IsUnion<T> extends true ? never : T,
    ): state is RelaxedExtract<S, Readonly<{ type: SourceStateType<G, T> }>>;

    (state: S, actionType: A['type']): boolean;
  };

  /**
   * The action types `state` has an edge for, in the order the graph lists
   * them: what a UI may offer in that state. The same frozen array is returned
   * for every state of one type.
   */
  allowedActionTypes: <Cur extends S>(
    state: Cur,
  ) => readonly EdgeActionType<G, Cur['type']>[];
}>;

/**
 * The action types every state type in `K` has an edge for. `keyof` of a union
 * of objects is the keys they share, so a union of states accepts only what
 * each of them does.
 */
export type AllowedActionType<G, K extends keyof G> = keyof G[K] & string;

/**
 * The action types some state type in `K` has an edge for: what
 * {@link Machine.allowedActionTypes} may list for a state of one of them.
 */
export type EdgeActionType<G, K extends keyof G> = K extends unknown
  ? keyof G[K] & string
  : never;

/** The state types the edges for `T` from the state types in `K` lead to. */
export type NextStateType<G, K extends keyof G, T> = K extends unknown
  ? T extends keyof G[K]
    ? TargetStateType<G[K][T]>
    : never
  : never;

/** The state types that have an edge for the action type `T`. */
export type SourceStateType<G, T> = {
  [K in keyof G]: T extends keyof G[K] ? K : never;
}[keyof G];

/**
 * The state types an {@link EdgeTarget} names: the tuple's members, or the one
 * state type.
 */
export type TargetStateType<V> = V extends readonly (infer U)[] ? U : V;

// One list per edge, as the graph wrote it, serves both `Machine.graph` and the
// check in `follow`. `Machine.graph` keeps a repeat as written; only `follow`'s
// error message drops it (`Arr.uniq`). A second, deduplicated list would be one
// more list to keep in step. `toMermaid` reads the graph, not an `Edge`, and
// drops repeats itself. The list being frozen is what keeps a change to
// `machine.graph` from widening what `follow` accepts.
type Edge<S extends Tagged, A extends Tagged> = Readonly<{
  from: string;
  actionType: string;
  /**
   * The state types the edge leads to as the graph wrote them, a repeat
   * included: a new, checked, frozen array, never the graph's own.
   */
  targets: readonly string[];
  /**
   * The target in the graph's own form, for {@link Machine.graph}: the state
   * type for a string target, `targets` itself for an array.
   */
  target: string | readonly string[];
  handler: (state: S, action: A) => S;
}>;

/** A state type's outgoing edges, and their action types in graph order. */
type Row<S extends Tagged, A extends Tagged> = Readonly<{
  edges: ReadonlyMap<string, Edge<S, A>>;
  actionTypes: readonly string[];
}>;

type UntypedGraph = TransitionGraph<Tagged, Tagged>;

type UntypedHandlers = ReadonlyRecord<
  string,
  ReadonlyRecord<string, unknown> | undefined
>;

const noActionTypes: readonly string[] = Object.freeze([]);

/** The graph as nested maps, checked against itself and the handlers. */
const compileRows = <S extends Tagged, A extends Tagged>(
  graph: UntypedGraph,
  handlers: UntypedHandlers,
): ReadonlyMap<string, Row<S, A>> => {
  const stateTypes = new Set(Object.keys(graph));

  // `hasKey` (`Object.hasOwn`) rather than `in` or plain access: a state or
  // action type such as `constructor` must not find `Object.prototype`.
  const handlerOf = (from: string, actionType: string): unknown => {
    const row = hasKey(handlers, from) ? handlers[from] : undefined;

    return row !== undefined && hasKey(row, actionType)
      ? row[actionType]
      : undefined;
  };

  const rows = new Map(
    Object.entries(graph).map(([from, row]) => {
      const edges = new Map(
        Object.entries(row).map(([actionType, target]) => {
          const targets = edgeTargets(from, actionType, target);

          for (const to of targets) {
            if (!stateTypes.has(to)) {
              throw new TypeError(
                `ts-fsm-forge: the edge ${from} --${actionType}--> ${to} leads to no state of the graph.`,
              );
            }
          }

          const handler = handlerOf(from, actionType);

          if (typeof handler !== 'function') {
            throw new TypeError(
              `ts-fsm-forge: no handler for ${from} --${actionType}-->.`,
            );
          }

          return [
            actionType,
            {
              from,
              actionType,
              targets,
              target: Arr.isArray(target) ? targets : targets[0],
              // eslint-disable-next-line total-functions/no-unsafe-type-assertion
              handler: handler as Edge<S, A>['handler'],
            },
          ] as const;
        }),
      );

      return [
        from,
        { edges, actionTypes: Object.freeze(Array.from(edges.keys())) },
      ] as const;
    }),
  );

  for (const [from, row] of Object.entries(handlers)) {
    for (const actionType of Object.keys(row ?? {})) {
      if (rows.get(from)?.edges.has(actionType) !== true) {
        throw new TypeError(
          `ts-fsm-forge: a handler for ${from} --${actionType}-->, which the graph has no edge for.`,
        );
      }
    }
  }

  return rows;
};

/**
 * The checked graph, frozen, as {@link Machine.graph} exposes it: built from
 * the rows rather than read again from the graph passed in.
 */
const graphOf = <S extends Tagged, A extends Tagged>(
  rows: ReadonlyMap<string, Row<S, A>>,
): ReadonlyRecord<string, ReadonlyRecord<string, unknown>> =>
  Object.freeze(
    Object.fromEntries(
      Array.from(rows, ([from, row]) => [
        from,
        Object.freeze(
          Object.fromEntries(
            Array.from(row.edges, ([actionType, edge]) => [
              actionType,
              edge.target,
            ]),
          ),
        ),
      ]),
    ),
  );

/**
 * Applies an edge's handler, checking that it went where the edge leads. The
 * check is for a handler whose result's `type` a type assertion got past the
 * compiler; a result that is not a state at all is left to the types.
 */
const follow = <S extends Tagged, A extends Tagged>(
  edge: Edge<S, A>,
  state: S,
  action: A,
): S => {
  const next = edge.handler(state, action);

  if (!edge.targets.includes(next.type)) {
    throw new Error(
      `ts-fsm-forge: ${edge.from} --${edge.actionType}--> ${next.type} is not an edge of the graph: the handler returned a \`${next.type}\` state, and the edge leads only to ${Arr.uniq(edge.targets).join(' | ')}.`,
    );
  }

  return next;
};
