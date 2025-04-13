/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import * as ts from 'typescript';
import { hasDisableNextLineComment } from '../functions/index.mjs';
import { createTransformerFactory, printNode } from '../utils/index.mjs';

export const appendAsConstTransformer: ts.TransformerFactory<ts.SourceFile> =
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
  console.debug(`[${ts.SyntaxKind[node.kind]}]:\t`, printNode(node));

  if (hasDisableNextLineComment(node)) {
    console.debug('skipped by disable-next-line comment');
    return node;
  }

  if (ts.isAsExpression(node) && ts.isTypeReferenceNode(node.type)) {
    const typeName = node.type.typeName;
    if (
      typeName.kind === ts.SyntaxKind.Identifier &&
      typeName.text === 'const'
    ) {
      return node;
    }
  }

  if (ts.isArrayLiteralExpression(node) || ts.isObjectLiteralExpression(node)) {
    return context.factory.createAsExpression(
      node,
      context.factory.createTypeReferenceNode(
        context.factory.createIdentifier('const'),
        undefined,
      ),
    );
  }

  return ts.visitEachChild(node, visitor, context);
}) as TransformNodeFn;
