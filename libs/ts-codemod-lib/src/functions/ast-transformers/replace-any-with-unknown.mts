import * as tsm from 'ts-morph';
import {
  hasDisableNextLineComment,
  isSpreadNamedTupleMemberNode,
  isSpreadParameterNode,
} from '../functions/index.mjs';
import { type TsMorphTransformer } from './types.mjs';

const TRANSFORMER_NAME = 'replace-any-with-unknown';

const createTransformNode = (): ((node: tsm.Node) => void) => {
  const transformNode = (node: tsm.Node): void => {
    if (hasDisableNextLineComment(node, TRANSFORMER_NAME)) {
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

  return transformNode;
};

export const replaceAnyWithUnknownTransformer = (): TsMorphTransformer => {
  const transformNode = createTransformNode();

  const transformer: TsMorphTransformer = (sourceAst) => {
    for (const node of sourceAst.getChildren()) {
      transformNode(node);
    }
  };

  // eslint-disable-next-line functional/immutable-data
  transformer.transformerName = TRANSFORMER_NAME;

  return transformer;
};
