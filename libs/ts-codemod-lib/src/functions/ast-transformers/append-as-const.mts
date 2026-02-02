import { ISet } from 'ts-data-forge';
import * as tsm from 'ts-morph';
import {
  hasDisableNextLineComment,
  isAsConstNode,
} from '../functions/index.mjs';
import { type TsMorphTransformer } from './types.mjs';

const TRANSFORMER_NAME = 'append-as-const';

export const appendAsConstTransformer = (
  options?: AppendAsConstTransformerOptions,
): TsMorphTransformer => {
  const ignorePrefixes = ISet.create(
    options?.ignorePrefixes ?? ['mut_', '#mut_', '_mut_', 'draft'],
  );

  const optionsInternal: AppendAsConstTransformerOptionsInternal = {
    applyLevel: options?.applyLevel ?? 'avoidInFunctionArgs',
    ignoredPrefixes: ignorePrefixes,
  };

  const transformer: TsMorphTransformer = (sourceAst) => {
    for (const node of sourceAst.getChildren()) {
      transformNode(node, optionsInternal);
    }
  };

  // eslint-disable-next-line functional/immutable-data
  transformer.transformerName = TRANSFORMER_NAME;

  return transformer;
};

export type AppendAsConstTransformerOptions = DeepReadonly<{
  applyLevel?: 'all' | 'avoidInFunctionArgs';

  /**
   * A mute keywords to ignore the readonly conversion.
   *
   * (e.g. `"mut_"`)
   *
   * @default ['mut_', '#mut_', '_mut_', 'draft']
   */
  ignorePrefixes?: string[];

  ignoreConstTypeParameter?: boolean;
}>;

type AppendAsConstTransformerOptionsInternal = DeepReadonly<{
  applyLevel: 'all' | 'avoidInFunctionArgs';
  ignoredPrefixes: ISet<string>;
}>;

const transformNode = (
  node: tsm.Node,
  options: AppendAsConstTransformerOptionsInternal,
): void => {
  if (hasDisableNextLineComment(node, TRANSFORMER_NAME)) {
    console.debug('skipped by disable-next-line comment');

    return;
  }

  // check for ignorePrefix
  if (node.isKind(tsm.SyntaxKind.VariableDeclaration)) {
    const nodeName = node.getName();

    if (options.ignoredPrefixes.some((p) => nodeName.startsWith(p))) {
      // Skip conversion for variable declarations with ignored prefixes
      // Example: const mut_foo: string[] = []; -> remains as is, without appending `as const`
      console.debug('skipped variable declaration by ignorePrefixes');

      return;
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

  if (
    options.applyLevel === 'avoidInFunctionArgs' &&
    tsm.Node.isCallExpression(node)
  ) {
    return;
  }

  // `as const` node
  if (isAsConstNode(node)) {
    const expression = removeParenthesis(node.getExpression());

    if (
      !tsm.Node.isArrayLiteralExpression(expression) &&
      !tsm.Node.isObjectLiteralExpression(expression)
    ) {
      // `as const` is not needed for primitive types
      // Example: `0 as const` -> `0`
      node.replaceWithText(expression.getText());

      return;
    }

    // Avoid appending `as const` twice
    removeAsConstRecursively(node.getExpression());

    return;
  }

  if (tsm.Node.isArrayLiteralExpression(node)) {
    for (const el of node.getElements()) {
      removeAsConstRecursively(el);
    }

    node.replaceWithText(`${node.getText()} as const`);

    return;
  }

  if (tsm.Node.isObjectLiteralExpression(node)) {
    for (const el of node.getProperties()) {
      removeAsConstRecursively(el);
    }

    node.replaceWithText(`${node.getText()} as const`);

    return;
  }

  for (const child of node.getChildren()) {
    transformNode(child, options);
  }
};

const removeAsConstRecursively = (
  node: tsm.Node,
  insideSpreadWithConditional: boolean = false,
): void => {
  if (hasDisableNextLineComment(node)) {
    console.debug('skipped by disable-next-line comment');

    return;
  }

  if (isAsConstNode(node)) {
    // If we're inside a spread element with conditional, keep the `as const`
    if (insideSpreadWithConditional) {
      return;
    }

    // Extract node.expression to remove `as const` and recursively call the function
    // to remove `as const` from nested nodes
    // Example: `[[1,2] as const, [3,4]] as const` -> `[[1,2], [3,4]]`
    removeAsConstRecursively(node.getExpression(), insideSpreadWithConditional);

    node.replaceWithText(node.getExpression().getText());

    return;
  }

  // If we're inside a spread with conditional and encounter array/object literal without `as const`, add it
  if (insideSpreadWithConditional) {
    if (tsm.Node.isArrayLiteralExpression(node)) {
      // Don't add `as const` to empty arrays
      if (node.getElements().length === 0) {
        return;
      }

      // Add `as const` to the array itself, but don't recursively process elements
      // Elements will be processed normally by the outer transform
      node.replaceWithText(`${node.getText()} as const`);

      return;
    }

    if (tsm.Node.isObjectLiteralExpression(node)) {
      // Don't add `as const` to empty objects
      if (node.getProperties().length === 0) {
        return;
      }

      // Add `as const` to the object itself, but don't recursively process properties
      node.replaceWithText(`${node.getText()} as const`);

      return;
    }
  }

  // Mark that we're inside a spread element's expression only if it contains conditional
  // Example: `...(flag ? [1, 2] as const : [])` keeps inner `as const`
  // Example: `...[1, 2] as const` removes inner `as const`
  if (tsm.Node.isSpreadElement(node)) {
    const expression = node.getExpression();

    const hasConditional = containsConditionalExpression(expression);

    removeAsConstRecursively(expression, hasConditional);

    return;
  }

  for (const child of node.getChildren()) {
    removeAsConstRecursively(child, insideSpreadWithConditional);
  }
};

const containsConditionalExpression = (node: tsm.Node): boolean => {
  if (tsm.Node.isConditionalExpression(node)) {
    return true;
  }

  // Check children recursively, but stop at AsExpression boundaries
  if (isAsConstNode(node)) {
    return false;
  }

  return node.getChildren().some(containsConditionalExpression);
};

const removeParenthesis = (node: tsm.Node): tsm.Node =>
  tsm.Node.isParenthesizedExpression(node)
    ? removeParenthesis(node.getExpression())
    : node;
