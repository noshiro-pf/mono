import {
  AST_NODE_TYPES,
  ESLintUtils,
  type ParserServices,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { isLocallyBound, skipTypeWrappers } from 'eslint-rule-forge';
import { Arr, hasKey, isRecord } from 'ts-data-forge';
import * as ts from 'typescript';

type Options = readonly [];

type MessageIds = 'addInferredTypeArguments' | 'missingTypeArguments';

/**
 * The global collection constructors, each with the annotation names whose
 * type arguments can be copied onto it.
 *
 * An annotation naming the constructor itself (`const s: Set<T> = new Set()`)
 * is not copied: `@typescript-eslint/consistent-generic-constructors` moves
 * those type arguments onto the constructor, and copying them would leave them
 * on both sides.
 */
const collectionAnnotations = new Map<string, ReadonlySet<string>>([
  ['Set', new Set<string>(['ReadonlySet'])],
  ['Map', new Set<string>(['ReadonlyMap'])],
  ['WeakSet', new Set<string>()],
  ['WeakMap', new Set<string>()],
]);

/**
 * Require explicit type arguments on `new Set` / `new Map` / `new WeakSet` /
 * `new WeakMap` when the element type would otherwise come from the context or
 * from literals.
 *
 * ## Why
 *
 * With no argument, or an array literal, the type arguments are inferred from
 * the contextual type or from the literals, and the result depends on the
 * standard library in effect:
 *
 * - The stock library declares `new <T = any>(values?: …)`, so
 *   `const s = new Set()` is a `Set<any>`, and nothing reports it.
 * - The strict standard library defaults the type arguments of a bare
 *   `new Set()` / `new Map()` to `never`, so every later `add` / `set` is
 *   an error there.
 *   Its bundles for TypeScript before 5.4 also declare `Set#has` to take
 *   `T | (WidenLiteral<T> & {})` without `NoInfer`, which widens what is
 *   inferred from a contextual `ReadonlySet<'a' | 'b'>` back to `string`, so
 *   `const s: ReadonlySet<Id> = new Set(['task:a'])` fails with
 *   "`Set<string>` is not assignable to `ReadonlySet<Id>`" — an error that
 *   names no fix and invites a cast.
 *
 * Written type arguments mean the same in both. An argument that is any other
 * expression (`new Set(ids)`, `new Map(Object.entries(r))`) carries its own
 * element type, which both libraries infer alike, so it is left alone.
 *
 * ## Fix
 *
 * When the expression initializes a variable or a class property whose
 * annotation is a `ReadonlySet<…>` / `ReadonlyMap<…>`, the annotation's type
 * arguments are copied onto the constructor. Anything else is the author's
 * call; with type information, the type arguments TypeScript infers there are
 * offered as a suggestion, unless they are `any`, `unknown` or `never`.
 *
 * The argument is read through `as` / `satisfies` / `!` / `<T>`
 * (`new Set(['a'] as const)` is still an array literal). An initializer
 * wrapped in one is reported without a fix, since the wrapper, not the
 * annotation, then says what the value is.
 */
export const explicitCollectionTypeArguments: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require explicit type arguments on `new Set` / `new Map` / `new WeakSet` / `new WeakMap` called with no argument or an array literal',
    },
    fixable: 'code',
    hasSuggestions: true,
    schema: [],
    messages: {
      missingTypeArguments:
        '`new {{name}}` with no argument or an array literal infers its type arguments from the context or the literals, which differs between the stock and the strict standard library (and is `any` in the stock one when there is no context). Write them: `new {{name}}<…>(…)`.',
      addInferredTypeArguments:
        'Write the type arguments TypeScript infers here: `{{typeArguments}}`.',
    },
    defaultOptions: [],
  },

  create: (context) => {
    const { sourceCode } = context;

    const services = ESLintUtils.getParserServices(context, true);

    return {
      NewExpression: (node) => {
        if (
          node.callee.type !== AST_NODE_TYPES.Identifier ||
          node.typeArguments !== undefined
        ) {
          return;
        }

        const { name } = node.callee;

        const annotationNames = collectionAnnotations.get(name);

        if (annotationNames === undefined) {
          return;
        }

        if (!infersFromContext(node.arguments)) {
          return;
        }

        if (isLocallyBound(sourceCode, node, name)) {
          return;
        }

        const typeArguments = annotationTypeArguments(node, annotationNames);

        if (typeArguments !== undefined) {
          context.report({
            node,
            messageId: 'missingTypeArguments',
            data: { name },
            fix: (fixer) =>
              fixer.insertTextAfter(
                node.callee,
                sourceCode.getText(typeArguments),
              ),
          });

          return;
        }

        const inferred = inferredTypeArgumentsText(services, node, [
          name,
          ...annotationNames,
        ]);

        context.report({
          node,
          messageId: 'missingTypeArguments',
          data: { name },
          suggest:
            inferred === undefined
              ? []
              : [
                  {
                    messageId: 'addInferredTypeArguments',
                    data: { typeArguments: inferred },
                    fix: (fixer) =>
                      fixer.insertTextAfter(node.callee, inferred),
                  },
                ],
        });
      },
    };
  },
} as const;

/**
 * Whether the constructor's type arguments come from the context or from
 * literals: no argument at all, or an array literal (read through type
 * wrappers).
 */
const infersFromContext = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  args: readonly TSESTree.CallExpressionArgument[],
): boolean => {
  const [first] = args;

  return (
    first === undefined ||
    skipTypeWrappers(first).type === AST_NODE_TYPES.ArrayExpression
  );
};

/**
 * The type arguments of the annotation on the variable or class property that
 * `node` directly initializes, when that annotation is one of
 * `annotationNames`.
 */
const annotationTypeArguments = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.NewExpression,
  annotationNames: ReadonlySet<string>,
): TSESTree.TSTypeParameterInstantiation | undefined => {
  const { parent } = node;

  const annotation =
    parent.type === AST_NODE_TYPES.VariableDeclarator && parent.init === node
      ? parent.id.typeAnnotation
      : parent.type === AST_NODE_TYPES.PropertyDefinition &&
          parent.value === node
        ? parent.typeAnnotation
        : undefined;

  const annotationType = annotation?.typeAnnotation;

  if (
    annotationType?.type !== AST_NODE_TYPES.TSTypeReference ||
    annotationType.typeName.type !== AST_NODE_TYPES.Identifier ||
    !annotationNames.has(annotationType.typeName.name)
  ) {
    return undefined;
  }

  return annotationType.typeArguments;
};

/** `Set<T>` and the like: an instantiation of a generic interface or class. */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const isTypeReference = (type: ts.Type): type is ts.TypeReference =>
  (type.flags & ts.TypeFlags.Object) !== 0 &&
  isRecord(type) &&
  hasKey(type, 'target');

/**
 * The type arguments of `type` when it is an instantiation of a generic type
 * and none of them is `any`, `unknown` or `never`.
 */
const meaningfulTypeArguments = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: ts.Type,
): readonly ts.Type[] | undefined => {
  if (!isTypeReference(type)) {
    return undefined;
  }

  const args = checker.getTypeArguments(type);

  return Arr.isEmpty(args) ||
    args.some(
      (arg) =>
        (arg.flags &
          (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.Never)) !==
        0,
    )
    ? undefined
    : args;
};

/**
 * The type arguments of the collection type among the members of `tsNode`'s
 * contextual type (`ReadonlySet<Id> | undefined` gives `Id`).
 */
const contextualTypeArguments = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  checker: ts.TypeChecker,

  tsNode: ts.Node,
  collectionNames: readonly string[],
): readonly ts.Type[] | undefined => {
  if (!ts.isExpression(tsNode)) {
    return undefined;
  }

  const contextual = checker.getContextualType(tsNode);

  if (contextual === undefined) {
    return undefined;
  }

  const collections = (
    contextual.isUnion() ? contextual.types : [contextual]
  ).filter((member) => {
    const memberName = member.getSymbol()?.getName();

    return memberName !== undefined && collectionNames.includes(memberName);
  });

  // Two different collection types in the context (`ReadonlySet<A> |
  // ReadonlySet<B>`) leave the choice to the author.
  const [only, ...rest] = collections;

  return only === undefined || Arr.isNonEmpty(rest)
    ? undefined
    : meaningfulTypeArguments(checker, only);
};

/**
 * The type arguments to suggest for `node`, as source text (`<string, number>`),
 * or `undefined` without type information or when there are none worth
 * writing.
 *
 * The contextual type comes first — a `ReadonlySet<Id>` parameter, a
 * `ReadonlyMap<K, V>` property — when it is one of `collectionNames`: it is
 * what the author declared, while what TypeScript infers differs by library (a
 * literal-union element widened to `string` under the strict standard library
 * before TypeScript 5.4,
 * `number[]` for a declared `readonly number[]`, `never` for an empty `new
 * Map()`). What is inferred is the fallback, unless one of its arguments is
 * `any`, `unknown` or `never` — the inference this rule exists to replace, not
 * a type anyone means.
 */
const inferredTypeArgumentsText = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  services: Partial<ParserServices>,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.NewExpression,
  collectionNames: readonly string[],
): string | undefined => {
  if (
    services.program === undefined ||
    services.program === null ||
    services.esTreeNodeToTSNodeMap === undefined
  ) {
    return undefined;
  }

  const checker = services.program.getTypeChecker();

  const tsNode = services.esTreeNodeToTSNodeMap.get(node);

  const args =
    contextualTypeArguments(checker, tsNode, collectionNames) ??
    meaningfulTypeArguments(checker, checker.getTypeAtLocation(tsNode));

  if (args === undefined) {
    return undefined;
  }

  const texts = args.map((arg) =>
    checker.typeToString(arg, tsNode, ts.TypeFormatFlags.NoTruncation),
  );

  return `<${texts.join(', ')}>`;
};
