import { ISet } from '@noshiro/ts-utils';
import * as tsm from 'ts-morph';
import {
  hasDisableNextLineComment,
  isAsConstNode,
} from '../functions/index.mjs';
import { type TsMorphTransformer } from './types.mjs';

export const appendAsConstTransformer =
  (options?: AppendAsConstTransformerOptions): TsMorphTransformer =>
  (sourceAst) => {
    const ignorePrefixes = ISet.new(options?.ignorePrefixes ?? ['mut_']);

    const optionsInternal: AppendAsConstTransformerOptionsInternal = {
      applyLevel: options?.applyLevel ?? 'avoidInFunctionArgs',
      ignoredPrefixes: ignorePrefixes,
    };

    for (const node of sourceAst.getChildren()) {
      transformNode(node, optionsInternal);
    }
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

const transformNode = (
  node: tsm.Node,
  options: AppendAsConstTransformerOptionsInternal,
): void => {
  if (hasDisableNextLineComment(node)) {
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

const removeAsConstRecursively = (node: tsm.Node): void => {
  if (hasDisableNextLineComment(node)) {
    console.debug('skipped by disable-next-line comment');
    return;
  }

  if (isAsConstNode(node)) {
    // Extract node.expression to remove `as const` and recursively call the function
    // to remove `as const` from nested nodes
    // Example: `[[1,2] as const, [3,4]] as const` -> `[[1,2], [3,4]]`
    removeAsConstRecursively(node.getExpression());
    node.replaceWithText(node.getExpression().getText());
    return;
  }

  for (const child of node.getChildren()) {
    removeAsConstRecursively(child);
  }
};

const removeParenthesis = (node: tsm.Node): tsm.Node =>
  tsm.Node.isParenthesizedExpression(node)
    ? removeParenthesis(node.getExpression())
    : node;
