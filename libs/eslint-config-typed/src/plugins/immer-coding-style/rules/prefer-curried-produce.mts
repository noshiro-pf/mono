import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { isTypeWrapper, skipTypeWrappers } from 'eslint-rule-forge';
import { Arr, castDeepMutable, hasKey, isRecord } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';

type MessageIds = 'useCurriedProduce';

type CallExpressionWithLegacyTypeParameters = TSESTree.CallExpression &
  Readonly<{
    typeParameters?: TSESTree.TSTypeParameterInstantiation;
  }>;

/**
 * Rewrites `(state) => produce(state, recipe)` as `produce(recipe)`. The base
 * state is recognized through type wrappers (`produce(state satisfies State,
 * recipe)`), which change nothing at run time and go with the argument; the
 * type an `as` gives it is kept as the type argument (`produce<State>`).
 *
 * The curried form passes its extra arguments on to the recipe (`recipe(draft,
 * ...args)`), so `xs.map((s) => produce(s, r))` → `xs.map(produce(r))` would
 * hand `r` the index and the array. The fix is applied only when the recipe is
 * an arrow function taking at most one parameter, which cannot read them, and
 * only when it is the last argument: a third one (a patch listener) would
 * become the curried form's initial state.
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
  },
  create: (context) => {
    const sourceCode = context.sourceCode;

    return {
      ArrowFunctionExpression: (
        node: DeepReadonly<TSESTree.ArrowFunctionExpression>,
      ) => {
        if (!Arr.isFixedLengthArray(1, node.params)) {
          return;
        }

        const param = node.params[0];

        if (
          param.type !== AST_NODE_TYPES.Identifier ||
          param.name.length === 0
        ) {
          return;
        }

        const { name: parameterName } = param;

        const callExpression = node.body;

        if (!isProduceCall(callExpression)) {
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

        const baseIdentifier = findIdentifier(baseArgument, parameterName);

        if (baseIdentifier === undefined) {
          return;
        }

        if (hasOtherReferences(context, parameterName, baseIdentifier)) {
          return;
        }

        report(context, {
          arrowFunction: node,
          baseArgument,
          callExpression,
          remainingArguments: restArguments,
          sourceCode,
        });
      },
    };
  },
  defaultOptions: [],
} as const;

type ReportContext = Readonly<{
  arrowFunction: DeepReadonly<TSESTree.ArrowFunctionExpression>;
  baseArgument: DeepReadonly<TSESTree.CallExpressionArgument>;
  callExpression: DeepReadonly<TSESTree.CallExpression>;
  remainingArguments: readonly DeepReadonly<TSESTree.CallExpressionArgument>[];
  sourceCode: Readonly<{
    getText: TSESLint.SourceCode['getText'];
  }>;
}>;

const report = (
  context: DeepReadonly<TSESLint.RuleContext<MessageIds, []>>,
  {
    arrowFunction,
    baseArgument,
    callExpression,
    remainingArguments,
    sourceCode,
  }: ReportContext,
): void => {
  const calleeText = sourceCode.getText(castDeepMutable(callExpression.callee));

  const typeParametersText = getTypeParametersText({
    arrowFunction,
    baseArgument,
    callExpression,
    sourceCode,
  });

  const remainingArgumentsText = remainingArguments
    .map((argument) =>
      normalizeMultilineText(sourceCode.getText(castDeepMutable(argument))),
    )
    .join(', ');

  const replacement =
    `${calleeText}${typeParametersText}(${remainingArgumentsText})` as const;

  context.report({
    node: castDeepMutable(arrowFunction),
    messageId: 'useCurriedProduce',
    fix: (fixer) =>
      fixer.replaceText(castDeepMutable(arrowFunction), replacement),
  });
};

const isProduceCall = (
  node: DeepReadonly<TSESTree.Node>,
): node is TSESTree.CallExpression => {
  if (node.type !== AST_NODE_TYPES.CallExpression) {
    return false;
  }

  return (
    node.callee.type === AST_NODE_TYPES.Identifier &&
    node.callee.name === 'produce'
  );
};

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
 * wrappers (`state satisfies State`, `state!`), or `undefined`.
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

const getTypeParametersText = ({
  arrowFunction,
  baseArgument,
  callExpression,
  sourceCode,
}: Readonly<{
  arrowFunction: DeepReadonly<TSESTree.ArrowFunctionExpression>;
  baseArgument: DeepReadonly<TSESTree.CallExpressionArgument>;
  callExpression: DeepReadonly<TSESTree.CallExpression>;
  sourceCode: Readonly<{
    getText: TSESLint.SourceCode['getText'];
  }>;
}>): string => {
  const typeArguments = getTypeArguments(callExpression);

  if (typeArguments !== undefined) {
    return sourceCode.getText(castDeepMutable(typeArguments));
  }

  // `produce(state as State, recipe)` infers its base type from the cast.
  const assertedType = getAssertedType(baseArgument);

  if (assertedType !== undefined) {
    return `<${sourceCode.getText(castDeepMutable(assertedType))}>`;
  }

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

/**
 * The type the outermost `as` or `<T>` among `node`'s type wrappers gives it,
 * seen through `satisfies`, `!` and parentheses, or `undefined`.
 */
const getAssertedType = (
  node: DeepReadonly<TSESTree.Node>,
): DeepReadonly<TSESTree.TypeNode> | undefined => {
  if (
    node.type === AST_NODE_TYPES.TSAsExpression ||
    node.type === AST_NODE_TYPES.TSTypeAssertion
  ) {
    return node.typeAnnotation;
  }

  return isTypeWrapper(node) ? getAssertedType(node.expression) : undefined;
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
