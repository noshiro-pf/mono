import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { type DeepReadonly } from 'ts-type-forge';
import { castNode, isReactApiCall } from './shared.mjs';

type Options = readonly [
  Readonly<{
    ignoreName?: string | readonly string[];
  }>?,
];

type MessageIds = 'requireReactMemo';

type FunctionNode =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionDeclaration
  | TSESTree.FunctionExpression;

// NOTE:
// 他の react-coding-style のルールは React.memo 化されたコンポーネントの書き方を
// 定めるものなので、 React.memo 化されていないコンポーネントには何も言わない。
// そこを埋めるのがこのルール。
//
// 誤検知を避けるため、未知の関数に渡されたコンポーネント（`memoNamed(...)` のような
// 独自 HOC 経由で memo 化されている可能性があるもの）は報告しない。報告するのは
// どこにも渡されていないコンポーネントと、 React.forwardRef だけで包まれた
// コンポーネント。

export const requireReactMemoRule: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Requires React components to be wrapped with React.memo.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          ignoreName: {
            description: 'Component names allowed to be defined without memo.',
            oneOf: [
              { type: 'string' },
              {
                type: 'array',
                items: { type: 'string' },
                minItems: 0,
              },
            ],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      requireReactMemo:
        'The component "{{ componentName }}" should be memoized. Rewrite as `const {{ componentName }} = React.memo<Props>((props) => { ... });`.',
    },
  },
  create: (context) => {
    const options = context.options[0] ?? {};

    const ignoreNameSet = normalizeNames(options.ignoreName);

    // A component contains more than one JSX node in general, but should be
    // reported once.
    const mut_reportedFunctions = new Set<DeepReadonly<FunctionNode>>();

    const checkElementNode = (node: DeepReadonly<TSESTree.Node>): void => {
      const enclosingFunction = getEnclosingFunction(node);

      if (
        enclosingFunction === undefined ||
        mut_reportedFunctions.has(enclosingFunction)
      ) {
        return;
      }

      const componentExpression = getDefinitionIfNotMemoized(
        context,
        enclosingFunction,
      );

      if (componentExpression === undefined) {
        return;
      }

      const componentId = getComponentId(componentExpression);

      if (componentId === undefined || !isComponentName(componentId.name)) {
        return;
      }

      if (ignoreNameSet.has(componentId.name)) {
        return;
      }

      mut_reportedFunctions.add(enclosingFunction);

      context.report({
        node: castNode(componentId),
        messageId: 'requireReactMemo',
        data: { componentName: componentId.name },
      });
    };

    return {
      JSXElement: checkElementNode,
      JSXFragment: checkElementNode,
      CallExpression: (node: DeepReadonly<TSESTree.CallExpression>) => {
        if (isReactApiCall(context, node, 'createElement')) {
          checkElementNode(node);
        }
      },
    };
  },
  defaultOptions: [{ ignoreName: [] }],
} as const;

const normalizeNames = (
  names: string | undefined | readonly string[],
): ReadonlySet<string> =>
  names === undefined
    ? new Set()
    : typeof names === 'string'
      ? new Set([names])
      : new Set(names);

/** The function the given node belongs to, nested functions being the nearest. */
const getEnclosingFunction = (
  node: DeepReadonly<TSESTree.Node>,
): DeepReadonly<FunctionNode> | undefined => {
  let mut_current: DeepReadonly<TSESTree.Node> = node;

  while (mut_current.type !== AST_NODE_TYPES.Program) {
    if (
      mut_current.type === AST_NODE_TYPES.ArrowFunctionExpression ||
      mut_current.type === AST_NODE_TYPES.FunctionDeclaration ||
      mut_current.type === AST_NODE_TYPES.FunctionExpression
    ) {
      return mut_current;
    }

    mut_current = mut_current.parent;
  }

  return undefined;
};

/**
 * Walks outward through the calls the given node is passed to and returns the
 * expression whose value is what a name is bound to, or `undefined` when the
 * result is memoized or is passed to a function this rule knows nothing about
 * (a custom HOC, a hook, an array callback, ...).
 */
const getDefinitionIfNotMemoized = (
  context: DeepReadonly<TSESLint.RuleContext<MessageIds, Options>>,
  node: DeepReadonly<TSESTree.Node>,
): DeepReadonly<TSESTree.Node> | undefined => {
  const parent = node.type === AST_NODE_TYPES.Program ? undefined : node.parent;

  if (parent?.type !== AST_NODE_TYPES.CallExpression) {
    return node;
  }

  if (parent.callee === node) {
    // An immediately invoked function is not a component definition.
    return undefined;
  }

  if (isReactApiCall(context, parent, 'memo')) {
    return undefined;
  }

  // `React.memo(React.forwardRef(...))` is memoized; `React.forwardRef(...)`
  // alone is not.
  return isReactApiCall(context, parent, 'forwardRef')
    ? getDefinitionIfNotMemoized(context, parent)
    : undefined;
};

/** The name the given expression is bound to, when it is bound to one. */
const getComponentId = (
  node: DeepReadonly<TSESTree.Node>,
): DeepReadonly<TSESTree.Identifier> | undefined => {
  if (node.type === AST_NODE_TYPES.FunctionDeclaration) {
    return node.id ?? undefined;
  }

  const parent = node.type === AST_NODE_TYPES.Program ? undefined : node.parent;

  if (
    parent?.type === AST_NODE_TYPES.VariableDeclarator &&
    parent.init === node &&
    parent.id.type === AST_NODE_TYPES.Identifier
  ) {
    return parent.id;
  }

  return undefined;
};

const componentNamePattern = /^[A-Z]/u;

const isComponentName = (name: string): boolean =>
  componentNamePattern.test(name);
