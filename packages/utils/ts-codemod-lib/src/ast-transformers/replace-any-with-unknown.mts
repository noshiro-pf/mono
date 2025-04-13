import * as tsm from 'ts-morph';
import {
  hasDisableNextLineComment,
  isSpreadNamedTupleMemberNode,
  isSpreadParameterNode,
} from '../functions/index.mjs';
import { type TsMorphTransformer } from './types.mjs';

export const replaceAnyWithUnknownTransformer: TsMorphTransformer = (
  sourceAst,
) => {
  for (const node of sourceAst.getChildren()) {
    transformNode(node);
  }
};

const transformNode = (node: tsm.Node): void => {
  if (hasDisableNextLineComment(node)) {
    console.debug('skipped by disable-next-line comment');
    return;
  }

  if (node.isKind(tsm.SyntaxKind.AnyKeyword)) {
    const anyKeywordNode = node;

    const parent = anyKeywordNode.getParent();

    if (
      parent !== undefined &&
      // `(...args: any) => any` -> `(...args: unknown[]) => any`
      (isSpreadParameterNode(parent) ||
        // `[name: E0, ...args: any)]` -> `[name: E0, ...args: unknown[]]`
        isSpreadNamedTupleMemberNode(parent))
    ) {
      anyKeywordNode.replaceWithText('readonly unknown[]');
      return;
    }
    anyKeywordNode.replaceWithText('unknown');
    return;
  }

  for (const child of node.getChildren()) {
    transformNode(child);
  }
};
