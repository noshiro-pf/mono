import * as tsm from 'ts-morph';
import {
  hasDisableNextLineComment,
  isSpreadNamedTupleMemberNode,
  isSpreadParameterNode,
} from '../functions/index.mjs';
import { replaceNodeWithText } from '../utils/index.mjs';
import type { TsMorphTransformer } from './types.mjs';

const TRANSFORMER_NAME = 'replace-any-with-unknown';

export const replaceAnyWithUnknownTransformer = (): TsMorphTransformer =>
  ({
    name: TRANSFORMER_NAME,
    transform: (sourceAst) => {
      for (const node of sourceAst.getChildren()) {
        transformNode(node);
      }
    },
  }) as const;

/** `node` with the parentheses around it taken off. */
const withoutParentheses = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- a ts-morph node
  node: tsm.TypeNode,
): tsm.TypeNode =>
  node.isKind(tsm.SyntaxKind.ParenthesizedType)
    ? withoutParentheses(node.getTypeNode())
    : node;

/** Whether `node` is `keyof any`, its operand read through parentheses. */
const isKeyOfAny = (node: tsm.Node): node is tsm.TypeOperatorTypeNode =>
  node.isKind(tsm.SyntaxKind.TypeOperator) &&
  node.getOperator() === tsm.SyntaxKind.KeyOfKeyword &&
  withoutParentheses(node.getTypeNode()).isKind(tsm.SyntaxKind.AnyKeyword);

/**
 * Whether `sourceFile` declares or imports something named `name`, which a type
 * written by that name would then refer to.
 */
const bindsName = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- a ts-morph node
  sourceFile: tsm.SourceFile,
  name: string,
): boolean =>
  sourceFile
    .getDescendantsOfKind(tsm.SyntaxKind.Identifier)
    .some((identifier) => {
      if (identifier.getText() !== name) {
        return false;
      }

      const parent = identifier.getParent();

      return (
        parent.isKind(tsm.SyntaxKind.ImportSpecifier) ||
        parent.isKind(tsm.SyntaxKind.ImportClause) ||
        parent.isKind(tsm.SyntaxKind.NamespaceImport) ||
        (tsm.Node.hasName(parent) && parent.getNameNode() === identifier)
      );
    });

const transformNode = (node: tsm.Node): void => {
  if (hasDisableNextLineComment(node, TRANSFORMER_NAME)) {
    console.debug('skipped by disable-next-line comment');

    return;
  }

  // `keyof any`, any property key (`string | number | symbol`), would become
  // `keyof unknown`, which is `never`: it is written `PropertyKey`, the same
  // type, unless the file binds that name to something else. Taken at the
  // operator, so that nothing under the replaced node is visited after it.
  if (isKeyOfAny(node)) {
    if (!bindsName(node.getSourceFile(), 'PropertyKey')) {
      replaceNodeWithText(node, 'PropertyKey');
    }

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
      replaceNodeWithText(anyKeywordNode, 'readonly unknown[]');

      return;
    }

    replaceNodeWithText(anyKeywordNode, 'unknown');

    return;
  }

  for (const child of node.getChildren()) {
    transformNode(child);
  }
};
