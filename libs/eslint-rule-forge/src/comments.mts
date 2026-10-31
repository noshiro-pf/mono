import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import type { DeepReadonly } from 'ts-type-forge';

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

/**
 * Whether a comment inside `node` lies within one of `ranges`, which a fix
 * would delete along with it. Such a fix is dropped instead of the comment.
 * Only comments inside `node` are looked at, so each range has to lie within
 * it.
 */
export const hasCommentWithin = (
  sourceCode: TSESLint.SourceCode,
  node: TSESTree.Node,
  ranges: DeepReadonly<TSESTree.Range[]>,
): boolean =>
  sourceCode
    .getCommentsInside(node)
    .some((comment) =>
      ranges.some(
        ([start, end]) => start <= comment.range[0] && comment.range[1] <= end,
      ),
    );
