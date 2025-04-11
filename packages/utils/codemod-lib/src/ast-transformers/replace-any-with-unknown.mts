/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import * as ts from 'typescript';
import {
  isSpreadNamedTupleMemberNode,
  isSpreadParameterNode,
} from '../functions/index.mjs';
import { createTransformerFactory, printNode } from '../utils/index.mjs';

export const replaceAnyWithUnknown: ts.TransformerFactory<ts.SourceFile> =
  createTransformerFactory((context) => {
    const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> =>
      transformNode(node, visitor, context);

    return visitor;
  });

type TransformNodeFn = <N extends ts.Node>(
  node: N,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
) => N;

/** Convert all nodes to readonly type (recursively) */
// eslint-disable-next-line total-functions/no-unsafe-type-assertion
const transformNode: TransformNodeFn = ((node, visitor, context) => {
  console.debug(
    `[${ts.SyntaxKind[node.kind]}]:\t`,
    printNode(node, node.getSourceFile()),
  );

  if (ts.isTypeNode(node) && node.kind === ts.SyntaxKind.AnyKeyword) {
    const parent = node.parent as ts.Node | undefined;

    if (
      parent !== undefined &&
      // `(...args: any) => any` -> `(...args: unknown[]) => any`
      (isSpreadParameterNode(parent) ||
        // `[name: E0, ...args: any)]` -> `[name: E0, ...args: any]`
        isSpreadNamedTupleMemberNode(parent))
    ) {
      return context.factory.createArrayTypeNode(
        context.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
      );
    }

    return context.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword);
  }

  return ts.visitEachChild(node, visitor, context);
}) as TransformNodeFn;
