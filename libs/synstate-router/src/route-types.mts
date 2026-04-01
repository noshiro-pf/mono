// --- Input definition types (what the user writes) ---

export type PathParamType = 'path.string';

type AnyQueryParamSerializer = Readonly<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  encode: (value: any) => string | undefined;
  decode: (raw: string | null) => unknown;
}>;

export type RouteNodeInput = Readonly<{
  segment?: string;
  params?: Readonly<Record<string, PathParamType>>;
  queryParams?: Readonly<Record<string, AnyQueryParamSerializer>>;
  children?: Readonly<Record<string, RouteNodeInput>>;
}>;

export type RoutesDefInput = Readonly<Record<string, RouteNodeInput>>;

// --- Pattern string literal type computation ---

/**
 * Compute the segment string for a single node.
 * - `{ segment: '' }` → empty (root)
 * - `{ segment: 'foo' }` → `foo`
 * - `{ params: { id: ... } }` → `:id`
 * - default → key name
 */
type NodeSegment<Key extends string, D extends RouteNodeInput> =
  D extends Readonly<{
    params: infer P extends Readonly<Record<string, unknown>>;
  }>
    ? `:${keyof P & string}`
    : D extends Readonly<{ segment: infer S extends string }>
      ? S
      : Key;

/**
 * Build the full pattern string for a node by appending its segment
 * to the parent pattern.
 */
type BuildPattern<
  ParentPattern extends string,
  Key extends string,
  D extends RouteNodeInput,
> =
  NodeSegment<Key, D> extends ''
    ? ParentPattern extends ''
      ? '/'
      : ParentPattern
    : `${ParentPattern}/${NodeSegment<Key, D>}`;

// --- Output type computation ---

/**
 * Top-level output: maps each key in the definition to a typed route node.
 */
export type DefineRoutesOutput<D extends RoutesDefInput> = Readonly<{
  [K in keyof D & string]: RouteNodeOutput<
    D[K],
    ExtractOwnParamKeys<D[K]>,
    BuildPattern<'', K, D[K]>
  >;
}>;

/**
 * A single route node output, combining base methods + children + queryParams.
 */
type RouteNodeOutput<
  D extends RouteNodeInput,
  AccParams extends string,
  Pattern extends string,
> = RouteNodeBase<AccParams, Pattern> &
  ChildrenOutput<D, AccParams, Pattern> &
  QueryParamsOutput<D>;

/**
 * Base route node API: pattern, path(), match(), matchExact().
 */
type RouteNodeBase<
  AccParams extends string,
  Pattern extends string,
> = Readonly<{
  /** Phantom type to carry accumulated param keys for type inference. */
  _params: Readonly<Record<AccParams, string>>;
  pattern: Pattern;
  path: readonly [AccParams] extends readonly [never]
    ? () => string
    : (params: Readonly<Record<AccParams, string>>) => string;
  match: (
    segments: readonly string[],
  ) => Readonly<Record<AccParams, string>> | undefined;
  matchExact: (
    segments: readonly string[],
  ) => Readonly<Record<AccParams, string>> | undefined;
}>;

/**
 * Extracts the params type from a route node that has `_params`.
 */
export type RouteParams<N> =
  N extends Readonly<{ _params: infer P }>
    ? P
    : Readonly<Record<string, string>>;

/**
 * Recursively compute children output types.
 */
type ChildrenOutput<
  D extends RouteNodeInput,
  ParentAccParams extends string,
  ParentPattern extends string,
> =
  D extends Readonly<{ children: infer C }>
    ? C extends Readonly<Record<string, RouteNodeInput>>
      ? Readonly<{
          [K in keyof C & string]: RouteNodeOutput<
            C[K],
            ParentAccParams | ExtractOwnParamKeys<C[K]>,
            BuildPattern<ParentPattern, K, C[K]>
          >;
        }>
      : Record<never, never>
    : Record<never, never>;

/**
 * Extract param key names from a node definition.
 */
type ExtractOwnParamKeys<D extends RouteNodeInput> =
  D extends Readonly<{ params: infer P }>
    ? P extends Readonly<Record<string, unknown>>
      ? keyof P & string
      : never
    : never;

/**
 * Expose queryParams on the output if defined in the input.
 */
type QueryParamsOutput<D extends RouteNodeInput> =
  D extends Readonly<{ queryParams: infer QP }>
    ? QP extends Readonly<Record<string, AnyQueryParamSerializer>>
      ? Readonly<{
          queryParams: Readonly<{
            [K in keyof QP & string]: QP[K] & Readonly<{ key: string }>;
          }>;
        }>
      : Record<never, never>
    : Record<never, never>;

// --- Exhaustive route matching types ---

/**
 * Recursively collects `{ pattern, params }` entries from a routes output tree.
 * Used to build the exhaustive handler map type.
 */
export type CollectRouteEntries<T> =
  T extends Readonly<{ _params: infer P; pattern: infer Pat extends string }>
    ? Readonly<{ pattern: Pat; params: P }> | CollectChildEntries<T>
    : CollectChildEntries<T>;

/** Keys that are part of RouteNodeBase, not children. */
type RouteNodeBaseKeys =
  | '_params'
  | 'match'
  | 'matchExact'
  | 'path'
  | 'pattern'
  | 'queryParams';

type CollectChildEntries<T> = {
  [K in Exclude<keyof T, RouteNodeBaseKeys>]: T[K] extends Readonly<{
    _params: unknown;
    pattern: string;
  }>
    ? CollectRouteEntries<T[K]>
    : never;
}[Exclude<keyof T, RouteNodeBaseKeys>];

/** Extract the pattern string from a union of route entries. */
type EntryPattern<E> =
  E extends Readonly<{ pattern: infer P extends string }> ? P : never;

/** Given a union of entries and a pattern, extract the corresponding params. */
type EntryParams<Entries, Pat extends string> =
  Entries extends Readonly<{ pattern: Pat; params: infer P }> ? P : never;

/** All collected entries for a routes definition. */
type AllEntries<D extends RoutesDefInput> = CollectRouteEntries<
  DefineRoutesOutput<D>
>;

/**
 * Builds a handler map type where every route pattern must have a handler.
 * Each handler receives the correctly typed params for that route.
 * A handler may be `undefined` to skip the route (falls through to fallback).
 */
export type ExhaustiveRouteHandlerMap<D extends RoutesDefInput, R> = Readonly<
  {
    [P in EntryPattern<AllEntries<D>>]:
      | ((params: EntryParams<AllEntries<D>, P>) => R)
      | undefined;
  } & { fallback: () => R }
>;

/**
 * Builds a partial handler map type where not all routes need handlers.
 * Each handler still receives correctly typed params.
 */
export type PartialRouteHandlerMap<D extends RoutesDefInput, R> = Readonly<
  {
    [P in EntryPattern<AllEntries<D>>]?:
      | ((params: EntryParams<AllEntries<D>, P>) => R)
      | undefined;
  } & { fallback: () => R }
>;
