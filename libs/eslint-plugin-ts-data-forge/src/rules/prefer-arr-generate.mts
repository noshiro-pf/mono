import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  ASTUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  createGetLayerTypes,
  getArgumentText,
  negationOf,
  prefixedNegationOf,
  skipTypeWrappers,
  type NegationContext,
} from 'eslint-rule-forge';
import { Arr, hasKey, isRecord } from 'ts-data-forge';
import type { FixedLengthTuple } from 'ts-type-forge';
import * as ts from 'typescript';
import { tsDataForgeValuesAt } from './import-binding.mjs';
import { needsMutableResult } from './mutable-result.mjs';

type Options = readonly [];

type MessageIds = 'useArrGenerate' | 'suggestArrGenerate';

/** A filter-and-map `flatMap` call, taken apart. */
type Match = Readonly<{
  node: TSESTree.CallExpression;
  replacement: string;
  autofixable: boolean;
}>;

/**
 * The callback of `xs.flatMap((x) => (cond ? [a, b] : []))` decides per element
 * whether to keep it and what to keep. Written as a loop, that is
 *
 * ```ts
 * Arr.generate(function* () {
 *   for (const x of xs) {
 *     if (cond) {
 *       yield a;
 *       yield b;
 *     }
 *   }
 * });
 * ```
 *
 * A block-bodied callback whose only `return` is its last statement works the
 * same way: the statements before it move into the loop. When the empty array
 * is the consequent (`cond ? [] : [a]`), the condition is negated the short way
 * `negationOf` from eslint-rule-forge writes it (`a !== b`, `!a && !b`).
 *
 * The callback is reported only when the rewrite keeps its meaning:
 *
 * - The receiver is an array or a tuple at every layer of its type wrappers
 *   (an object with a `flatMap` method of its own is not touched).
 * - The callback is a non-async arrow function with one parameter, which may
 *   be destructured but has no default: an index or array parameter has no
 *   counterpart in the loop.
 * - Neither the callback nor the receiver reads `this`, `arguments`, `super`
 *   or `new.target`, which the generator function would rebind; the receiver
 *   names none of the parameter's bindings, which the loop variable would
 *   shadow (`node.children.flatMap((node) => …)`).
 *
 * The fix is applied automatically only when nothing it drops could have
 * mattered; otherwise it is offered as a suggestion:
 *
 * - The result becomes a readonly array, so code that visibly needs a mutable
 *   one (see `needsMutableResult`) keeps a suggestion.
 * - A type annotation on the parameter, a return type on the callback, or a
 *   type wrapper around the conditional or either branch
 *   (`[] as readonly T[]`), may be what types the elements, and the loop has
 *   no place for it.
 * - The receiver moves into the generator function, where a narrowing of a
 *   property (`s.decl.items` after `s.decl !== null`) or of a variable that is
 *   reassigned somewhere no longer applies.
 * - A `filter()` receiver becomes an intermediate array the loop iterates,
 *   which reads better as a condition inside the loop.
 * - A comment the rewrite has no place for would be lost.
 *
 * One difference is not checked: `flatMap` skips the holes of a sparse array,
 * while `for…of` visits them as `undefined`.
 */
export const preferArrGenerate: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace the filter-and-map idiom `xs.flatMap((x) => (cond ? [f(x)] : []))` with a loop in `Arr.generate` from ts-data-forge.',
    },
    fixable: 'code',
    hasSuggestions: true,
    schema: [],
    messages: {
      useArrGenerate:
        'Replace this filter-and-map `flatMap` with a loop in `Arr.generate` from ts-data-forge.',
      suggestArrGenerate:
        'Replace with a loop in `Arr.generate` from ts-data-forge (check the element type, and that the result may be readonly).',
    },
    defaultOptions: [],
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const services = sourceCode.parserServices;

    const tsProgram = services?.program ?? undefined;

    const esTreeNodeToTSNodeMap = services?.esTreeNodeToTSNodeMap;

    // Without type information the rule cannot tell an array from another
    // object with a `flatMap` method.
    if (tsProgram === undefined || esTreeNodeToTSNodeMap === undefined) {
      return {};
    }

    const checker = tsProgram.getTypeChecker();

    const getLayerTypes = createGetLayerTypes({
      program: tsProgram,
      esTreeNodeToTSNodeMap,
    });

    // The negation is the test of the loop's `if`, where only its truthiness is
    // read, so `!!a` may always be written `a`.
    const negationContext: NegationContext = {
      sourceCode,
      checker,
      getLayerTypes,
      isBoolean: () => true,
    };

    const getTsNode = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      node: TSESTree.Node,
    ): ts.Node | undefined => esTreeNodeToTSNodeMap.get(node);

    // The name the rewrite writes, and, at a node, the edits that bind it.
    const arr = tsDataForgeValuesAt(sourceCode, ['Arr']);

    const arrName = arr.localNames[0] ?? 'Arr';

    const mut_matches: Match[] = [];

    return {
      CallExpression: (node) => {
        const callee = skipTypeWrappers(node.callee);

        if (
          node.optional ||
          callee.type !== AST_NODE_TYPES.MemberExpression ||
          callee.optional ||
          callee.computed ||
          callee.property.type !== AST_NODE_TYPES.Identifier ||
          callee.property.name !== 'flatMap' ||
          callee.object.type === AST_NODE_TYPES.Super ||
          // A second argument is `thisArg`.
          !Arr.isFixedLengthTuple(1, node.arguments)
        ) {
          return;
        }

        const callback = node.arguments[0];

        // A wrapper around the callback may be what types its parameter, so a
        // wrapped callback is not unwrapped.
        if (
          callback.type !== AST_NODE_TYPES.ArrowFunctionExpression ||
          callback.async ||
          !Arr.isFixedLengthTuple(1, callback.params)
        ) {
          return;
        }

        const param = callback.params[0];

        if (
          param.type !== AST_NODE_TYPES.Identifier &&
          param.type !== AST_NODE_TYPES.ObjectPattern &&
          param.type !== AST_NODE_TYPES.ArrayPattern
        ) {
          return;
        }

        // `(x?: T) => …` may be called without the element.
        if (param.optional) {
          return;
        }

        const typeArguments = node.typeArguments;

        // `flatMap<U, This>` has no counterpart for `This`.
        if (typeArguments !== undefined && typeArguments.params.length !== 1) {
          return;
        }

        const shape = getFilterMapShape(sourceCode, callback);

        if (shape === undefined) {
          return;
        }

        const receiver = callee.object;

        if (
          (shape.prelude ?? []).some((statement) =>
            someDescendant(sourceCode, statement, isReturnStatement, false),
          ) ||
          someDescendant(sourceCode, callback, rebindsInGenerator, true) ||
          someDescendant(sourceCode, receiver, rebindsInGenerator, true)
        ) {
          return;
        }

        const paramNames = new Set(
          sourceCode
            .getDeclaredVariables(callback)
            .map((variable) => variable.name),
        );

        if (
          someDescendant(
            sourceCode,
            receiver,
            (n) =>
              n.type === AST_NODE_TYPES.Identifier &&
              paramNames.has(n.name) &&
              isReference(n) &&
              !isBoundWithin(sourceCode, n, receiver),
            true,
          )
        ) {
          return;
        }

        // At every layer of type wrappers (see typeWrapperLayers).
        const isArrayReceiver = getLayerTypes(receiver).every((type) =>
          isArrayOrTupleType(checker, type),
        );

        if (!isArrayReceiver) {
          return;
        }

        const replacement = buildReplacement({
          sourceCode,
          negationContext,
          node,
          arrName,
          typeArgumentsText:
            typeArguments === undefined
              ? ''
              : sourceCode.getText(typeArguments),
          // The loop variable cannot carry the annotation; the suggestion
          // leaves it to the receiver's element type.
          paramText:
            param.typeAnnotation === undefined
              ? sourceCode.getText(param)
              : sourceCode.text
                  .slice(param.range[0], param.typeAnnotation.range[0])
                  .trimEnd(),
          receiver,
          shape,
        });

        const autofixable =
          !shape.wrapped &&
          param.typeAnnotation === undefined &&
          callback.returnType === undefined &&
          !isFilterCall(receiver) &&
          !someDescendant(
            sourceCode,
            receiver,
            (n) =>
              isNarrowedHere(
                sourceCode,
                checker,
                getTsNode,
                n,
                n === skipTypeWrappers(receiver),
              ),
            true,
          ) &&
          !losesComments(
            sourceCode,
            node,
            [
              receiver.range,
              param.range,
              ...(typeArguments === undefined ? [] : [typeArguments.range]),
            ],
            shape,
          ) &&
          !needsMutableResult(sourceCode, checker, getTsNode, node);

        mut_matches.push({ node, replacement, autofixable });
      },
      'Program:exit': () => {
        // Every fix brings `Arr` into scope itself, so that one applied alone
        // (an editor's quick fix) is complete.
        for (const match of mut_matches) {
          const binding = arr.at(match.node);

          const fix: TSESLint.ReportFixFunction | null =
            binding === undefined
              ? null
              : (fixer) => [
                  ...binding.edits(fixer),
                  fixer.replaceText(match.node, match.replacement),
                ];

          if (match.autofixable) {
            context.report({
              node: match.node,
              messageId: 'useArrGenerate',
              fix,
            });
          } else {
            context.report({
              node: match.node,
              messageId: 'useArrGenerate',
              suggest:
                fix === null
                  ? []
                  : [
                      {
                        messageId: 'suggestArrGenerate',
                        fix,
                      },
                    ],
            });
          }
        }
      },
    };
  },
} as const;

/** The parts of a filter-and-map callback that the rewrite keeps. */
type FilterMapShape = Readonly<{
  /** The statements before the `return` of a block body. */
  prelude: readonly TSESTree.Statement[] | undefined;
  /**
   * The source of a block body from just inside its `{` up to its `return`:
   * the statements before it, and every comment among or above them.
   */
  preludeRange: FixedLengthTuple<2, number> | undefined;
  test: TSESTree.Expression;
  /** Whether the kept branch is the alternate (`cond ? [] : [x]`). */
  negated: boolean;
  elements: readonly TSESTree.Expression[];
  /** Whether a type wrapper surrounds the conditional or either branch. */
  wrapped: boolean;
}>;

const getFilterMapShape = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  callback: TSESTree.ArrowFunctionExpression,
): FilterMapShape | undefined => {
  const { body } = callback;

  const returnStatement =
    body.type === AST_NODE_TYPES.BlockStatement ? body.body.at(-1) : undefined;

  if (
    body.type === AST_NODE_TYPES.BlockStatement &&
    (returnStatement?.type !== AST_NODE_TYPES.ReturnStatement ||
      returnStatement.argument === null)
  ) {
    return undefined;
  }

  const returned =
    body.type === AST_NODE_TYPES.BlockStatement
      ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        (returnStatement as TSESTree.ReturnStatement).argument
      : body;

  if (returned === null) {
    return undefined;
  }

  const conditional = skipTypeWrappers(returned);

  if (conditional.type !== AST_NODE_TYPES.ConditionalExpression) {
    return undefined;
  }

  const consequent = skipTypeWrappers(conditional.consequent);

  const alternate = skipTypeWrappers(conditional.alternate);

  if (
    consequent.type !== AST_NODE_TYPES.ArrayExpression ||
    alternate.type !== AST_NODE_TYPES.ArrayExpression
  ) {
    return undefined;
  }

  const negated = Arr.isEmpty(consequent.elements);

  const kept = negated ? alternate : consequent;

  const dropped = negated ? consequent : alternate;

  if (!Arr.isEmpty(dropped.elements) || Arr.isEmpty(kept.elements)) {
    return undefined;
  }

  const elements = kept.elements.filter(
    (element): element is TSESTree.Expression =>
      element !== null && element.type !== AST_NODE_TYPES.SpreadElement,
  );

  if (elements.length !== kept.elements.length) {
    return undefined;
  }

  const openingBrace =
    body.type === AST_NODE_TYPES.BlockStatement
      ? sourceCode.getFirstToken(body)
      : null;

  const preludeStart =
    openingBrace === null
      ? undefined
      : sourceCode.getTokenAfter(openingBrace, { includeComments: true })
          ?.range[0];

  return {
    prelude:
      body.type === AST_NODE_TYPES.BlockStatement
        ? body.body.slice(0, -1)
        : undefined,
    preludeRange:
      preludeStart === undefined ||
      returnStatement === undefined ||
      preludeStart >= returnStatement.range[0]
        ? undefined
        : [preludeStart, returnStatement.range[0]],
    test: conditional.test,
    negated,
    elements,
    wrapped:
      conditional !== returned ||
      consequent !== conditional.consequent ||
      alternate !== conditional.alternate,
  };
};

/** The whitespace at the start of the line that `index` is on. */
const lineIndentOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  index: number,
): string => {
  const { line } = sourceCode.getLocFromIndex(index);

  const lineText = sourceCode.lines[line - 1] ?? '';

  return /^\s*/u.exec(lineText)?.[0] ?? '';
};

/**
 * `text`, the source at `range`, with every line after the first shifted from
 * the indentation of the line `range` starts on to `targetIndent`. Left as it
 * is when a template literal or string spans lines inside it, since shifting
 * those lines would change the string.
 */
const reindent = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  range: FixedLengthTuple<2, number>,
  targetIndent: string,
  text: string,
): string => {
  if (!text.includes('\n')) {
    return text;
  }

  const spansLines = sourceCode.ast.tokens.some(
    (token) =>
      range[0] <= token.range[0] &&
      token.range[1] <= range[1] &&
      (token.type === AST_TOKEN_TYPES.Template ||
        token.type === AST_TOKEN_TYPES.String) &&
      token.loc.start.line !== token.loc.end.line,
  );

  if (spansLines) {
    return text;
  }

  const sourceIndent = lineIndentOf(sourceCode, range[0]);

  const [first, ...rest] = text.split('\n');

  return [
    first,
    ...rest.map((line) =>
      line.startsWith(sourceIndent)
        ? `${targetIndent}${line.slice(sourceIndent.length)}`
        : line,
    ),
  ].join('\n');
};

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const buildReplacement = ({
  sourceCode,
  negationContext,
  node,
  arrName,
  typeArgumentsText,
  paramText,
  receiver,
  shape,
}: Readonly<{
  sourceCode: TSESLint.SourceCode;
  negationContext: NegationContext;
  node: TSESTree.CallExpression;
  arrName: string;
  typeArgumentsText: string;
  paramText: string;
  receiver: TSESTree.Expression;
  shape: FilterMapShape;
}>): string => {
  const indent0 = lineIndentOf(sourceCode, node.range[0]);

  const indent1 = `${indent0}  ` as const;

  const indent2 = `${indent1}  ` as const;

  const indent3 = `${indent2}  ` as const;

  const condition = reindent(
    sourceCode,
    shape.test.range,
    indent2,
    shape.negated
      ? (negationOf(shape.test, negationContext, undefined) ??
          prefixedNegationOf(shape.test, sourceCode))
      : sourceCode.getText(shape.test),
  );

  const { preludeRange } = shape;

  const preludeLines =
    preludeRange === undefined
      ? ([] as const)
      : ([
          `${indent2}${reindent(
            sourceCode,
            preludeRange,
            indent2,
            sourceCode.text.slice(...preludeRange).trimEnd(),
          )}`,
        ] as const);

  const yieldLines = shape.elements.map(
    (element) =>
      `${indent3}yield ${reindent(
        sourceCode,
        element.range,
        indent3,
        getArgumentText(sourceCode, element),
      )};`,
  );

  const receiverText = reindent(
    sourceCode,
    receiver.range,
    indent1,
    getArgumentText(sourceCode, receiver),
  );

  return [
    `${arrName}.generate${typeArgumentsText}(function* () {`,
    `${indent1}for (const ${paramText} of ${receiverText}) {`,
    ...preludeLines,
    `${indent2}if (${condition}) {`,
    ...yieldLines,
    `${indent2}}`,
    `${indent1}}`,
    `${indent0}})`,
  ].join('\n');
};

/**
 * Whether a comment inside `node`, the call the fix replaces, lies outside
 * every range the rewrite copies verbatim, and would therefore be dropped.
 *
 * `copied` lists those ranges besides the shape's: the receiver, the type
 * arguments and the parameter. The test counts only when it is copied as it is:
 * a negated test is rebuilt by `negationOf`, which can drop a comment (one
 * between the operands of `a && b` is gone from `!a || !b`), so any comment in
 * one keeps the fix a suggestion, even where the negation carries it over. A
 * comment between the receiver and `.flatMap`, after `flatMap(` or after the
 * callback is in none of the ranges.
 */
const losesComments = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.CallExpression,
  copied: readonly FixedLengthTuple<2, number>[],
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  shape: FilterMapShape,
): boolean => {
  const keptRanges: readonly FixedLengthTuple<2, number>[] = [
    ...copied,
    ...(shape.negated ? ([] as const) : ([shape.test.range] as const)),
    ...shape.elements.map((element) => element.range),
    ...(shape.preludeRange === undefined
      ? ([] as const)
      : ([shape.preludeRange] as const)),
  ] as const;

  return sourceCode
    .getCommentsInside(node)
    .some((comment) =>
      keptRanges.every(
        ([start, end]) =>
          !(start <= comment.range[0] && comment.range[1] <= end),
      ),
    );
};

/** Whether `node`, with its type wrappers taken off, is a `….filter(…)` call. */
const isFilterCall = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Expression,
): boolean => {
  const call = skipTypeWrappers(node);

  if (call.type !== AST_NODE_TYPES.CallExpression) {
    return false;
  }

  const callee = skipTypeWrappers(call.callee);

  return (
    callee.type === AST_NODE_TYPES.MemberExpression &&
    !callee.computed &&
    callee.property.type === AST_NODE_TYPES.Identifier &&
    callee.property.name === 'filter'
  );
};

/**
 * Whether `type` is an array or tuple, or a union of them, or an intersection
 * with one in it (`readonly T[] & Brand`).
 */
const isArrayOrTupleType = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: ts.Type,
): boolean => {
  const resolved =
    (type.flags & ts.TypeFlags.TypeParameter) !== 0
      ? (checker.getBaseConstraintOfType(type) ?? type)
      : type;

  return resolved.isUnion()
    ? resolved.types.every((t) => isArrayOrTupleType(checker, t))
    : resolved.isIntersection()
      ? resolved.types.some((t) => isArrayOrTupleType(checker, t))
      : checker.isArrayType(resolved) || checker.isTupleType(resolved);
};

/**
 * Whether two types are both arrays or tuples whose elements have one type, as
 * the declared and the narrowed type of `xs` after `Arr.isNonEmpty(xs)` are.
 */
const iteratesTheSame = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  a: ts.Type,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  b: ts.Type,
): boolean => {
  if (!isArrayOrTupleType(checker, a) || !isArrayOrTupleType(checker, b)) {
    return false;
  }

  const elementOfA = checker.getIndexTypeOfType(a, ts.IndexKind.Number);

  return (
    elementOfA !== undefined &&
    elementOfA === checker.getIndexTypeOfType(b, ts.IndexKind.Number)
  );
};

/**
 * The type of a variable or a property as declared, before any narrowing, or
 * `undefined` when there is none to compare with (an index read with no
 * property behind it, which nothing narrows).
 *
 * A property's is read off the type of the object it is accessed on, which also
 * covers a property of a mapped type (`Readonly<…>`), whose symbol has no
 * declaration of its own. A variable's is the type at its declaration
 * (`checker.getTypeOfSymbol` would say the same, but is missing before
 * TypeScript 5.1).
 */
const getDeclaredType = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,

  tsNode: ts.Node,
): ts.Type | undefined => {
  if (
    ts.isPropertyAccessExpression(tsNode) ||
    ts.isElementAccessExpression(tsNode)
  ) {
    const name = ts.isPropertyAccessExpression(tsNode)
      ? tsNode.name.text
      : ts.isStringLiteralLike(tsNode.argumentExpression) ||
          ts.isNumericLiteral(tsNode.argumentExpression)
        ? tsNode.argumentExpression.text
        : undefined;

    const property =
      name === undefined
        ? undefined
        : checker.getPropertyOfType(
            checker.getTypeAtLocation(tsNode.expression),
            name,
          );

    // Asked at the object rather than at the access, so that no narrowing of
    // the access applies.
    return property === undefined
      ? undefined
      : checker.getTypeOfSymbolAtLocation(property, tsNode.expression);
  }

  const symbol = checker.getSymbolAtLocation(tsNode);

  const declaration = symbol?.valueDeclaration;

  return symbol === undefined || declaration === undefined
    ? undefined
    : checker.getTypeOfSymbolAtLocation(symbol, declaration);
};

/** Whether an identifier reads a binding, rather than naming a property or a key. */
const isReference = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Identifier,
): boolean => {
  const { parent } = node;

  return !(
    (parent.type === AST_NODE_TYPES.MemberExpression &&
      parent.property === node &&
      !parent.computed) ||
    (parent.type === AST_NODE_TYPES.Property &&
      parent.key === node &&
      !parent.computed &&
      !parent.shorthand)
  );
};

/**
 * Whether `node`, a reference or a member access, has a type here narrower than
 * its declared one, by a narrowing that a function created here would not see.
 * TypeScript keeps the narrowing of a `const`, and of a parameter or `let` that
 * is never reassigned, inside a closure; it drops every other one, including
 * any narrowing of a property.
 */
const isNarrowedHere = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  getTsNode: (esNode: TSESTree.Node) => ts.Node | undefined,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
  isReceiver: boolean,
): boolean => {
  if (
    node.type !== AST_NODE_TYPES.Identifier &&
    node.type !== AST_NODE_TYPES.MemberExpression
  ) {
    return false;
  }

  // A method about to be called (`xs.flat()`): its type is that of the method,
  // which no narrowing of interest changes.
  if (
    node.parent.type === AST_NODE_TYPES.CallExpression &&
    node.parent.callee === node
  ) {
    return false;
  }

  if (node.type === AST_NODE_TYPES.Identifier) {
    if (!isReference(node)) {
      return false;
    }

    const variable = ASTUtils.findVariable(sourceCode.getScope(node), node);

    if (
      variable?.references.every(
        (reference) => !reference.isWrite() || reference.init === true,
      ) === true
    ) {
      return false;
    }
  }

  const tsNode = getTsNode(node);

  if (tsNode === undefined) {
    return false;
  }

  const declaredType = getDeclaredType(checker, tsNode);

  const type = checker.getTypeAtLocation(tsNode);

  return (
    declaredType !== undefined &&
    declaredType !== type &&
    // The loop only iterates the receiver itself, so a narrowing that leaves it
    // an array of the same elements (`Arr.isNonEmpty(xs)`) loses nothing.
    !(isReceiver && iteratesTheSame(checker, declaredType, type))
  );
};

/**
 * Whether the binding `identifier` reads is declared inside `container`, as the
 * parameter of an arrow function in the receiver is: the loop variable does not
 * shadow it.
 */
const isBoundWithin = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  identifier: TSESTree.Identifier,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  container: TSESTree.Node,
): boolean => {
  const variable = ASTUtils.findVariable(
    sourceCode.getScope(identifier),
    identifier,
  );

  return (
    variable !== null &&
    Arr.isNonEmpty(variable.defs) &&
    variable.defs.every(
      (def) =>
        container.range[0] <= def.name.range[0] &&
        def.name.range[1] <= container.range[1],
    )
  );
};

const isNode = (value: unknown): value is TSESTree.Node =>
  isRecord(value) && hasKey(value, 'type') && typeof value.type === 'string';

/**
 * Whether `node` or a node inside it satisfies `predicate`. A nested
 * non-arrow function or class has its own `this`, `arguments` and `return`,
 * and is not entered; a nested arrow function shares `this` and `arguments`,
 * and is entered only when `enterArrows` is set.
 */
const someDescendant = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  predicate: (n: TSESTree.Node) => boolean,
  enterArrows: boolean,
  isRoot: boolean = true,
): boolean => {
  if (predicate(node)) {
    return true;
  }

  if (
    !isRoot &&
    (node.type === AST_NODE_TYPES.FunctionDeclaration ||
      node.type === AST_NODE_TYPES.FunctionExpression ||
      node.type === AST_NODE_TYPES.ClassBody ||
      (!enterArrows && node.type === AST_NODE_TYPES.ArrowFunctionExpression))
  ) {
    return false;
  }

  const keys = sourceCode.visitorKeys[node.type] ?? [];

  return keys.some((key) => {
    const child: unknown = isRecord(node) ? node[key] : undefined;

    return (Arr.isArray(child) ? child : [child]).some(
      (c) =>
        isNode(c) &&
        someDescendant(sourceCode, c, predicate, enterArrows, false),
    );
  });
};

const isReturnStatement = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): boolean => node.type === AST_NODE_TYPES.ReturnStatement;

/** What a generator function binds anew: `this`, `arguments`, `super`, `new.target`. */
const rebindsInGenerator = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): boolean =>
  node.type === AST_NODE_TYPES.ThisExpression ||
  node.type === AST_NODE_TYPES.Super ||
  node.type === AST_NODE_TYPES.MetaProperty ||
  (node.type === AST_NODE_TYPES.Identifier && node.name === 'arguments');
