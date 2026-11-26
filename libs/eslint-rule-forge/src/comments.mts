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

/**
 * Whether a comment inside `node` lies within none of `keptRanges`, the ranges
 * a fix replacing `node` copies verbatim. Such a comment would be dropped with
 * the rest of `node`, so the fix is offered as a suggestion instead. Only
 * comments inside `node` are looked at.
 */
export const hasCommentOutside = (
  sourceCode: TSESLint.SourceCode,
  node: TSESTree.Node,
  keptRanges: DeepReadonly<TSESTree.Range[]>,
): boolean =>
  sourceCode
    .getCommentsInside(node)
    .some((comment) =>
      keptRanges.every(
        ([start, end]) =>
          !(start <= comment.range[0] && comment.range[1] <= end),
      ),
    );
