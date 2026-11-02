import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { skipTypeWrappers } from 'eslint-rule-forge';
import { Arr } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import {
  castNode,
  isComponentFunction,
  isReactApiCall,
  jsxNodeVisitors,
  markFunctionsContainingJsx,
  type FunctionNode,
} from './shared.mjs';

type Options = readonly [
  Readonly<{
    componentWrappers?: readonly string[];
  }>?,
];

type MessageIds = 'singleJsxReturn';

// NOTE:
// JSX を返す関数（コンポーネントや描画用のコールバック）の return 文を一つに
// まとめさせる。早期 return で分岐すると、描画結果の全体が一つの式として読めず、
// 分岐の後ろに書いたフック呼び出しや変数の計算が分岐の前提に依存してしまう。
// 分岐は返す JSX の中の条件式で書く。
//
// 対象は、どれかの return が JSX を返す関数と、コンポーネント（JSX を変数や
// `.map` 経由で返すものを含む）。報告するのは最後の return 文より前のもの。
// `return null;` や `return;` も数える。関数の最後の文である `switch` の各 case
// 直下の return は、まとめて一つと数える（union の網羅的な分岐は条件式では
// 書きにくいため）。

export const singleJsxReturnRule: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Requires a function that returns JSX to have only one return statement.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          componentWrappers: {
            description:
              'Higher order components besides `React.memo` and `React.forwardRef`: a function passed to them is a component.',
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      singleJsxReturn:
        'This function returns JSX from more than one return statement. Return a single expression and branch inside it, e.g. `return cond ? <A /> : <B />;`.',
    },
    defaultOptions: [{ componentWrappers: [] }],
  },
  create: (context) => {
    const componentWrappers = new Set(context.options[0]?.componentWrappers);

    const mut_functionsContainingJsx = new Set<DeepReadonly<FunctionNode>>();

    // One entry per function being visited, innermost last: its returns so far.
    const mut_returnsStack: (readonly DeepReadonly<TSESTree.ReturnStatement>[])[] =
      [];

    const enter = (): void => {
      mut_returnsStack.push([]);
    };

    const exit = (fn: DeepReadonly<FunctionNode>): void => {
      const returns = mut_returnsStack.pop() ?? [];

      if (returns.length < 2) {
        return;
      }

      const returnsJsx = returns.some(
        (statement) =>
          statement.argument !== null &&
          containsJsx(context, statement.argument),
      );

      if (!(
        returnsJsx ||
        isComponentFunction(context, fn, {
          containsJsx: mut_functionsContainingJsx.has(fn),
          componentWrappers,
        })
      )) {
        return;
      }

      const others = returns.filter(
        (statement) => !isFinalSwitchCaseReturn(fn, statement),
      );

      // The cases of a final `switch` are one exit, as the branches of a
      // conditional expression are.
      const toReport =
        others.length < returns.length ? others : Arr.butLast(others);

      for (const statement of toReport) {
        context.report({
          node: castNode(statement),
          messageId: 'singleJsxReturn',
        });
      }
    };

    const markJsx = (node: DeepReadonly<TSESTree.Node>): void => {
      markFunctionsContainingJsx(mut_functionsContainingJsx, node);
    };

    return {
      ...jsxNodeVisitors(context, markJsx),
      ArrowFunctionExpression: enter,
      FunctionDeclaration: enter,
      FunctionExpression: enter,
      'ArrowFunctionExpression:exit': exit,
      'FunctionDeclaration:exit': exit,
      'FunctionExpression:exit': exit,
      ReturnStatement: (node: DeepReadonly<TSESTree.ReturnStatement>) => {
        const current = mut_returnsStack.pop();

        if (current !== undefined) {
          mut_returnsStack.push(Arr.toPushed(current, node));
        }
      },
    };
  },
} as const;

/**
 * Whether the value of `node` may be a JSX element: JSX itself, a
 * `React.createElement` call, or an array literal or a conditional or logical
 * expression with one among its results, through type wrappers.
 */
const containsJsx = (
  context: DeepReadonly<TSESLint.RuleContext<MessageIds, Options>>,
  node: DeepReadonly<TSESTree.Node>,
): boolean => {
  const expr = skipTypeWrappers(node);

  if (
    expr.type === AST_NODE_TYPES.JSXElement ||
    expr.type === AST_NODE_TYPES.JSXFragment
  ) {
    return true;
  }

  if (expr.type === AST_NODE_TYPES.ConditionalExpression) {
    return (
      containsJsx(context, expr.consequent) ||
      containsJsx(context, expr.alternate)
    );
  }

  if (expr.type === AST_NODE_TYPES.ArrayExpression) {
    return expr.elements.some(
      (element) =>
        element !== null &&
        element.type !== AST_NODE_TYPES.SpreadElement &&
        containsJsx(context, element),
    );
  }

  if (expr.type === AST_NODE_TYPES.LogicalExpression) {
    return containsJsx(context, expr.left) || containsJsx(context, expr.right);
  }

  return (
    expr.type === AST_NODE_TYPES.CallExpression &&
    isReactApiCall(context, expr, 'createElement')
  );
};

/**
 * Whether `statement` is a return directly in a case of the `switch` that is
 * the last statement of `fn`'s body, alone or in a block:
 * `switch (x) { case 'a': return <A />; case 'b': { …; return <B />; } }`.
 */
const isFinalSwitchCaseReturn = (
  fn: DeepReadonly<FunctionNode>,
  statement: DeepReadonly<TSESTree.ReturnStatement>,
): boolean => {
  if (fn.body.type !== AST_NODE_TYPES.BlockStatement) {
    return false;
  }

  const parent =
    statement.parent.type === AST_NODE_TYPES.BlockStatement
      ? statement.parent.parent
      : statement.parent;

  if (parent.type !== AST_NODE_TYPES.SwitchCase) {
    return false;
  }

  const switchStatement = parent.parent;

  return (
    switchStatement.parent === fn.body &&
    fn.body.body.at(-1) === switchStatement
  );
};
