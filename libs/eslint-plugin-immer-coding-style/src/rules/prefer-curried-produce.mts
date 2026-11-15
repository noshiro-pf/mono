import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  hasCommentWithin,
  isTypeWrapper,
  skipTypeWrappers,
  typeWrapperLayers,
} from 'eslint-rule-forge';
import { Arr, castDeepMutable, hasKey, isRecord } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import { buildImmerProduceResolver } from './immer-produce.mjs';

type MessageIds = 'useCurriedProduce';

type CallExpressionWithLegacyTypeParameters = TSESTree.CallExpression &
  Readonly<{
    typeParameters?: TSESTree.TSTypeParameterInstantiation;
  }>;

/**
 * Rewrites `(state) => produce(state, recipe)` as `produce(recipe)`. The base
 * state is recognized through type wrappers (`produce(state satisfies State,
 * recipe)`), which change nothing at run time and go with the argument. The
 * type argument is the call's own (`produce<State>(state, recipe)`), else the
 * parameter's annotation, else the wrapper's return type.
 *
 * The curried form passes its extra arguments on to the recipe (`recipe(draft,
 * ...args)`), so `xs.map((s) => produce(s, r))` → `xs.map(produce(r))` would
 * hand `r` the index and the array. The fix is applied only when the recipe is
 * an arrow function taking at most one parameter, which cannot read them, and
 * only when it is the last argument: a third one (a patch listener) would
 * become the curried form's initial state.
 *
 * An `async` wrapper is left alone, since it returns a `Promise` of the next
 * state and the curried form returns the state itself, and so is a generic one
 * (`<S extends State>(state: S) => …`), whose type parameter the curried form
 * would have nowhere to declare, and so is a base under `!`
 * (`produce(state!, recipe)`): the curried form would take the draft's narrower
 * type, and its callers could no longer pass what the wrapper took.
 * An optional parameter is left alone for the same reason, and so is a base
 * under an `as` or `<T>` whose type is not the parameter's annotation
 * (`(state: State | undefined) => produce(state as State, recipe)`), or that
 * casts an unannotated parameter, whose type may come from the context.
 * A call under `as` or `<T>` (`produce(state, recipe) as View`) is left alone
 * too, since no curried form returns the type it asserts.
 *
 * `produce` is immer's: a named, aliased, default or namespace import from
 * `immer` that nothing nearer shadows. The call and its callee are read through
 * type wrappers. A call under `satisfies` or `!`, and a callee or namespace
 * object in any wrapper (`(produce as typeof produce)(state, recipe)`,
 * `(immer as T).produce(…)`), are reported without a fix, which could not keep
 * the wrapper; so is an updater with a comment outside the recipe, which the
 * fix would delete.
 */
export const preferCurriedProduceRule: TSESLint.RuleModule<MessageIds> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer the curried overload of immer produce for shorter updater definitions.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useCurriedProduce:
        'Use the curried overload of `produce`: `produce(recipe)` instead of `(state) => produce(state, recipe)`.',
    },
    defaultOptions: [],
  },
  create: (context) => {
    const sourceCode = context.sourceCode;

    const resolveProduce = buildImmerProduceResolver(sourceCode);

    const isImmerProduce = (
      call: DeepReadonly<TSESTree.CallExpression>,
    ): boolean => resolveProduce(call.callee) === 'produce';

    return {
      ArrowFunctionExpression: (
        node: DeepReadonly<TSESTree.ArrowFunctionExpression>,
      ) => {
        if (
          node.async ||
          node.typeParameters !== undefined ||
          !Arr.isFixedLengthArray(1, node.params)
        ) {
          return;
        }

        const param = node.params[0];

        // `(state?: State) => …` can be called without a state; the curried
        // form cannot.
        if (
          param.type !== AST_NODE_TYPES.Identifier ||
          param.name.length === 0 ||
          param.optional
        ) {
          return;
        }

        const { name: parameterName } = param;

        const callExpression = skipTypeWrappers(node.body);

        // `(state) => produce(state, recipe) as View` returns a `View`, which
        // no curried form does.
        if (
          callExpression.type !== AST_NODE_TYPES.CallExpression ||
          !isImmerProduce(callExpression) ||
          typeWrapperLayers(node.body).some(
            (layer) => castTypeOf(layer) !== undefined,
          )
        ) {
          return;
        }

        const [baseArgument, ...restArguments] = callExpression.arguments;

        if (
          baseArgument === undefined ||
          !Arr.isFixedLengthArray(1, restArguments) ||
          !ignoresExtraArguments(restArguments[0])
        ) {
          return;
        }

        // `produce(state!, recipe)` drafts a narrower type than the wrapper
        // takes; no type argument keeps both.
        if (
          typeWrapperLayers(baseArgument).some(
            (layer) => layer.type === AST_NODE_TYPES.TSNonNullExpression,
          )
        ) {
          return;
        }

        // `(state: State | undefined) => produce(state as State, recipe)`
        // would become `produce<State>(recipe)`, which no longer takes
        // `undefined`.
        if (
          assertsOtherType(
            baseArgument,
            param.typeAnnotation === undefined
              ? undefined
              : tokensText(
                  sourceCode,
                  castDeepMutable(param.typeAnnotation.typeAnnotation),
                ),
            sourceCode,
          )
        ) {
          return;
        }

        const baseIdentifier = findIdentifier(baseArgument, parameterName);

        if (baseIdentifier === undefined) {
          return;
        }

        if (hasOtherReferences(context, parameterName, baseIdentifier)) {
          return;
        }

        const recipe = restArguments[0];

        const isFixable =
          node.body === callExpression &&
          !hasWrappedCallee(callExpression) &&
          !hasCommentWithin(sourceCode, castDeepMutable(node), [
            [node.range[0], recipe.range[0]],
            [recipe.range[1], node.range[1]],
          ]);

        report(context, {
          arrowFunction: node,
          callExpression,
          isFixable,
          remainingArguments: restArguments,
          sourceCode,
        });
      },
    };
  },
} as const;

type ReportContext = Readonly<{
  arrowFunction: DeepReadonly<TSESTree.ArrowFunctionExpression>;
  callExpression: DeepReadonly<TSESTree.CallExpression>;
  isFixable: boolean;
  remainingArguments: readonly DeepReadonly<TSESTree.CallExpressionArgument>[];
  sourceCode: Readonly<{
    getText: TSESLint.SourceCode['getText'];
  }>;
}>;

const getTypeArguments = (
  node: DeepReadonly<TSESTree.CallExpression>,
): TSESTree.TSTypeParameterInstantiation | undefined => {
  const mutableNode = castDeepMutable(node);

  if (isRecord(mutableNode) && hasKey(mutableNode, 'typeArguments')) {
    return (
      mutableNode as TSESTree.CallExpression &
        Readonly<{
          typeArguments?: TSESTree.TSTypeParameterInstantiation;
        }>
    ).typeArguments;
  }

  if (isRecord(mutableNode) && hasKey(mutableNode, 'typeParameters')) {
    return (mutableNode as CallExpressionWithLegacyTypeParameters)
      .typeParameters;
  }

  return undefined;
};

const getArrowFunctionParameterType = ({
  arrowFunction,
  sourceCode,
}: Readonly<{
  arrowFunction: DeepReadonly<TSESTree.ArrowFunctionExpression>;
  sourceCode: Readonly<{
    getText: TSESLint.SourceCode['getText'];
  }>;
}>): string | undefined => {
  const [parameter] = arrowFunction.params;

  if (parameter?.type !== AST_NODE_TYPES.Identifier) {
    return undefined;
  }

  const typeAnnotation = parameter.typeAnnotation?.typeAnnotation;

  return typeAnnotation === undefined
    ? undefined
    : sourceCode.getText(castDeepMutable(typeAnnotation));
};

const getArrowFunctionReturnType = ({
  arrowFunction,
  sourceCode,
}: Readonly<{
  arrowFunction: DeepReadonly<TSESTree.ArrowFunctionExpression>;
  sourceCode: Readonly<{
    getText: TSESLint.SourceCode['getText'];
  }>;
}>): string | undefined => {
  const typeAnnotation = arrowFunction.returnType?.typeAnnotation;

  return typeAnnotation === undefined
    ? undefined
    : sourceCode.getText(castDeepMutable(typeAnnotation));
};

const getTypeParametersText = ({
  arrowFunction,
  callExpression,
  sourceCode,
}: Readonly<{
  arrowFunction: DeepReadonly<TSESTree.ArrowFunctionExpression>;
  callExpression: DeepReadonly<TSESTree.CallExpression>;
  sourceCode: Readonly<{
    getText: TSESLint.SourceCode['getText'];
  }>;
}>): string => {
  const typeArguments = getTypeArguments(callExpression);

  if (typeArguments !== undefined) {
    return sourceCode.getText(castDeepMutable(typeArguments));
  }

  // A base under `as` or `<T>` gets this far only when the cast names the
  // parameter's own type, so the annotation stands for both.
  const parameterType = getArrowFunctionParameterType({
    arrowFunction,
    sourceCode,
  });

  if (parameterType !== undefined) {
    return `<${parameterType}>`;
  }

  const returnType = getArrowFunctionReturnType({
    arrowFunction,
    sourceCode,
  });

  return returnType !== undefined ? `<${returnType}>` : '';
};

const normalizeMultilineText = (text: string): string => {
  const lines = text.split('\n');

  if (Arr.isMaxLengthArray(1, lines)) {
    return text;
  }

  const indents = Arr.tail(lines)
    .filter((line) => line.trim().length > 0)
    .map((line) => /^[\t ]*/u.exec(line)?.[0].length ?? 0);

  if (Arr.isEmpty(indents)) {
    return text;
  }

  const minIndent = Math.min(...indents);

  if (minIndent === 0) {
    return text;
  }

  const normalized = lines.map((line, index) =>
    index === 0 ? line : line.slice(minIndent),
  );

  return normalized.join('\n');
};

const report = (
  context: DeepReadonly<TSESLint.RuleContext<MessageIds, []>>,
  {
    arrowFunction,
    callExpression,
    isFixable,
    remainingArguments,
    sourceCode,
  }: ReportContext,
): void => {
  const buildReplacement = (): string => {
    const calleeText = sourceCode.getText(
      castDeepMutable(callExpression.callee),
    );

    const typeParametersText = getTypeParametersText({
      arrowFunction,
      callExpression,
      sourceCode,
    });

    const remainingArgumentsText = remainingArguments
      .map((argument) =>
        normalizeMultilineText(sourceCode.getText(castDeepMutable(argument))),
      )
      .join(', ');

    return `${calleeText}${typeParametersText}(${remainingArgumentsText})`;
  };

  context.report({
    node: castDeepMutable(arrowFunction),
    messageId: 'useCurriedProduce',
    fix: isFixable
      ? (fixer) =>
          fixer.replaceText(castDeepMutable(arrowFunction), buildReplacement())
      : null,
  });
};

/**
 * The type `node` casts to when it is `x as T` or `<T>x`, the wrappers that can
 * change a value's type, or `undefined`.
 */
const castTypeOf = (
  node: DeepReadonly<TSESTree.Node>,
): DeepReadonly<TSESTree.TypeNode> | undefined =>
  node.type === AST_NODE_TYPES.TSAsExpression ||
  node.type === AST_NODE_TYPES.TSTypeAssertion
    ? node.typeAnnotation
    : undefined;

/**
 * Whether the callee, or the namespace object it reads `produce` from, is in a
 * type wrapper: `(produce as T)(…)`, `(immer as T).produce(…)`. The fix would
 * copy the wrapper, whose type need not have the curried overload.
 */
const hasWrappedCallee = ({
  callee,
}: DeepReadonly<TSESTree.CallExpression>): boolean =>
  isTypeWrapper(callee) ||
  (callee.type === AST_NODE_TYPES.MemberExpression &&
    isTypeWrapper(callee.object));

/**
 * `node`'s tokens joined by single spaces, so that two spellings of a type that
 * differ only in whitespace or comments compare equal.
 */
const tokensText = (
  sourceCode: TokenSource,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.TypeNode,
): string =>
  sourceCode
    .getTokens(node)
    .map((token) => token.value)
    .join(' ');

/**
 * Whether an `as` or `<T>` among `argument`'s type wrappers names a type other
 * than the parameter's annotation, given as {@link tokensText} writes it, or
 * names any type when the parameter has none (its type may come from the
 * context). Such a cast may narrow what the wrapper takes, and the curried form
 * would take only the narrower type.
 */
const assertsOtherType = (
  argument: DeepReadonly<TSESTree.CallExpressionArgument>,
  parameterType: string | undefined,
  sourceCode: TokenSource,
): boolean =>
  argument.type !== AST_NODE_TYPES.SpreadElement &&
  typeWrapperLayers(argument).some((layer) => {
    const castType = castTypeOf(layer);

    return (
      castType !== undefined &&
      tokensText(sourceCode, castDeepMutable(castType)) !== parameterType
    );
  });

type TokenSource = Readonly<{
  getTokens: TSESLint.SourceCode['getTokens'];
}>;

/**
 * `true` when `recipe` is an arrow function (through type wrappers) taking at
 * most one parameter, so it cannot see the extra arguments the curried
 * `produce` passes on. A function expression could still read them through
 * `arguments`, and a recipe passed by name could be any function.
 */
const ignoresExtraArguments = (
  recipe: DeepReadonly<TSESTree.CallExpressionArgument>,
): boolean => {
  if (recipe.type === AST_NODE_TYPES.SpreadElement) {
    return false;
  }

  const node = skipTypeWrappers(recipe);

  return (
    node.type === AST_NODE_TYPES.ArrowFunctionExpression &&
    Arr.isMaxLengthArray(1, node.params) &&
    node.params.every((param) => param.type !== AST_NODE_TYPES.RestElement)
  );
};

/**
 * The identifier named `expectedName` that `argument` is, inside any type
 * wrappers (`state satisfies State`, `state as State`), or `undefined`.
 */
const findIdentifier = (
  argument: DeepReadonly<TSESTree.CallExpressionArgument>,
  expectedName: string,
): DeepReadonly<TSESTree.Identifier> | undefined => {
  if (argument.type === AST_NODE_TYPES.SpreadElement) {
    return undefined;
  }

  const node = skipTypeWrappers(argument);

  return node.type === AST_NODE_TYPES.Identifier && node.name === expectedName
    ? node
    : undefined;
};

const hasOtherReferences = (
  context: DeepReadonly<TSESLint.RuleContext<MessageIds, []>>,
  parameterName: string,
  baseIdentifier: DeepReadonly<TSESTree.Identifier>,
): boolean => {
  const scope = context.sourceCode.getScope(castDeepMutable(baseIdentifier));

  const variable = scope.variables.find(
    (variableItem) => variableItem.name === parameterName,
  );

  if (variable === undefined) {
    return true;
  }

  return variable.references.some(
    (reference) => reference.identifier !== baseIdentifier,
  );
};
