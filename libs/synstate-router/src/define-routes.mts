import { Arr } from 'ts-data-forge';
import { queryParamSerializers, withKey } from './query-param-serializer.mjs';
import {
  type DefineRoutesOutput,
  type RouteNodeInput,
  type RoutesDefInput,
} from './route-types.mjs';

// --- param helpers (public API) ---

const pathString = 'path.string';

export const param = {
  path: {
    string: pathString,
    branded: <T extends string>(_brand: T): typeof pathString => pathString,
  },
  query: {
    string: queryParamSerializers.string,
    number: queryParamSerializers.number,
    boolean: queryParamSerializers.boolean,
    stringArray: queryParamSerializers.stringArray,
    branded: <T,>(_brand: T) => queryParamSerializers.string(),
    brandedArray: <T,>(_brand: T) => queryParamSerializers.stringArray(),
  },
} as const;

// Route definition types are in route-types.mts

// --- Internal segment representation ---

type Segment = Readonly<
  { type: 'static'; value: string } | { type: 'dynamic'; paramName: string }
>;

const buildSegments = (
  key: string,
  def: RouteNodeInput,
): readonly Segment[] => {
  if (def.params !== undefined) {
    return Object.keys(def.params).map(
      (name): Segment => ({ type: 'dynamic', paramName: name }),
    );
  }

  const segmentName = def.segment ?? key;

  // Empty segment (e.g. home: { segment: '' }) produces no segments,
  // matching the root path '/'.
  if (segmentName === '') return [];

  return [{ type: 'static', value: segmentName }];
};

const buildPattern = (segments: readonly Segment[]): string =>
  `/${segments.map((s) => (s.type === 'static' ? s.value : `:${s.paramName}`)).join('/')}` as const;

const buildPath = (
  segments: readonly Segment[],
  params: Readonly<Record<string, string>>,
): string =>
  `/${segments.map((s) => (s.type === 'static' ? s.value : (params[s.paramName] ?? ''))).join('/')}` as const;

const tryMatchSegments = (
  routeSegments: readonly Segment[],
  pathSegments: readonly string[],
): Readonly<Record<string, string>> | undefined => {
  const mut_params: Record<string, string> = {};

  for (const [i, routeSeg] of Arr.entries(routeSegments)) {
    const pathSeg = pathSegments[i];

    if (pathSeg === undefined) return undefined;

    if (routeSeg.type === 'static') {
      if (routeSeg.value !== pathSeg) return undefined;
    } else {
      mut_params[routeSeg.paramName] = pathSeg;
    }
  }

  return mut_params;
};

// --- Route node builder ---

const createRouteNode = (
  parentSegments: readonly Segment[],
  key: string,
  def: RouteNodeInput,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any => {
  const ownSegments = buildSegments(key, def);

  const allSegments: readonly Segment[] = [
    ...parentSegments,
    ...ownSegments,
  ] as const;

  const pattern = buildPattern(allSegments);

  const pathFn = (params?: Readonly<Record<string, string>>): string =>
    buildPath(allSegments, params ?? {});

  const matchExactFn = (
    pathSegments: readonly string[],
  ): Readonly<Record<string, string>> | undefined => {
    if (pathSegments.length !== allSegments.length) return undefined;

    return tryMatchSegments(allSegments, pathSegments);
  };

  const matchFn = (
    pathSegments: readonly string[],
  ): Readonly<Record<string, string>> | undefined => {
    if (pathSegments.length < allSegments.length) return undefined;

    return tryMatchSegments(allSegments, pathSegments);
  };

  const mut_node: Record<string, unknown> = {
    _params: {}, // phantom — only used at type level
    pattern,
    path: pathFn,
    match: matchFn,
    matchExact: matchExactFn,
  };

  if (def.children !== undefined) {
    for (const [childKey, childDef] of Object.entries(def.children)) {
      mut_node[childKey] = createRouteNode(allSegments, childKey, childDef);
    }
  }

  if (def.queryParams !== undefined) {
    const mut_keyed: Record<string, unknown> = {};

    for (const [qpKey, qpDef] of Object.entries(def.queryParams)) {
      mut_keyed[qpKey] = withKey(qpKey, qpDef);
    }

    mut_node['queryParams'] = mut_keyed;
  }

  return mut_node;
};

// --- defineRoutes (public API) ---

export const defineRoutes = <const D extends RoutesDefInput>(
  def: D,
): DefineRoutesOutput<D> => {
  const mut_result: Record<string, unknown> = {};

  for (const [key, nodeDef] of Object.entries(def)) {
    mut_result[key] = createRouteNode([], key, nodeDef);
  }

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return mut_result as DefineRoutesOutput<D>;
};
