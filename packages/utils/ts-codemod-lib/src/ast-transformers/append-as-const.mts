/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import * as ts from 'typescript';
import { hasDisableNextLineComment } from '../functions/index.mjs';
import { createTransformerFactory, printNode } from '../utils/index.mjs';

export const appendAsConstTransformer = (
  options?: AppendAsConstTransformerOptions,
): ts.TransformerFactory<ts.SourceFile> => {
  const ignorePrefixes = options?.ignorePrefixes ?? ['mut_'];

  const ignorePrefixChecker = (node: ts.Node | undefined): boolean =>
    node !== undefined &&
    ts.isIdentifier(node) &&
    ignorePrefixes.some((p) => node.text.startsWith(p));

  const optionsInternal: AppendAsConstTransformerOptionsInternal = {
    applyLevel: options?.applyLevel ?? 'avoidInFunctionArgs',
    ignorePrefixChecker,
  };

  return createTransformerFactory((context) => {
    const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> =>
      transformNode(node, visitor, context, optionsInternal);

    return visitor;
  });
};

export type AppendAsConstTransformerOptions = DeepReadonly<{
  applyLevel?: 'all' | 'avoidInFunctionArgs';

  /**
   * A mute keywords to ignore the readonly conversion.
   *
   * (e.g. `"mut_"`)
   */
  ignorePrefixes?: string[];
}>;

type AppendAsConstTransformerOptionsInternal = DeepReadonly<{
  applyLevel: 'all' | 'avoidInFunctionArgs';
  ignorePrefixChecker: undefined | ((node: ts.Node | undefined) => boolean);
}>;

type TransformNodeFn = <N extends ts.Node>(
  node: N,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  options: AppendAsConstTransformerOptionsInternal,
) => N;

/** Convert all nodes to readonly type (recursively) */
// eslint-disable-next-line total-functions/no-unsafe-type-assertion
const transformNode: TransformNodeFn = ((node, visitor, context, options) => {
  console.debug(`[${ts.SyntaxKind[node.kind]}]:\t`, printNode(node));

  if (hasDisableNextLineComment(node)) {
    console.debug('skipped by disable-next-line comment');
    return node;
  }

  // Avoid appending `as const` twice
  if (ts.isAsExpression(node) && ts.isTypeReferenceNode(node.type)) {
    const typeName = node.type.typeName;
    if (
      typeName.kind === ts.SyntaxKind.Identifier &&
      typeName.text === 'const'
    ) {
      return node;
    }
  }

  if (
    options.applyLevel === 'avoidInFunctionArgs' &&
    ts.isCallExpression(node)
  ) {
    return node;
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
