import { Arr, expectType, ISet, pipe } from 'ts-data-forge';
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
  };

  const transformer: TsMorphTransformer = (sourceAst) => {
    for (const node of sourceAst.getChildren()) {
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
  options.debugPrint(node.getKindName(), node.getText());

  if (
    node.isKind(tsm.SyntaxKind.LiteralType) ||
    node.isKind(tsm.SyntaxKind.TypeLiteral) ||
    node.isKind(tsm.SyntaxKind.TypeReference) ||
    node.isKind(tsm.SyntaxKind.UnionType) ||
    node.isKind(tsm.SyntaxKind.TypeAliasDeclaration) ||
    node.isKind(tsm.SyntaxKind.ImportDeclaration) ||
    isDirective(node)
  ) {
    return; // skip type annotations, import declarations, and directives
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

  if (node.isKind(tsm.SyntaxKind.VariableDeclaration)) {
    const nodeName = node.getName();

    // check for ignorePrefix
    if (options.ignoredPrefixes.some((p) => nodeName.startsWith(p))) {
      // Skip conversion for variable declarations with ignored prefixes
      // Example: const mut_foo: string[] = []; -> remains as is, without appending `as const`
      options.debugPrint('skipped variable declaration by ignorePrefixes');

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

    return;
  }

  if (node.isKind(tsm.SyntaxKind.ClassDeclaration)) {
    // Skip conversion for class declarations with ignored prefixes
    // Example: class mut_Class {...} -> properties remain without readonly
    if (
      options.ignoredPrefixes.some(
        (p) => node.getName()?.startsWith(p) === true,
      )
    ) {
      return;
    }

    transformClassDeclarationNode(node, context, options);

    return;
  }

  for (const child of node.getChildren()) {
    transformNode(
      child,
      {
        isDirectUnderConstInitializer: false,
        isUnderConstContext: context.isUnderConstContext,
        isUnderSpreadElement: context.isUnderSpreadElement,
      },
      options,
    );
  }
};

const transformClassDeclarationNode = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: tsm.ClassDeclaration,
  context: AsConstContext,
  options: AppendAsConstTransformerOptionsInternal,
): void => {
  for (const mb of node.getMembers()) {
    if (hasDisableNextLineComment(mb)) {
      options.debugPrint('skipped member by disable-next-line comment');

      continue;
    }

    if (mb.isKind(tsm.SyntaxKind.PropertyDeclaration)) {
      if (!checkIfPropertyNameShouldBeIgnored(mb.getNameNode(), options)) {
        const type = mb.getTypeNode();

        if (type !== undefined) {
          transformNode(
            type,
            {
              isDirectUnderConstInitializer: false,
              isUnderConstContext: false,
              isUnderSpreadElement: context.isUnderSpreadElement,
            },
            options,
          );
        }

        const initializer = mb.getInitializer();

        if (initializer !== undefined) {
          transformNode(
            initializer,
            {
              isDirectUnderConstInitializer: false,
              isUnderConstContext: false,
              isUnderSpreadElement: context.isUnderSpreadElement,
            },
            options,
          );
        }
      }

      continue;
    }

    transformNode(
      mb,
      {
        isDirectUnderConstInitializer: false,
        isUnderConstContext: false,
        isUnderSpreadElement: context.isUnderSpreadElement,
      },
      options,
    );
  }
};

const checkIfPropertyNameShouldBeIgnored = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  nameNode: tsm.PropertyName,
  options: AppendAsConstTransformerOptionsInternal,
): boolean => {
  expectType<typeof nameNode, tsm.PropertyName>('=');

  expectType<
    tsm.PropertyName,
    | tsm.NumericLiteral // skip
    | tsm.BigIntLiteral // skip
    | tsm.NoSubstitutionTemplateLiteral // invalid syntax
    | tsm.Identifier // mut_x: number[]
    | tsm.StringLiteral // "mut_x": number[]
    | tsm.PrivateIdentifier // #memberName: number[] (class only)
    | tsm.ComputedPropertyName // [`mut_x`]: number[]
  >('=');

  return (
    (nameNode.isKind(tsm.SyntaxKind.Identifier) &&
      pipe(nameNode.getText()).map((nm) =>
        options.ignoredPrefixes.some((p) => nm.startsWith(p)),
      ).value) ||
    (nameNode.isKind(tsm.SyntaxKind.StringLiteral) &&
      pipe(nameNode.getLiteralValue()).map((nm) =>
        options.ignoredPrefixes.some((p) => nm.startsWith(p)),
      ).value) ||
    (nameNode.isKind(tsm.SyntaxKind.PrivateIdentifier) &&
      pipe(nameNode.getText()).map((nm) =>
        options.ignoredPrefixes.some((p) => nm.startsWith(`#${p}`)),
      ).value) ||
    (nameNode.isKind(tsm.SyntaxKind.ComputedPropertyName) &&
      pipe(nameNode.getExpression()).map((exp) => {
        if (exp.isKind(tsm.SyntaxKind.StringLiteral)) {
          const nm = exp.getLiteralValue();

          return options.ignoredPrefixes.some((p) => nm.startsWith(p));
        }

        return false;
      }).value)
  );
};

const isDirective = (node: tsm.Node): boolean => {
  if (!tsm.Node.isStringLiteral(node)) return false;

  const parent = node.getParent();

  // 1. 親が ExpressionStatement であることを確認
  if (tsm.Node.isExpressionStatement(parent)) {
    // 2. その ExpressionStatement の子がこの StringLiteral だけである
    // かつ、ソースファイルやブロックの先頭付近にある
    const expression = parent.getExpression();

    if (expression === node) {
      // "use strict" や "use client" などの文字列そのものが文（Statement）になっている
      return true;
    }
  }

  return false;
};
