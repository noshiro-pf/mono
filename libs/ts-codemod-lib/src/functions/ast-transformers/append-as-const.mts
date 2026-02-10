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
            isUnderSpreadElement: false,
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
  isUnderConstContext: boolean;
  isDirectUnderConstInitializer: boolean;
  isUnderSpreadElement: boolean;
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
          isUnderSpreadElement: context.isUnderSpreadElement,
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

  if (
    node.isKind(tsm.SyntaxKind.NoSubstitutionTemplateLiteral) || // `abc`
    node.isKind(tsm.SyntaxKind.NumericLiteral) || // 123
    node.isKind(tsm.SyntaxKind.BigIntLiteral) || // 123n
    node.isKind(tsm.SyntaxKind.StringLiteral) || // 'abc'
    node.isKind(tsm.SyntaxKind.TrueKeyword) || // true
    node.isKind(tsm.SyntaxKind.FalseKeyword) // false
  ) {
    if (context.isDirectUnderConstInitializer || context.isUnderConstContext) {
      return;
    }

    options.replaceNode(node, `${node.getText()} as const`);

    return;
  }

  if (node.isKind(tsm.SyntaxKind.TemplateExpression)) {
    options.replaceNode(node, `${node.getText()} as const`);

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
          isUnderSpreadElement: context.isUnderSpreadElement,
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
          isUnderSpreadElement: context.isUnderSpreadElement,
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
        isUnderSpreadElement: context.isUnderSpreadElement,
      },
      options,
    );

    return;
  }

  if (tsm.Node.isAsExpression(node)) {
    return;
  }

  if (tsm.Node.isSpreadElement(node)) {
    transformNode(
      node.getExpression(),
      {
        isDirectUnderConstInitializer: false,
        isUnderConstContext: context.isUnderConstContext,
        isUnderSpreadElement: true,
      },
      options,
    );

    return;
  }

  if (tsm.Node.isConditionalExpression(node)) {
    if (context.isUnderSpreadElement) {
      // When under spread element, keep `as const` in both branches
      transformNode(
        node.getWhenTrue(),
        {
          isDirectUnderConstInitializer: false,
          isUnderConstContext: false,
          isUnderSpreadElement: false,
        },
        options,
      );

      transformNode(
        node.getWhenFalse(),
        {
          isDirectUnderConstInitializer: false,
          isUnderConstContext: false,
          isUnderSpreadElement: false,
        },
        options,
      );
    }

    return;
  }

  if (tsm.Node.isParenthesizedExpression(node)) {
    transformNode(node.getExpression(), context, options);

    return;
  }

  if (tsm.Node.isSatisfiesExpression(node)) {
    transformNode(node.getExpression(), context, options);

    return;
  }

  if (tsm.Node.isPropertyAssignment(node)) {
    const initializer = node.getInitializer();

    if (initializer !== undefined) {
      transformNode(initializer, context, options);
    }

    return;
  }

  if (tsm.Node.isArrowFunction(node)) {
    const body = node.getBody();

    transformNode(body, context, options);

    return;
  }

  if (tsm.Node.isArrayLiteralExpression(node)) {
    for (const el of node.getElements()) {
      transformNode(
        el,
        {
          isUnderConstContext: true, // [...] as const
          isDirectUnderConstInitializer: false,
          isUnderSpreadElement: context.isUnderSpreadElement,
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
          isUnderSpreadElement: context.isUnderSpreadElement,
        },
        options,
      );
    }

    if (!context.isUnderConstContext) {
      options.replaceNode(node, `${node.getText()} as const`);
    }

    // return;
  }

  // for (const child of node.getChildren()) {
  //   transformNode(
  //     child,
  //     {
  //       isDirectUnderConstInitializer: false,
  //       isUnderConstContext: context.isUnderConstContext,
  //       isUnderSpreadElement: context.isUnderSpreadElement,
  //     },
  //     options,
  //   );
  // }
};
