/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import { expectType, ISet } from '@noshiro/ts-utils';
import * as ts from 'typescript';
import {
  hasDisableNextLineComment,
  isAsConstNode,
} from '../functions/index.mjs';
import { createTransformerFactory, printNode } from '../utils/index.mjs';
import { debugPrintWrapper } from './test-utils.mjs';

export const appendAsConstTransformer = (
  options?: AppendAsConstTransformerOptions,
): ts.TransformerFactory<ts.SourceFile> => {
  const ignorePrefixes = ISet.new(options?.ignorePrefixes ?? ['mut_']);

  const optionsInternal: AppendAsConstTransformerOptionsInternal = {
    applyLevel: options?.applyLevel ?? 'avoidInFunctionArgs',
    ignoredPrefixes: ignorePrefixes,
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

  ignoreConstTypeParameter?: boolean;
}>;

type AppendAsConstTransformerOptionsInternal = DeepReadonly<{
  applyLevel: 'all' | 'avoidInFunctionArgs';
  ignoredPrefixes: ISet<string>;
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

  // check for ignorePrefix
  if (ts.isVariableDeclaration(node)) {
    const nodeName = node.name;

    expectType<typeof nodeName, ts.BindingName>('=');

    expectType<
      ts.BindingName,
      ts.Identifier | ts.ArrayBindingPattern | ts.ObjectBindingPattern
    >('=');

    if (
      ts.isIdentifier(nodeName) &&
      options.ignoredPrefixes.some((p) => nodeName.text.startsWith(p))
    ) {
      // Skip readonly conversion for variable declarations with ignored prefixes
      // Example: const mut_foo: string[] = []; -> remains as is, without readonly conversion
      return node;
    }

    // TODO: Support ignoredPrefixes in ArrayBindingPattern
    // if (ts.isArrayBindingPattern(nodeName)) {
    //   // for (const [i, el] of nodeName.elements.entries())
    // }

    // TODO: Support ignoredPrefixes in ObjectBindingPattern
    // if (ts.isObjectBindingPattern(nodeName)) {
    //   // for (const [i, el] of nodeName.elements.entries())
    // }
  }

  if (ts.isClassElement(node) || ts.isTypeElement(node)) {
    const mbName = node.name satisfies ts.PropertyName | undefined;

    expectType<
      ts.PropertyName,
      | ts.Identifier // mut_x: number[]
      | ts.StringLiteral // "mut_x": number[]
      | ts.NumericLiteral // skip
      | ts.BigIntLiteral // skip
      | ts.PrivateIdentifier // #memberName: number[]
      | ts.ComputedPropertyName // [`mut_x`]: number[]
      | ts.NoSubstitutionTemplateLiteral // invalid syntax
    >('=');

    if (
      mbName !== undefined &&
      (ts.isIdentifier(mbName) || ts.isStringLiteral(mbName)) &&
      options.ignoredPrefixes.some((p) => mbName.text.startsWith(p))
    ) {
      return node;
    }

    if (
      mbName !== undefined &&
      ts.isPrivateIdentifier(mbName) &&
      options.ignoredPrefixes.some((p) => mbName.text.startsWith(`#${p}`))
    ) {
      return node;
    }

    if (mbName !== undefined && ts.isComputedPropertyName(mbName)) {
      const child = mbName.expression;
      if (ts.isStringLiteralLike(child)) {
        options.ignoredPrefixes.some((p) => child.text.startsWith(p));
      }
      return node;
    }
  }

  if (
    options.applyLevel === 'avoidInFunctionArgs' &&
    ts.isCallExpression(node)
  ) {
    return node;
  }

  // `as const` node
  if (isAsConstNode(node)) {
    const expression_ = removeParenthesis(node.expression);

    if (
      !ts.isArrayLiteralExpression(expression_) &&
      !ts.isObjectLiteralExpression(expression_)
    ) {
      // `as const` is not needed for primitive types
      // Example: `0 as const` -> `0`
      return node.expression;
    }

    // Avoid appending `as const` twice
    return debugPrintWrapper(
      "removing 'as const'",
      node,
      context.factory.updateAsExpression(
        node,
        removeAsConstRecursively(node.expression, context),
        node.type,
      ),
      0,
    );
  }

  if (ts.isArrayLiteralExpression(node) || ts.isObjectLiteralExpression(node)) {
    return debugPrintWrapper(
      "append 'as const'",
      node,
      context.factory.createAsExpression(
        removeAsConstRecursively(node, context),
        context.factory.createTypeReferenceNode(
          context.factory.createIdentifier('const'),
          undefined,
        ),
      ),
      0,
    );
  }

  return ts.visitEachChild(node, visitor, context);
}) as TransformNodeFn;

const removeAsConstRecursively = (
  node: ts.Expression,
  context: ts.TransformationContext,
): ts.Expression => {
  if (hasDisableNextLineComment(node)) {
    console.debug('skipped by disable-next-line comment');
    return node;
  }

  if (isAsConstNode(node)) {
    // Extract node.expression to remove `as const` and recursively call the function
    // to remove `as const` from nested nodes
    // Example: `[[1,2] as const, [3,4]] as const` -> `[[1,2], [3,4]]`
    return removeAsConstRecursively(node.expression, context);
  }

  if (ts.isParenthesizedExpression(node)) {
    return context.factory.updateParenthesizedExpression(
      node,
      removeAsConstRecursively(node.expression, context),
    );
  }

  if (ts.isArrayLiteralExpression(node)) {
    return context.factory.updateArrayLiteralExpression(
      node,
      node.elements.map((el) => removeAsConstRecursively(el, context)),
    );
  }

  if (ts.isObjectLiteralExpression(node)) {
    return context.factory.updateObjectLiteralExpression(
      node,
      node.properties.map((p) =>
        ts.isPropertyAssignment(p)
          ? context.factory.updatePropertyAssignment(
              p,
              p.name,
              removeAsConstRecursively(p.initializer, context),
            )
          : p,
      ),
    );
  }

  return node;
};

const removeParenthesis = (node: ts.Node): ts.Node =>
  ts.isParenthesizedExpression(node)
    ? removeParenthesis(node.expression)
    : node;
