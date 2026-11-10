import type { Optional } from 'ts-data-forge';
import type { IsUnion, ReadonlyRecord } from 'ts-type-forge';
import type { Href } from './href.mjs';
import type {
  RouteNodeInternals,
  RouteTree,
  routeNodeKey,
  routeTreeKey,
} from './internal/index.mjs';
import type { RestSegments } from './param-codec.mjs';
import type { SearchParseResult } from './search-codec.mjs';

// Definition: what the application writes

/** Any path parameter codec, whatever its value type. */
export type AnyParamCodec = AnySegmentParamCodec | AnyRestParamCodec;

/** Any codec of one path segment. */
export type AnySegmentParamCodec = Readonly<{
  decode: (raw: string) => Optional<unknown>;
  encode: (value: never) => string;
}>;

/** Any codec of the rest of the path (`param.rest`). */
export type AnyRestParamCodec = Readonly<{
  rest: true;
  decode: (segments: RestSegments) => Optional<unknown>;
  encode: (value: never) => RestSegments;
}>;

/** Any search codec, whatever its value type. */
export type AnySearchCodec = Readonly<{
  decode: (raw: never) => unknown;
  encode: (value: never) => readonly string[];
  parse: (raw: readonly string[]) => SearchParseResult<unknown>;
}>;

export type RouteDefinition = Readonly<{
  /**
   * The static segment, in place of the key. `''` puts the node on its parent's
   * path. Not allowed together with `params`.
   */
  segment?: string;
  /**
   * Exactly one key: the node is that dynamic segment, and its key is not part
   * of the path.
   */
  params?: ReadonlyRecord<string, AnyParamCodec>;
  /** Search parameters, inherited by every descendant. */
  search?: ReadonlyRecord<string, AnySearchCodec>;
  /** `false` for a node that is not a page of its own, such as a layout. */
  page?: false;
  /**
   * Data of the node's own, typed as written: a breadcrumb's label, a page's
   * title. The node exposes it as `meta`, and the matched branch lists it
   * (`matchedBranch`, `router.branch`).
   */
  meta?: unknown;
  children?: RouteDefinitions;
}>;

export type RouteDefinitions = ReadonlyRecord<string, RouteDefinition>;

/** Names a route node uses for its own members, so not usable as keys. */
export type ReservedRouteKey =
  | 'children'
  | 'href'
  | 'id'
  | 'match'
  | 'matchExact'
  | 'meta'
  | 'page'
  | 'params'
  | 'pattern'
  | 'search'
  | 'segment';

// Validation: maps a mistake to a type whose name says what is wrong

/**
 * `definition` is checked against `D & ValidateRoutes<D>`: a valid tree adds
 * nothing, and a mistake becomes a string literal type naming it, which the
 * written value is not assignable to.
 */
export type ValidateRoutes<Ds> = Readonly<{
  [K in keyof Ds]: K extends string
    ? IsInvalidKey<K> extends true
      ? `synstate-router: the key "${K}" is reserved, empty, or contains "." or "/"`
      : ValidateRoute<Ds[K]>
    : Ds[K];
}>;

type IsInvalidKey<K extends string> = K extends ReservedRouteKey | ''
  ? true
  : K extends `${string}.${string}` | `${string}/${string}`
    ? true
    : false;

type ValidateRoute<D> = ValidateParams<D> &
  ValidateSegment<D> &
  ValidateRest<D> &
  ValidateChildren<D>;

type ValidateRest<D> =
  D extends Readonly<{ params: infer P; children: unknown }>
    ? P[keyof P] extends Readonly<{ rest: true }>
      ? Readonly<{
          children: 'synstate-router: a param.rest node ends its branch and has no children';
        }>
      : unknown
    : unknown;

type ValidateParams<D> =
  D extends Readonly<{ params: infer P }>
    ? [keyof P] extends [never]
      ? Readonly<{ params: 'synstate-router: params has exactly one key' }>
      : IsUnion<keyof P> extends true
        ? Readonly<{ params: 'synstate-router: params has exactly one key' }>
        : unknown
    : unknown;

type ValidateSegment<D> =
  D extends Readonly<{ segment: infer S }>
    ? D extends Readonly<{ params: unknown }>
      ? Readonly<{
          segment: 'synstate-router: a node with params has no segment';
        }>
      : S extends `${string}/${string}` | '.' | '..'
        ? Readonly<{
            segment: 'synstate-router: a segment is one path segment, not "." or ".."';
          }>
        : unknown
    : unknown;

type ValidateChildren<D> =
  D extends Readonly<{ children: infer C }>
    ? Readonly<{ children: ValidateRoutes<C> }>
    : unknown;

// Values read from a definition

// Deliberately empty: a node with no params or search adds none.
// eslint-disable-next-line @typescript-eslint/no-generated-empty-object-type
type EmptyRecord = ReadonlyRecord<never, never>;

type ParamValue<C> =
  C extends Readonly<{
    encode: (value: infer T) => string | RestSegments;
  }>
    ? T
    : never;

type SearchValue<C> =
  C extends Readonly<{
    parse: (raw: readonly string[]) => SearchParseResult<infer T>;
  }>
    ? T
    : never;

type OwnParamCodecs<D> =
  D extends Readonly<{
    params: infer P extends ReadonlyRecord<string, AnyParamCodec>;
  }>
    ? P
    : EmptyRecord;

type OwnSearchCodecs<D> =
  D extends Readonly<{
    search: infer S extends ReadonlyRecord<string, AnySearchCodec>;
  }>
    ? S
    : EmptyRecord;

type OwnSegment<K extends string, D> =
  D extends Readonly<{ params: infer P }>
    ? P[keyof P] extends Readonly<{ rest: true }>
      ? `:${keyof P & string}*`
      : `:${keyof P & string}`
    : D extends Readonly<{ segment: infer S extends string }>
      ? S
      : K;

type JoinPath<
  Parent extends string,
  Segment extends string,
> = Segment extends '' ? Parent : `${Parent}/${Segment}`;

type JoinId<Parent extends string, K extends string> = Parent extends ''
  ? K
  : `${Parent}.${K}`;

type DisplayPattern<Path extends string> = Path extends '' ? '/' : Path;

type MetaOf<D> = D extends Readonly<{ meta: infer M }> ? M : undefined;

/** The path parameters of a node, its ancestors' included. */
export type RouteParams<ParamCodecs> = Readonly<{
  [K in keyof ParamCodecs]: ParamValue<ParamCodecs[K]>;
}>;

/** The search values of a node, its ancestors' included. */
export type RouteSearch<SearchCodecs> = Readonly<{
  [K in keyof SearchCodecs]: SearchValue<SearchCodecs[K]>;
}>;

/** What `href` accepts for search: any subset, `undefined` meaning absent. */
export type RouteSearchInput<SearchCodecs> = Readonly<{
  [K in keyof SearchCodecs]?: SearchValue<SearchCodecs[K]> | undefined;
}>;

export type RouteValues<ParamCodecs, SearchCodecs> = Readonly<{
  params: RouteParams<ParamCodecs>;
  search: RouteSearch<SearchCodecs>;
}>;

export type HrefOptions<SearchCodecs> = Readonly<{
  /** The fragment, without `#`. */
  hash?: string;
}> &
  ([keyof SearchCodecs] extends [never]
    ? unknown
    : Readonly<{ search?: RouteSearchInput<SearchCodecs> }>);

export type HrefFunction<ParamCodecs, SearchCodecs> = [
  keyof ParamCodecs,
] extends [never]
  ? (options?: HrefOptions<SearchCodecs>) => Href
  : (
      params: RouteParams<ParamCodecs>,
      options?: HrefOptions<SearchCodecs>,
    ) => Href;

/** A location to match: a pathname without the base path, and a query. */
export type RouteLocation = Readonly<{
  pathname: string;
  /** With or without the leading `?`. */
  search?: string;
}>;

// Nodes: what `defineRoutes` returns

type Flatten<T> = Readonly<{ [K in keyof T]: T[K] }>;

export type RouteNode<
  D,
  Id extends string,
  Path extends string,
  ParamCodecs,
  SearchCodecs,
> = Readonly<{
  [routeNodeKey]: RouteNodeInternals;
  /** The dotted path of keys: the discriminant of a `RouteMatch`. */
  id: Id;
  /** For display and debugging; never a key for matching or branching. */
  pattern: DisplayPattern<Path>;
  /** The node's own `meta`, as written; `undefined` when it has none. */
  meta: MetaOf<D>;
  /** The search codecs of this node, its ancestors' included. */
  search: Flatten<SearchCodecs>;
  /**
   * `Some` when the page the whole tree resolves the location to is this node
   * or one of its descendants.
   */
  match: (
    location: RouteLocation,
  ) => Optional<RouteValues<ParamCodecs, SearchCodecs>>;
}> &
  (D extends Readonly<{ page: false }>
    ? unknown
    : Readonly<{
        /** Makes the path to this page; the only way to make an `Href`. */
        href: HrefFunction<ParamCodecs, SearchCodecs>;
        /** `Some` when the whole tree resolves the location to this page. */
        matchExact: (
          location: RouteLocation,
        ) => Optional<RouteValues<ParamCodecs, SearchCodecs>>;
      }>) &
  RouteChildren<D, Id, Path, ParamCodecs, SearchCodecs>;

type RouteChildren<
  D,
  Id extends string,
  Path extends string,
  ParamCodecs,
  SearchCodecs,
> =
  D extends Readonly<{ children: infer C extends RouteDefinitions }>
    ? RouteNodes<C, Id, Path, ParamCodecs, SearchCodecs>
    : unknown;

type RouteNodes<
  Ds extends RouteDefinitions,
  ParentId extends string,
  ParentPath extends string,
  ParamCodecs,
  SearchCodecs,
> = Readonly<{
  [K in keyof Ds & string]: RouteNode<
    Ds[K],
    JoinId<ParentId, K>,
    JoinPath<ParentPath, OwnSegment<K, Ds[K]>>,
    ParamCodecs & OwnParamCodecs<Ds[K]>,
    SearchCodecs & OwnSearchCodecs<Ds[K]>
  >;
}>;

export type Routes<D extends RouteDefinitions> = RouteNodes<
  D,
  '',
  '',
  EmptyRecord,
  EmptyRecord
> &
  Readonly<{ [routeTreeKey]: RouteTree<D> }>;

export type AnyRoutes = Readonly<{
  [routeTreeKey]: RouteTree<RouteDefinitions>;
}>;

/** Any node of any route tree: what the router's node arguments accept. */
export type AnyRouteNode = Readonly<{
  [routeNodeKey]: RouteNodeInternals;
  id: string;
  search: ReadonlyRecord<string, AnySearchCodec>;
  match: (location: RouteLocation) => Optional<AnyRouteValues>;
}>;

type AnyRouteValues = Readonly<{
  params: ReadonlyRecord<string, unknown>;
  search: ReadonlyRecord<string, unknown>;
}>;

/** The `{ params; search }` a node's `match` returns. */
export type RouteNodeValues<N extends AnyRouteNode> =
  ReturnType<N['match']> extends Optional<infer V extends AnyRouteValues>
    ? V
    : never;

// Matches

type PageMatches<Ds, ParentId extends string, ParamCodecs, SearchCodecs> = {
  [K in keyof Ds & string]:
    | (Ds[K] extends Readonly<{ page: false }>
        ? never
        : Readonly<{
            route: JoinId<ParentId, K>;
            params: RouteParams<ParamCodecs & OwnParamCodecs<Ds[K]>>;
            search: RouteSearch<SearchCodecs & OwnSearchCodecs<Ds[K]>>;
          }>)
    | (Ds[K] extends Readonly<{ children: infer C }>
        ? PageMatches<
            C,
            JoinId<ParentId, K>,
            ParamCodecs & OwnParamCodecs<Ds[K]>,
            SearchCodecs & OwnSearchCodecs<Ds[K]>
          >
        : never);
}[keyof Ds & string];

/** No page matched. */
export type NotFoundMatch = Readonly<{ route: undefined; pathname: string }>;

/**
 * Where the location is: a union keyed by the dotted route id, so that a
 * `switch` on `route` narrows `params` and `search`.
 */
export type RouteMatch<R extends AnyRoutes> =
  | PageMatches<
      R[typeof routeTreeKey]['definition'],
      '',
      EmptyRecord,
      EmptyRecord
    >
  | NotFoundMatch;

// The matched branch

type BranchEntries<Ds, ParentId extends string> = {
  [K in keyof Ds & string]:
    | Readonly<{
        id: JoinId<ParentId, K>;
        meta: MetaOf<Ds[K]>;
        href: Ds[K] extends Readonly<{ page: false }>
          ? undefined
          : Href | undefined;
      }>
    | (Ds[K] extends Readonly<{ children: infer C }>
        ? BranchEntries<C, JoinId<ParentId, K>>
        : never);
}[keyof Ds & string];

/**
 * A node of the matched branch: its id, its `meta`, and the `Href` of its own
 * page with the match's params, or `undefined` for a `page: false` node and for
 * one whose own URL is another page (a branch the tree backtracked into).
 */
export type RouteBranchEntry<R extends AnyRoutes> = BranchEntries<
  R[typeof routeTreeKey]['definition'],
  ''
>;

/** The nodes from the top of the tree down to the matched page. */
export type RouteBranch<R extends AnyRoutes> = readonly RouteBranchEntry<R>[];

/** The ids of the pages in a route tree. */
export type RouteId<R extends AnyRoutes> = NonNullable<RouteMatch<R>['route']>;
