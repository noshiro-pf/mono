import { Arr, hasKey, isNonNullObject, Optional } from 'ts-data-forge';
import type { FixedLengthTuple, ReadonlyRecord } from 'ts-type-forge';
import type { Href } from './href.mjs';
import {
  decodePathname,
  encodeSegment,
  isDevelopment,
  pick,
  routeNodeKey,
  routeTreeKey,
  toHref,
  valuesEqual,
  type ResolvedLocation,
  type RouteNodeInternals,
  type RouteTree,
} from './internal/index.mjs';
import type {
  AnyParamCodec,
  AnyRestParamCodec,
  AnyRoutes,
  AnySearchCodec,
  AnySegmentParamCodec,
  ReservedRouteKey,
  RouteDefinition,
  RouteDefinitions,
  RouteLocation,
  RouteMatch,
  Routes,
  ValidateRoutes,
} from './route-types.mjs';

/**
 * Builds the route tree. The application never writes a pattern string: each
 * node's path comes from its key (or `segment`), or from its one `params`
 * codec.
 *
 * Throws on a tree whose matching would depend on definition order: two dynamic
 * segments or two equal static segments at one path level, two pages on one
 * path, a reserved key, or a key with `.` or `/`.
 *
 * @example
 *
 * ```ts
 * const routes = defineRoutes({
 *   home: { segment: '' },
 *   products: {
 *     search: { page: search.int({ default: 1 }) },
 *     children: {
 *       item: { params: { productId: param.int } },
 *     },
 *   },
 * });
 *
 * assert.strictEqual(routes.products.item.pattern, '/products/:productId');
 *
 * assert.strictEqual(
 *   routes.products.item.href({ productId: asSafeInt(42) }),
 *   '/products/42/',
 * );
 *
 * assert.strictEqual(
 *   routes.products.href({ search: { page: asSafeInt(2) } }),
 *   '/products/?page=2',
 * );
 * ```
 */
export const defineRoutes = <const D extends RouteDefinitions>(
  definition: D & ValidateRoutes<D>,
): Routes<D> => {
  const root = compileChildren(definition, rootContext);

  const rootLevel = buildLevel(undefined, root, '/');

  const resolve = (location: RouteLocation): ResolvedLocation =>
    resolveLocation(rootLevel, location);

  const resolvePage = (segments: readonly string[]): string | undefined => {
    const found = findPage(rootLevel, segments);

    return Optional.isSome(found) ? found.value.page.id : undefined;
  };

  const tree: RouteTree<RouteDefinitions> = { definition, resolve } as const;

  const routes: AnyRoutes = {
    ...buildNodes(root, { tree, resolve, resolvePage }),
    [routeTreeKey]: tree,
  } as const;

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the runtime object mirrors the definition, which the type computes from
  return routes as Routes<D>;
};

/**
 * Resolves a location against the whole tree: the page it is, with its
 * parameters, or not found.
 *
 * @example
 *
 * ```ts
 * const routes = defineRoutes({
 *   users: { children: { item: { params: { userId: param.string } } } },
 * });
 *
 * const m = matchRoutes(routes, { pathname: '/users/alice/' });
 *
 * assert.isTrue(m.route === 'users.item' && m.params.userId === 'alice');
 *
 * assert.isUndefined(matchRoutes(routes, { pathname: '/teams/' }).route);
 * ```
 */
export const matchRoutes = <R extends AnyRoutes>(
  routes: R,
  location: RouteLocation,
): RouteMatch<R> => {
  const resolved = routes[routeTreeKey].resolve(location);

  const result =
    resolved.page === undefined
      ? ({ route: undefined, pathname: resolved.pathname } as const)
      : ({
          route: resolved.page,
          params: resolved.params,
          search: resolved.search,
        } as const);

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the resolver reads values with the codecs the type is computed from
  return result as RouteMatch<R>;
};

type Segment = Readonly<
  | { kind: 'dynamic'; name: string; codec: AnySegmentParamCodec }
  | { kind: 'rest'; name: string; codec: AnyRestParamCodec }
  | { kind: 'static'; value: string; encoded: string }
  | { kind: 'transparent' }
>;

type SearchEntries = readonly (readonly [string, AnySearchCodec])[];

/** What a node inherits from its ancestors. */
type Context = Readonly<{
  id: string;
  /** The segments of the ancestors and the node itself, from the top. */
  segments: readonly Segment[];
  /** The search codecs of the same, in declaration order. */
  search: SearchEntries;
}>;

/** A page, as the resolver needs it. */
type Page = Readonly<{ id: string; search: SearchEntries }>;

type CompiledNode = Context &
  Readonly<{
    key: string;
    meta: unknown;
    segment: Segment;
    page: Page | undefined;
    children: readonly CompiledNode[];
    /** The level after this node's segment; empty for `segment: ''`. */
    level: Level;
  }>;

/**
 * One path level: the nodes that consume the next segment, statics before the
 * one dynamic, and the one rest last, with `segment: ''` nodes looked through;
 * and the page that sits on this path itself.
 */
type Level = Readonly<{
  next: readonly CompiledNode[];
  page: Page | undefined;
}>;

type Resolvers = Readonly<{
  tree: RouteTree<RouteDefinitions>;
  /** Resolves a whole location, search included. */
  resolve: (location: RouteLocation) => ResolvedLocation;
  /** The page id the decoded path segments resolve to, for `href`'s check. */
  resolvePage: (segments: readonly string[]) => string | undefined;
}>;

type ParamEntry = readonly [string, unknown];

type Found = Readonly<{ page: Page; params: readonly ParamEntry[] }>;

const rootContext: Context = { id: '', segments: [], search: [] } as const;

const emptyLevel: Level = { next: [], page: undefined } as const;

const reservedKeys: ReadonlySet<string> = new Set<ReservedRouteKey>([
  'children',
  'href',
  'id',
  'match',
  'matchExact',
  'meta',
  'page',
  'params',
  'pattern',
  'search',
  'segment',
]);

// Compiling

/**
 * A static segment is one path segment that a URL parser keeps: no `/`, not `.`
 * or `..`, and well-formed Unicode so that it can be percent-encoded.
 */
const assertValidSegment = (segment: string, what: string): void => {
  if (
    segment === '.' ||
    segment === '..' ||
    segment.includes('/') ||
    !segment.isWellFormed()
  ) {
    throw new Error(
      `synstate-router: ${what} ("${segment}") cannot be a path segment`,
    );
  }
};

/** A key is a member name and a part of a dotted route id. */
const assertValidKey = (key: string, what: string): void => {
  if (key === '' || key.includes('.') || key.includes('/')) {
    throw new Error(
      `synstate-router: ${what} ("${key}") is empty or contains "." or "/"`,
    );
  }

  if (reservedKeys.has(key)) {
    throw new Error(`synstate-router: ${what} ("${key}") is reserved`);
  }
};

const isRestCodec = (codec: AnyParamCodec): codec is AnyRestParamCodec =>
  hasKey(codec, 'rest') && codec.rest;

const compileSegment = (
  id: string,
  key: string,
  definition: RouteDefinition,
): Segment => {
  if (definition.params !== undefined) {
    const entries = Object.entries(definition.params);

    const [first] = entries;

    if (first === undefined || !Arr.isFixedLengthArray(1, entries)) {
      throw new Error(`synstate-router: ${id}: params has exactly one key`);
    }

    if (definition.segment !== undefined) {
      throw new Error(
        `synstate-router: ${id}: a node with params has no segment`,
      );
    }

    const [name, codec] = first;

    if (!isRestCodec(codec)) {
      return { kind: 'dynamic', name, codec };
    }

    if (definition.children !== undefined) {
      throw new Error(
        `synstate-router: ${id}: a param.rest node ends its branch and has no children`,
      );
    }

    return { kind: 'rest', name, codec };
  }

  const value = definition.segment ?? key;

  if (value === '') {
    return { kind: 'transparent' };
  }

  assertValidSegment(value, `the segment of ${id}`);

  return { kind: 'static', value, encoded: encodeSegment(value) };
};

const compileSearch = (
  id: string,
  definition: RouteDefinition,
  inherited: SearchEntries,
): SearchEntries => {
  const own = Object.entries(definition.search ?? {});

  for (const [key] of own) {
    if (inherited.some(([inheritedKey]) => inheritedKey === key)) {
      throw new Error(
        `synstate-router: ${id}: the search key "${key}" is already declared by an ancestor`,
      );
    }
  }

  return [...inherited, ...own];
};

const patternOf = (segments: readonly Segment[]): string => {
  const parts = segments.flatMap((segment): readonly string[] => {
    switch (segment.kind) {
      case 'transparent':
        return [];

      case 'static':
        return [segment.value];

      case 'dynamic':
        return [`:${segment.name}`];

      case 'rest':
        return [`:${segment.name}*`];
    }
  });

  return Arr.isEmpty(parts) ? '/' : `/${parts.join('/')}`;
};

/** Sorts a level's nodes, looking through `segment: ''` nodes. */
const collectLevel = (
  nodes: readonly CompiledNode[],
): Readonly<{
  statics: readonly CompiledNode[];
  dynamics: readonly CompiledNode[];
  rests: readonly CompiledNode[];
  pages: readonly Page[];
}> => {
  const parts = nodes.map((node) => {
    switch (node.segment.kind) {
      case 'transparent': {
        const inner = collectLevel(node.children);

        return {
          ...inner,
          pages:
            node.page === undefined
              ? inner.pages
              : Arr.toUnshifted(node.page)(inner.pages),
        };
      }

      case 'static':
        return { statics: [node], dynamics: [], rests: [], pages: [] };

      case 'dynamic':
        return { statics: [], dynamics: [node], rests: [], pages: [] };

      case 'rest':
        return { statics: [], dynamics: [], rests: [node], pages: [] };
    }
  });

  return {
    statics: parts.flatMap((part) => part.statics),
    dynamics: parts.flatMap((part) => part.dynamics),
    rests: parts.flatMap((part) => part.rests),
    pages: parts.flatMap((part) => part.pages),
  };
};

const assertUniqueStatics = (
  statics: readonly CompiledNode[],
  path: string,
): void => {
  for (const [index, node] of statics.entries()) {
    if (node.segment.kind !== 'static') {
      continue;
    }

    const { value } = node.segment;

    const earlier = statics
      .slice(0, index)
      .find((n) => n.segment.kind === 'static' && n.segment.value === value);

    if (earlier !== undefined) {
      throw new Error(
        `synstate-router: ${earlier.id} and ${node.id} have the same segment "${value}" under ${path}`,
      );
    }
  }
};

/**
 * The level after `owner`, checked so that the order of definition cannot
 * change what matches.
 */
const buildLevel = (
  owner: Page | undefined,
  children: readonly CompiledNode[],
  path: string,
): Level => {
  const { statics, dynamics, rests, pages: inner } = collectLevel(children);

  const pages = owner === undefined ? inner : Arr.toUnshifted(owner)(inner);

  if (pages.length > 1) {
    throw new Error(
      `synstate-router: ${pages.map((p) => p.id).join(' and ')} are pages on the same path ${path}; make one of them page: false`,
    );
  }

  if (dynamics.length > 1) {
    throw new Error(
      `synstate-router: ${dynamics.map((n) => n.id).join(' and ')} are dynamic segments at the same level under ${path}`,
    );
  }

  if (rests.length > 1) {
    throw new Error(
      `synstate-router: ${rests.map((n) => n.id).join(' and ')} are rest segments at the same level under ${path}`,
    );
  }

  assertUniqueStatics(statics, path);

  return { next: [...statics, ...dynamics, ...rests], page: pages[0] };
};

const compileNode = (
  key: string,
  definition: RouteDefinition,
  parent: Context,
): CompiledNode => {
  const id = parent.id === '' ? key : (`${parent.id}.${key}` as const);

  assertValidKey(key, `the key of ${id}`);

  const segment = compileSegment(id, key, definition);

  const context: Context = {
    id,
    segments: Arr.toPushed(parent.segments, segment),
    search: compileSearch(id, definition, parent.search),
  } as const;

  const page: Page | undefined =
    definition.page === false
      ? undefined
      : ({ id, search: context.search } as const);

  const children = compileChildren(definition.children ?? {}, context);

  const level =
    segment.kind === 'transparent'
      ? emptyLevel
      : buildLevel(page, children, patternOf(context.segments));

  return {
    ...context,
    key,
    meta: definition.meta,
    segment,
    page,
    children,
    level,
  };
};

const compileChildren = (
  definitions: RouteDefinitions,
  parent: Context,
): readonly CompiledNode[] =>
  Object.entries(definitions).map(([key, definition]) =>
    compileNode(key, definition, parent),
  );

// Resolving

const resolveSegment = (
  node: CompiledNode,
  segment: string,
  params: readonly ParamEntry[],
): Optional<readonly ParamEntry[]> => {
  switch (node.segment.kind) {
    case 'static':
      return node.segment.value === segment
        ? Optional.some(params)
        : Optional.none;

    case 'dynamic': {
      const decoded = node.segment.codec.decode(segment);

      return Optional.isSome(decoded)
        ? Optional.some(
            Arr.toPushed(params, [node.segment.name, decoded.value]),
          )
        : Optional.none;
    }

    // The rest of the path, not one segment: `resolveLevel` reads it.
    case 'rest':
    case 'transparent':
      return Optional.none;
  }
};

/**
 * The page of a rest node, which takes every remaining segment: one or more,
 * and `None` when its codec refuses them.
 */
const resolveRest = (
  node: CompiledNode,
  segments: readonly string[],
  index: number,
  params: readonly ParamEntry[],
): Optional<Found> => {
  const rest = segments.slice(index);

  if (
    node.segment.kind !== 'rest' ||
    node.page === undefined ||
    !Arr.isNonEmptyTuple(rest)
  ) {
    return Optional.none;
  }

  const decoded = node.segment.codec.decode(rest);

  return Optional.isSome(decoded)
    ? Optional.some({
        page: node.page,
        params: Arr.toPushed(params, [node.segment.name, decoded.value]),
      })
    : Optional.none;
};

/**
 * Depth first, statics before the dynamic and the dynamic before the rest,
 * backtracking: when a static branch fails deeper down, the dynamic sibling is
 * tried, and then the rest.
 */
const resolveLevel = (
  level: Level,
  segments: readonly string[],
  index: number,
  params: readonly ParamEntry[],
): Optional<Found> => {
  const segment = segments[index];

  if (segment === undefined) {
    return level.page === undefined
      ? Optional.none
      : Optional.some({ page: level.page, params });
  }

  for (const node of level.next) {
    if (node.segment.kind === 'rest') {
      return resolveRest(node, segments, index, params);
    }

    const consumed = resolveSegment(node, segment, params);

    if (Optional.isNone(consumed)) {
      continue;
    }

    const found = resolveLevel(node.level, segments, index + 1, consumed.value);

    if (Optional.isSome(found)) {
      return found;
    }
  }

  return Optional.none;
};

/** What both matching and `href`'s check resolve decoded segments with. */
const findPage = (
  rootLevel: Level,
  segments: readonly string[],
): Optional<Found> => resolveLevel(rootLevel, segments, 0, []);

const readSearch = (
  page: Page,
  query: string,
): ReadonlyRecord<string, unknown> => {
  if (Arr.isEmpty(page.search)) {
    return {};
  }

  const searchParams = new URLSearchParams(query);

  return Object.fromEntries(
    page.search.map(([key, codec]) => {
      const result = codec.parse(searchParams.getAll(key));

      if (result.issue === 'async') {
        console.error(
          `synstate-router: ${page.id}: the schema of search "${key}" validated asynchronously; the value is read as absent`,
        );
      } else if (isDevelopment && result.issue === 'invalid') {
        console.warn(
          `synstate-router: ${page.id}: search "${key}" is not valid and is read as absent`,
        );
      }

      return [key, result.value];
    }),
  );
};

const resolveLocation = (
  rootLevel: Level,
  location: RouteLocation,
): ResolvedLocation => {
  const { pathname } = location;

  const segments = decodePathname(pathname);

  if (Optional.isNone(segments)) {
    return { page: undefined, pathname };
  }

  const found = findPage(rootLevel, segments.value);

  if (Optional.isNone(found)) {
    return { page: undefined, pathname };
  }

  const { page, params } = found.value;

  return {
    page: page.id,
    pathname,
    params: Object.fromEntries(params),
    search: readSearch(page, location.search ?? ''),
  };
};

// Building an Href

type HrefSegment = Readonly<{
  /** What matching sees after decoding. */
  raw: string;
  encoded: string;
}>;

const failHref = (node: CompiledNode, what: string, reason: string): never => {
  throw new Error(`synstate-router: ${node.id}.href: ${what} ${reason}`);
};

/** One segment of a param's value, checked to be one in the URL. */
const checkedSegment = (
  node: CompiledNode,
  name: string,
  raw: string,
): HrefSegment => {
  // An empty segment collapses into its neighbors (`//`, which a browser also
  // reads as the start of a host), and a URL parser removes a `.` or `..`
  // segment, encoded or not: either way the URL would lead somewhere else.
  if (raw === '' || raw === '.' || raw === '..') {
    failHref(node, `params.${name}`, `("${raw}") cannot be a path segment`);
  }

  if (!raw.isWellFormed()) {
    failHref(node, `params.${name}`, 'is not well-formed Unicode');
  }

  return { raw, encoded: encodeSegment(raw) };
};

/** The segments of the path to `node`, each checked to read back as itself. */
const buildSegments = (
  node: CompiledNode,
  params: ReadonlyRecord<string, unknown>,
): readonly HrefSegment[] =>
  node.segments.flatMap((segment): readonly HrefSegment[] => {
    switch (segment.kind) {
      case 'transparent':
        return [];

      case 'static':
        return [{ raw: segment.value, encoded: segment.encoded }];

      case 'dynamic': {
        const { name, codec } = segment;

        const value = params[name];

        // The type of `params` was checked against this codec.
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- see above
        const raw = codec.encode(value as never);

        if (Optional.isNone(codec.decode(raw))) {
          failHref(
            node,
            `params.${name}`,
            `(${raw}) is rejected by its own codec`,
          );
        }

        return [checkedSegment(node, name, raw)];
      }

      case 'rest': {
        const { name, codec } = segment;

        // The type of `params` was checked against this codec.
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- see above
        const raws: readonly string[] = codec.encode(params[name] as never);

        if (!Arr.isNonEmptyTuple(raws) || Optional.isNone(codec.decode(raws))) {
          failHref(
            node,
            `params.${name}`,
            `(${raws.join('/')}) is rejected by its own codec`,
          );
        }

        return raws.map((raw) => checkedSegment(node, name, raw));
      }
    }
  });

/**
 * The query entries of `values`, in declaration order, each checked to read
 * back as the value given; `where` names the caller in an error.
 */
const encodeSearch = (
  where: string,
  search: SearchEntries,
  values: ReadonlyRecord<string, unknown>,
): readonly FixedLengthTuple<2, string>[] =>
  search.flatMap(([key, codec]): readonly FixedLengthTuple<2, string>[] => {
    const value = values[key];

    if (value === undefined) {
      return [];
    }

    // The type of `search` was checked against this codec.
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- see above
    const raw = codec.encode(value as never);

    if (Arr.isEmpty(raw)) {
      return [];
    }

    // URLSearchParams would write a lone surrogate as U+FFFD.
    if (raw.some((r) => !r.isWellFormed())) {
      throw new Error(
        `synstate-router: ${where}: search.${key} is not well-formed Unicode`,
      );
    }

    const back = codec.parse(raw);

    if (back.issue !== undefined || !valuesEqual(back.value, value)) {
      throw new Error(
        `synstate-router: ${where}: search.${key} does not read back as the value given`,
      );
    }

    return raw.map((r) => [key, r] as const);
  });

const encodeHash = (node: CompiledNode, hash: string): string =>
  hash.isWellFormed()
    ? (`#${encodeSegment(hash)}` as const)
    : failHref(node, 'the hash', 'is not well-formed Unicode');

const toRecord = (value: unknown): ReadonlyRecord<string, unknown> =>
  isNonNullObject(value)
    ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- an object passed as params or options
      (value as ReadonlyRecord<string, unknown>)
    : ({} as const);

const makeHref = (
  node: CompiledNode,
  resolvePage: Resolvers['resolvePage'],
  params: ReadonlyRecord<string, unknown>,
  options: ReadonlyRecord<string, unknown>,
): Href => {
  const segments = buildSegments(node, params);

  // With a trailing slash; the router writes its own canonical form.
  const pathname =
    `/${segments.map(({ encoded }) => `${encoded}/`).join('')}` as const;

  const page = resolvePage(segments.map(({ raw }) => raw));

  if (page !== node.id) {
    throw new Error(
      `synstate-router: ${node.id}.href: ${pathname} resolves to ${page ?? 'no page'}, not to ${node.id}`,
    );
  }

  const searchParams = new URLSearchParams(
    encodeSearch(
      `${node.id}.href`,
      node.search,
      toRecord(options['search']),
    ).map(([key, value]) => [key, value]),
  );

  const query = searchParams.toString();

  const hash = options['hash'];

  const fragment =
    typeof hash === 'string' && hash !== '' ? encodeHash(node, hash) : '';

  return toHref(`${pathname}${query === '' ? '' : `?${query}`}${fragment}`);
};

// Nodes

const buildNodeApi = (
  node: CompiledNode,
  { tree, resolve, resolvePage }: Resolvers,
): ReadonlyRecord<string | symbol, unknown> => {
  const paramNames = Arr.generate(function* () {
    for (const segment of node.segments) {
      if (segment.kind === 'dynamic' || segment.kind === 'rest') {
        yield segment.name;
      }
    }
  });

  const searchKeys = node.search.map(([key]) => key);

  const valuesIf = (
    location: RouteLocation,
    accepts: (page: string) => boolean,
  ): Optional<unknown> => {
    const resolved = resolve(location);

    return resolved.page !== undefined && accepts(resolved.page)
      ? Optional.some({
          params: pick(resolved.params, paramNames),
          search: pick(resolved.search, searchKeys),
        })
      : Optional.none;
  };

  const internals: RouteNodeInternals = {
    tree,
    pageHref: (params) => {
      if (node.page === undefined) {
        return undefined;
      }

      const own = pick(params, paramNames);

      // The params were read by these codecs, so they write back; a codec whose
      // `encode` does not read back throws here as it does in `href`.
      const segments = buildSegments(node, own);

      return resolvePage(segments.map(({ raw }) => raw)) === node.id
        ? makeHref(node, resolvePage, own, {})
        : undefined;
    },
    paramNames,
    searchKeys,
    encodeSearch: (where, values) => encodeSearch(where, node.search, values),
  } as const;

  const common = {
    [routeNodeKey]: internals,
    id: node.id,
    pattern: patternOf(node.segments),
    meta: node.meta,
    search: Object.fromEntries(node.search),
    match: (location: RouteLocation) =>
      valuesIf(
        location,
        (page) => page === node.id || page.startsWith(`${node.id}.`),
      ),
  } as const;

  if (node.page === undefined) {
    return common;
  }

  return {
    ...common,
    matchExact: (location: RouteLocation) =>
      valuesIf(location, (page) => page === node.id),
    href: (...args: readonly unknown[]): Href =>
      Arr.isEmpty(paramNames)
        ? makeHref(node, resolvePage, {}, toRecord(args[0]))
        : makeHref(node, resolvePage, toRecord(args[0]), toRecord(args[1])),
  };
};

const buildNodes = (
  nodes: readonly CompiledNode[],
  resolvers: Resolvers,
): ReadonlyRecord<string, unknown> =>
  Object.fromEntries(
    nodes.map((node) => [
      node.key,
      {
        ...buildNodeApi(node, resolvers),
        ...buildNodes(node.children, resolvers),
      },
    ]),
  );
