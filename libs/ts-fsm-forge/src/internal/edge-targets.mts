import { Arr, isString } from 'ts-data-forge';
import type { NonEmptyArray } from 'ts-type-forge';

/**
 * The state types an edge's target names, as a new, checked, frozen array
 * (never the one passed in, which is left as it was): the one state type, or the
 * array's members as written, a repeat included. So that `defineMachine` and
 * `toMermaid` reject a bad edge alike, it throws for an edge with no target —
 * an empty array, or `undefined`, which a `Partial` row allows as
 * `action: undefined` when `exactOptionalPropertyTypes` is off — and for a
 * target that is neither a string nor an array of strings (a sparse array's
 * hole included).
 *
 * These are what a graph assembled at run time can get wrong in a target
 * without its type saying so. Whether each target names a state of the graph,
 * and whether each edge has a handler, `defineMachine` checks itself; rows being
 * objects and handlers returning states are left to the types.
 */
export const edgeTargets = (
  from: string,
  actionType: string,
  target: unknown,
): NonEmptyArray<string> => {
  const edge = `the edge ${from} --${actionType}-->` as const;

  if (target === undefined) {
    throw new TypeError(`ts-fsm-forge: ${edge} has no target.`);
  }

  // A string, or anything else that is not an array, is one target; what is not
  // a string is refused just below.
  // Copied first: `Array.from` turns a hole of a sparse array into `undefined`,
  // which `every` would otherwise skip.
  const list: readonly unknown[] = Arr.isArray(target)
    ? Array.from(target)
    : ([target] as const);

  if (!list.every(isString)) {
    throw new TypeError(
      `ts-fsm-forge: ${edge} leads to something other than state types.`,
    );
  }

  if (!Arr.isNonEmpty(list)) {
    throw new TypeError(`ts-fsm-forge: ${edge} has no target.`);
  }

  Object.freeze(list);

  return list;
};
