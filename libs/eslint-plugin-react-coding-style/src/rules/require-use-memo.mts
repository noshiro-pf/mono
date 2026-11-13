import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { skipTypeWrappers } from 'eslint-rule-forge';
import { Arr, hasKey, isRecord } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import {
  calleePath,
  castNode,
  isComponentFunction,
  isHookFunction,
  isHookName,
  jsxNodeVisitors,
  markFunctionsContainingJsx,
  type FunctionNode,
} from './shared.mjs';

type Options = readonly [
  Readonly<{
    allowedCalls?: readonly string[];
    componentWrappers?: readonly string[];
  }>?,
];

type MessageIds = 'requireUseMemo';

// NOTE:
// コンポーネント本体の直下で宣言する変数は、描画のたびに計算し直される。値が
// primitive の O(1) 計算（プロパティの参照・演算子・テンプレートリテラル）でなければ
// `React.useMemo`（関数なら `React.useCallback`）で包むか、コンポーネントの外へ
// 出させる。O(1) かどうかは構文からは分からないので、フック以外の関数呼び出しは
// `allowedCalls` に挙げたものを除いてすべて報告する。
//
// フックはネストしたブロックの中で呼べないので、見るのは本体直下の宣言だけ。
// `_` で始まる名前（実行時に読まない値）は報告しない。

export const requireUseMemoRule: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Requires a value a React component or hook computes on every render to be memoized unless it is a primitive O(1) expression.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedCalls: {
            description:
              'Functions whose call is O(1) and returns a primitive, in addition to the defaults (`Math.*`, `Number`, `Number.*`, `String`, `Boolean`, `Object.is`, `*.toFixed`, `*.toString`). `"a.*"` allows every `a.x`, and `"*.x"` every method `x`.',
            type: 'array',
            items: { type: 'string' },
          },
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
      requireUseMemo:
        '"{{ name }}" is computed again on every render. Wrap it in `React.useMemo` (`React.useCallback` for a function), or move it out of the component if it uses neither props nor state.',
    },
    defaultOptions: [{ allowedCalls: [], componentWrappers: [] }],
  },
  create: (context) => {
    const options = context.options[0] ?? {};

    const allowedCalls: readonly string[] = [
      ...defaultAllowedCalls,
      ...(options.allowedCalls ?? []),
    ];

    const componentWrappers = new Set(options.componentWrappers);

    const isTrivial = (node: DeepReadonly<TSESTree.Node>): boolean => {
      const expr = skipTypeWrappers(node);

      if (expr.type === AST_NODE_TYPES.Literal) {
        return !(isRecord(expr) && hasKey(expr, 'regex'));
      }

      if (
        expr.type === AST_NODE_TYPES.Identifier ||
        expr.type === AST_NODE_TYPES.ThisExpression ||
        expr.type === AST_NODE_TYPES.PrivateIdentifier ||
        expr.type === AST_NODE_TYPES.MetaProperty
      ) {
        return true;
      }

      if (expr.type === AST_NODE_TYPES.TemplateLiteral) {
        return expr.expressions.every(isTrivial);
      }

      if (expr.type === AST_NODE_TYPES.MemberExpression) {
        return (
          isTrivial(expr.object) && (!expr.computed || isTrivial(expr.property))
        );
      }

      if (expr.type === AST_NODE_TYPES.ChainExpression) {
        return isTrivial(expr.expression);
      }

      if (expr.type === AST_NODE_TYPES.UnaryExpression) {
        return expr.operator !== 'delete' && isTrivial(expr.argument);
      }

      if (
        expr.type === AST_NODE_TYPES.BinaryExpression ||
        expr.type === AST_NODE_TYPES.LogicalExpression
      ) {
        return isTrivial(expr.left) && isTrivial(expr.right);
      }

      if (expr.type === AST_NODE_TYPES.ConditionalExpression) {
        return (
          isTrivial(expr.test) &&
          isTrivial(expr.consequent) &&
          isTrivial(expr.alternate)
        );
      }

      return expr.type === AST_NODE_TYPES.CallExpression && isTrivialCall(expr);
    };

    const isTrivialCall = (
      expr: DeepReadonly<TSESTree.CallExpression>,
    ): boolean => {
      const path = calleePath(expr.callee);

      if (path !== undefined && isHookName(path.at(-1) ?? '')) {
        return true;
      }

      const argumentsAreTrivial = expr.arguments.every(
        (arg) => arg.type !== AST_NODE_TYPES.SpreadElement && isTrivial(arg),
      );

      if (path !== undefined) {
        return isAllowedCall(allowedCalls, path) && argumentsAreTrivial;
      }

      // A method allowed on any value (`*.toFixed`), called on an O(1)
      // receiver: `(a / b).toFixed(1)`.
      const callee = skipTypeWrappers(expr.callee);

      return (
        callee.type === AST_NODE_TYPES.MemberExpression &&
        !callee.computed &&
        callee.property.type === AST_NODE_TYPES.Identifier &&
        allowedCalls.includes(`*.${callee.property.name}`) &&
        isTrivial(callee.object) &&
        argumentsAreTrivial
      );
    };

    /** The names in a binding pattern whose value is built on every render. */
    const builtNames = (
      pattern: DeepReadonly<TSESTree.Node>,
    ): readonly DeepReadonly<TSESTree.Identifier>[] => {
      if (pattern.type === AST_NODE_TYPES.ObjectPattern) {
        return pattern.properties.flatMap((property) =>
          property.type === AST_NODE_TYPES.RestElement
            ? bindingIdentifiers(property.argument)
            : builtNames(property.value),
        );
      }

      if (pattern.type === AST_NODE_TYPES.ArrayPattern) {
        return pattern.elements.flatMap((element) =>
          element === null
            ? []
            : element.type === AST_NODE_TYPES.RestElement
              ? bindingIdentifiers(element.argument)
              : builtNames(element),
        );
      }

      if (pattern.type === AST_NODE_TYPES.AssignmentPattern) {
        return isTrivial(pattern.right)
          ? builtNames(pattern.left)
          : bindingIdentifiers(pattern.left);
      }

      return [];
    };

    const mut_functionsContainingJsx = new Set<DeepReadonly<FunctionNode>>();

    const check = (fn: DeepReadonly<FunctionNode>): void => {
      // An async component (a server component) cannot call hooks.
      if (
        fn.body.type !== AST_NODE_TYPES.BlockStatement ||
        fn.async ||
        fn.generator ||
        !(
          isHookFunction(fn) ||
          isComponentFunction(context, fn, {
            containsJsx: mut_functionsContainingJsx.has(fn),
            componentWrappers,
          })
        )
      ) {
        return;
      }

      for (const statement of fn.body.body) {
        if (statement.type !== AST_NODE_TYPES.VariableDeclaration) {
          continue;
        }

        for (const declarator of statement.declarations) {
          if (declarator.init === null) {
            continue;
          }

          const names = isTrivial(declarator.init)
            ? builtNames(declarator.id)
            : bindingIdentifiers(declarator.id);

          // A name starting with `_` is not read at run time (a rest element
          // kept for a type check, say), so its value is never used.
          for (const id of names) {
            if (!id.name.startsWith('_')) {
              context.report({
                node: castNode(id),
                messageId: 'requireUseMemo',
                data: { name: id.name },
              });
            }
          }
        }
      }
    };

    const markJsx = (node: DeepReadonly<TSESTree.Node>): void => {
      markFunctionsContainingJsx(mut_functionsContainingJsx, node);
    };

    // On exit, when every JSX node in the function has been seen.
    return {
      ...jsxNodeVisitors(context, markJsx),
      'ArrowFunctionExpression:exit': check,
      'FunctionDeclaration:exit': check,
      'FunctionExpression:exit': check,
    };
  },
} as const;

const defaultAllowedCalls = [
  'Math.*',
  'Number',
  'Number.*',
  'String',
  'Boolean',
  'Object.is',
  '*.toFixed',
  '*.toString',
] as const;

const isAllowedCall = (
  allowedCalls: readonly string[],
  path: readonly string[],
): boolean => {
  const name = path.join('.');

  const owner = Arr.butLast(path).join('.');

  const method = path.at(-1);

  return allowedCalls.some((allowed) =>
    allowed.startsWith('*.')
      ? path.length > 1 && allowed.slice(2) === method
      : allowed.endsWith('.*')
        ? path.length > 1 && allowed.slice(0, -2) === owner
        : allowed === name,
  );
};

const bindingIdentifiers = (
  pattern: DeepReadonly<TSESTree.Node>,
): readonly DeepReadonly<TSESTree.Identifier>[] => {
  if (pattern.type === AST_NODE_TYPES.Identifier) {
    return [pattern];
  }

  if (pattern.type === AST_NODE_TYPES.ObjectPattern) {
    return pattern.properties.flatMap((property) =>
      property.type === AST_NODE_TYPES.RestElement
        ? bindingIdentifiers(property.argument)
        : bindingIdentifiers(property.value),
    );
  }

  if (pattern.type === AST_NODE_TYPES.ArrayPattern) {
    return pattern.elements.flatMap((element) =>
      element === null ? [] : bindingIdentifiers(element),
    );
  }

  if (
    pattern.type === AST_NODE_TYPES.AssignmentPattern ||
    pattern.type === AST_NODE_TYPES.RestElement
  ) {
    return bindingIdentifiers(
      pattern.type === AST_NODE_TYPES.AssignmentPattern
        ? pattern.left
        : pattern.argument,
    );
  }

  return [];
};
