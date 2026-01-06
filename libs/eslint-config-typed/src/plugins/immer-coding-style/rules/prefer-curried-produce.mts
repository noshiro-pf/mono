import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { castDeepMutable, hasKey, isRecord } from 'ts-data-forge';

type MessageIds = 'useCurriedProduce';

type CallExpressionWithLegacyTypeParameters = TSESTree.CallExpression &
  Readonly<{
    typeParameters?: TSESTree.TSTypeParameterInstantiation;
  }>;

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
        if (node.params.length !== 1) {
          return;
        }

        const param = node.params[0];

        if (
          param?.type !== AST_NODE_TYPES.Identifier ||
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
          restArguments.length === 0 ||
          !isSameIdentifier(baseArgument, parameterName)
        ) {
          return;
        }

        if (hasOtherReferences(context, parameterName, baseArgument)) {
          return;
        }

        report(context, {
          arrowFunction: node,
          callExpression,
          remainingArguments: restArguments,
          sourceCode,
        });
      },
    };
  },
  defaultOptions: [],
};

type ReportContext = Readonly<{
  arrowFunction: DeepReadonly<TSESTree.ArrowFunctionExpression>;
  callExpression: DeepReadonly<TSESTree.CallExpression>;
  remainingArguments: readonly DeepReadonly<TSESTree.CallExpressionArgument>[];
  sourceCode: Readonly<{
    getText: TSESLint.SourceCode['getText'];
  }>;
}>;

const report = (
  context: DeepReadonly<TSESLint.RuleContext<MessageIds, readonly []>>,
  {
    arrowFunction,
    callExpression,
    remainingArguments,
    sourceCode,
  }: ReportContext,
): void => {
  const calleeText = sourceCode.getText(castDeepMutable(callExpression.callee));

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

  const replacement = `${calleeText}${typeParametersText}(${remainingArgumentsText})`;

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

const isSameIdentifier = (
  node: DeepReadonly<TSESTree.CallExpressionArgument>,
  expectedName: string,
): node is TSESTree.Identifier =>
  node.type === AST_NODE_TYPES.Identifier && node.name === expectedName;

const hasOtherReferences = (
  context: DeepReadonly<TSESLint.RuleContext<MessageIds, readonly []>>,
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
      mutableNode as TSESTree.CallExpression & {
        typeArguments?: TSESTree.TSTypeParameterInstantiation;
      }
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

  if (returnType !== undefined) {
    return `<${returnType}>`;
  }

  return '';
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

  if (typeAnnotation === undefined) {
    return undefined;
  }

  return sourceCode.getText(castDeepMutable(typeAnnotation));
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

  if (typeAnnotation === undefined) {
    return undefined;
  }

  return sourceCode.getText(castDeepMutable(typeAnnotation));
};

const normalizeMultilineText = (text: string): string => {
  const lines = text.split('\n');

  if (lines.length <= 1) {
    return text;
  }

  const indents = lines
    .slice(1)
    .filter((line) => line.trim().length > 0)
    .map((line) => /^[\t ]*/u.exec(line)?.[0].length ?? 0);

  if (indents.length === 0) {
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
