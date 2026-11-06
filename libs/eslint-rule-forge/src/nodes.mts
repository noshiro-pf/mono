import type { TSESTree } from '@typescript-eslint/utils';
import type { DeepReadonly } from 'ts-type-forge';

/**
 * `node` typed as the mutable node it is, for an ESLint or typescript-eslint
 * API — `context.report`, a fixer, the scope manager, the token store — that
 * declares a mutable parameter and only reads it. A rule that holds its nodes
 * as `DeepReadonly` passes them through this rather than a cast of its own: the
 * value is the parser's node, unchanged.
 */
export const asNode = <T extends TSESTree.Node>(node: DeepReadonly<T>): T =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the same node, its readonly view
  node as T;
