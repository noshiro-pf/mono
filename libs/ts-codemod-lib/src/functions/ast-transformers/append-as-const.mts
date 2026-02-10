import { Arr, ISet } from 'ts-data-forge';
import * as tsm from 'ts-morph';
import {
  hasDisableNextLineComment,
  isAsConstNode,
} from '../functions/index.mjs';
import { replaceNodeWithDebugPrint } from '../utils/index.mjs';
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

    debugPrint: options?.debug === true ? console.debug : () => {},
    replaceNode:
      options?.debug === true
        ? replaceNodeWithDebugPrint
        : (node, newNodeText) => node.replaceWithText(newNodeText),
  } as const;

  return {
    name: TRANSFORMER_NAME,
    transform: (sourceAst) => {
      for (const node of sourceAst.getDescendantsOfKind(
        tsm.SyntaxKind.VariableDeclaration,
      )) {
        transformNode(
          node,
          {
            isUnderConstContext: false,
            isDirectUnderConstInitializer: false,
          },
          optionsInternal,
        );
      }
    },
  };
};

export type AppendAsConstTransformerOptions = DeepReadonly<{
  /**
   * @default "avoidInFunctionArgs"
   */
  applyLevel?: 'all' | 'avoidInFunctionArgs';

  /**
   * A mute keywords to ignore the readonly conversion.
   *
   * (e.g. `"mut_"`)
   *
   * @default ['mut_', '#mut_', '_mut_', 'draft']
   */
  ignorePrefixes?: string[];

  // TODO
  // ignoreConstTypeParameter?: boolean;

  debug?: boolean;
}>;

type AppendAsConstTransformerOptionsInternal = DeepReadonly<{
  applyLevel: 'all' | 'avoidInFunctionArgs';
  ignoredPrefixes: ISet<string>;

  debugPrint: (...args: readonly unknown[]) => void;
  replaceNode: (node: tsm.Node, newNodeText: string) => void;
}>;

type AsConstContext = Readonly<{
  /**
   * Whether the current node is under an `as const` context.
   *
   * (e.g. `[1, 2, {x: 3}] as const`  --> `isUnderConstContext` is true for `[1, 2, {x: 3}]` and its children `{x: 3}`)
   */
  isUnderConstContext: boolean;

  /**
   * Whether the current node is directly under a `const` variable initializer.
   *
   * (e.g. `const foo = [1, 2, 3];`  --> `isDirectUnderConstInitializer` is true for `[1, 2, 3]`)
   */
  isDirectUnderConstInitializer: boolean;
}>;

const transformNode = (
  node: tsm.Node,
  context: AsConstContext,
  options: AppendAsConstTransformerOptionsInternal,
): void => {
  if (node.wasForgotten()) {
    return;
  }

  options.debugPrint(node.getKindName(), node.getText(), { context });

  if (hasDisableNextLineComment(node, TRANSFORMER_NAME)) {
    options.debugPrint('skipped by disable-next-line comment');

    return;
  }

  if (
    options.applyLevel === 'avoidInFunctionArgs' &&
    tsm.Node.isCallExpression(node)
  ) {
    return;
  }

  if (node.isKind(tsm.SyntaxKind.VariableDeclaration)) {
    const nodeName = node.getName();

    // check for ignorePrefix
    if (options.ignoredPrefixes.some((p) => nodeName.startsWith(p))) {
      // Skip conversion for variable declarations with ignored prefixes
      // Example: const mut_foo: string[] = []; -> remains as is, without appending `as const`
      options.debugPrint('skipped variable declaration by ignorePrefixes');

      return;
    }

    const variableStatement = node.getVariableStatement();

    if (
      variableStatement !== undefined &&
      hasDisableNextLineComment(variableStatement, TRANSFORMER_NAME)
    ) {
      return;
    }

    const initializer = node.getInitializer();

    if (initializer === undefined) {
      return;
    }

    const declarationKindKeywords = node
      .getVariableStatement()
      ?.getDeclarationKindKeywords()
      .map((k) => k.getText());

    if (
      declarationKindKeywords !== undefined &&
      Arr.isArrayOfLength(declarationKindKeywords, 1)
    ) {
      transformNode(
        initializer,
        {
          isDirectUnderConstInitializer: declarationKindKeywords[0] === 'const',
          isUnderConstContext: false,
        },
        options,
      );

      return;
    }

    // const [a, b] = ...;
    // TODO: Support ignoredPrefixes in ArrayBindingPattern
    // if (ts.isArrayBindingPattern(nodeName)) {
    //   // for (const [i, el] of nodeName.elements.entries())
    // }

    // const { x, y } = ...;
    // TODO: Support ignoredPrefixes in ObjectBindingPattern
    // if (ts.isObjectBindingPattern(nodeName)) {
    //   // for (const [i, el] of nodeName.elements.entries())
    // }
  }

  // Skip already type asserted nodes
  if (tsm.Node.isAsExpression(node) && !isAsConstNode(node)) {
    return;
  }

  // pass by ([(X)] -> X)
  if (tsm.Node.isParenthesizedExpression(node)) {
    transformNode(node.getExpression(), context, options);

    return;
  }

  // pass by ([X satisfies ...] -> X)
  if (tsm.Node.isSatisfiesExpression(node)) {
    transformNode(node.getExpression(), context, options);

    return;
  }

  // pass by property initializer ([key: value] -> value)
  if (tsm.Node.isPropertyAssignment(node)) {
    const initializer = node.getInitializer();

    if (initializer !== undefined) {
      transformNode(initializer, context, options);
    }

    return;
  }

  // pass by arrow function body ([() => X] -> X)
  if (tsm.Node.isArrowFunction(node)) {
    const body = node.getBody();

    transformNode(body, context, options);

    return;
  }

  // pass by spread element ([...X] -> X)
  if (tsm.Node.isSpreadElement(node)) {
    transformNode(node.getExpression(), context, options);

    return;
  }

  if (
    node.isKind(tsm.SyntaxKind.NoSubstitutionTemplateLiteral) || // `abc`
    node.isKind(tsm.SyntaxKind.NumericLiteral) || // 123
    node.isKind(tsm.SyntaxKind.BigIntLiteral) || // 123n
    node.isKind(tsm.SyntaxKind.StringLiteral) || // 'abc'
    node.isKind(tsm.SyntaxKind.TrueKeyword) || // true
    node.isKind(tsm.SyntaxKind.FalseKeyword) // false
  ) {
    if (
      !context.isDirectUnderConstInitializer &&
      !context.isUnderConstContext
    ) {
      options.replaceNode(node, `${node.getText()} as const`);
    }

    return;
  }

  if (node.isKind(tsm.SyntaxKind.TemplateExpression)) {
    if (!context.isUnderConstContext) {
      options.replaceNode(node, `${node.getText()} as const`);
    }

    return;
  }

  if (tsm.Node.isArrayLiteralExpression(node)) {
    for (const el of node.getElements()) {
      transformNode(
        el,
        {
          isUnderConstContext: true, // [...] as const
          isDirectUnderConstInitializer: false,
        },
        options,
      );
    }

    if (!context.isUnderConstContext) {
      options.replaceNode(node, `${node.getText()} as const`);
    }

    return;
  }

  if (tsm.Node.isObjectLiteralExpression(node)) {
    for (const el of node.getProperties()) {
      transformNode(
        el,
        {
          isUnderConstContext: true, // {...} as const
          isDirectUnderConstInitializer: false,
        },
        options,
      );
    }

    if (!context.isUnderConstContext) {
      options.replaceNode(node, `${node.getText()} as const`);
    }

    return;
  }

  // `as const` node
  if (isAsConstNode(node)) {
    if (context.isDirectUnderConstInitializer) {
      // In const variable declarations, remove `as const` first and then re-append it later if needed

      transformNode(
        node.getExpression(),
        {
          isUnderConstContext: false,
          isDirectUnderConstInitializer: true,
        },
        options,
      );

      options.replaceNode(
        node,
        // The expression may be marked "as const"
        node.getExpression().getText(),
      ); // remove `as const`

      return;
    }

    if (context.isUnderConstContext) {
      transformNode(
        node.getExpression(),
        {
          isUnderConstContext: true,
          isDirectUnderConstInitializer: false,
        },
        options,
      );

      options.replaceNode(
        node,
        // The expression may be marked "as const"
        node.getExpression().getText(),
      ); // remove `as const`

      return;
    }

    transformNode(
      node.getExpression(),
      {
        isUnderConstContext: true,
        isDirectUnderConstInitializer: false,
      },
      options,
    );

    return;
  }

  if (tsm.Node.isConditionalExpression(node)) {
    // For conditional expressions, traverse both branches in a non-const context
    transformNode(
      node.getWhenTrue(),
      {
        isDirectUnderConstInitializer: context.isDirectUnderConstInitializer,
        isUnderConstContext: false,
      },
      options,
    );

    transformNode(
      node.getWhenFalse(),
      {
        isDirectUnderConstInitializer: context.isDirectUnderConstInitializer,
        isUnderConstContext: false,
      },
      options,
    );

    // return;
  }
};
