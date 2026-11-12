import { Arr, hasKey, isNonNullObject, isRecord } from 'ts-data-forge';
import { routeNodeKey } from './internal/index.mjs';
import type { AnyRoutes } from './route-types.mjs';

/** A route node as `describeRoutes` lists it. */
export type RouteDescription = Readonly<{
  /** The dotted route id. */
  id: string;
  /** The path, `:name` for a dynamic segment and `:name*` for the rest. */
  pattern: string;
  /** The path parameters, the ancestors' included. */
  params: readonly string[];
  /** The search keys, the ancestors' included. */
  search: readonly string[];
  /** `false` for a `page: false` node. */
  page: boolean;
}>;

/**
 * Every node of the tree, each parent before its children, in definition order:
 * what a devtools panel shows to tell why a URL matched or did not.
 *
 * @example
 *
 * ```ts
 * const routes = defineRoutes({
 *   home: { segment: '' },
 *   users: { children: { item: { params: { userId: param.string } } } },
 * });
 *
 * assert.deepStrictEqual(
 *   describeRoutes(routes).map(({ id, pattern }) => `${id} ${pattern}`),
 *   ['home /', 'users /users', 'users.item /users/:userId'],
 * );
 * ```
 */
export const describeRoutes = (
  routes: AnyRoutes,
): readonly RouteDescription[] => describeChildren(routes);

const describeChildren = (parent: unknown): readonly RouteDescription[] =>
  isRecord(parent)
    ? Object.values(parent).flatMap(describeNode)
    : ([] as const);

const stringsOf = (value: unknown): readonly string[] =>
  Arr.isArray(value)
    ? value.filter((v): v is string => typeof v === 'string')
    : ([] as const);

const describeNode = (node: unknown): readonly RouteDescription[] => {
  if (!isRecord(node) || !hasKey(node, routeNodeKey)) {
    return [];
  }

  const internals: unknown = node[routeNodeKey];

  const id: unknown = Reflect.get(node, 'id');

  const pattern: unknown = Reflect.get(node, 'pattern');

  if (
    typeof id !== 'string' ||
    typeof pattern !== 'string' ||
    !isNonNullObject(internals)
  ) {
    return [];
  }

  return Arr.toUnshifted({
    id,
    pattern,
    params: stringsOf(Reflect.get(internals, 'paramNames')),
    search: stringsOf(Reflect.get(internals, 'searchKeys')),
    page: typeof Reflect.get(node, 'href') === 'function',
  })(describeChildren(node));
};
