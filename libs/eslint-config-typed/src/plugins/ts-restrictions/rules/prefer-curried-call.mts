import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import * as ts from 'typescript';

type Options = readonly [];

type MessageIds = 'useFunctionDirectly' | 'useCurriedForm';

/**
 * Replaces a redundant arrow wrapper around a function call with a point-free
 * form, using the callee's curried version when one exists:
 *
 * - `(a) => f(a)` → `f` — only when `f` is effectively unary, so passing it
 *   directly cannot change behavior even when the wrapper is used as a
 *   multi-argument callback (`arr.map((a) => f(a))` → `arr.map(f)`). This is
 *   what keeps the classic `arr.map((s) => parseInt(s))` case (where `parseInt`
 *   also reads the index) from being rewritten.
 * - `(a) => f(a, ...rest)` → `f(...rest)` — only when `f` has a curried call
 *   signature accepting `...rest` and returning a one-argument function, i.e.
 *   a genuine curried version (`(a) => toPushed(a, x)` → `toPushed(x)`).
 *
 * The arrow's single parameter must appear exactly once, as the first argument
 * of the call, so dropping the wrapper is behavior-preserving.
 */
export const preferCurriedCall: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace a redundant arrow wrapper with the function itself (`(a) => f(a)` → `f`) or, when the callee has a curried version, its curried form (`(a) => f(a, ...rest)` → `f(...rest)`).',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useFunctionDirectly:
        'Replace the redundant arrow wrapper `{{original}}` with `{{replacement}}`.',
      useCurriedForm:
        'Replace the arrow wrapper `{{original}}` with the curried call `{{replacement}}`.',
    },
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const services = ESLintUtils.getParserServices(context);

    const checker = services.program.getTypeChecker();

    const getType = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      node: TSESTree.Node,
    ): ts.Type =>
      checker.getTypeAtLocation(services.esTreeNodeToTSNodeMap.get(node));

    /**
     * `true` when `node` refers to a module/namespace object (e.g. a namespace
     * imported as `Arr`). Referencing `Namespace.fn` as a value is safe because
     * namespace members do not depend on a dynamic `this`, unlike instance
     * methods (`obj.method`), which would lose their receiver.
     */
    const isNamespaceObject = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      node: TSESTree.Node,
    ): boolean => {
      const symbol = checker.getSymbolAtLocation(
        services.esTreeNodeToTSNodeMap.get(node),
      );

      if (symbol === undefined) return false;

      const resolved =
        (symbol.flags & ts.SymbolFlags.Alias) !== 0
          ? checker.getAliasedSymbol(symbol)
          : symbol;

      return (
        (resolved.flags &
          (ts.SymbolFlags.ValueModule | ts.SymbolFlags.NamespaceModule)) !==
        0
      );
    };

    /**
     * For the eta reduction `(a) => f(a)` → `f`, the callee must be safe to
     * reference as a bare value: a plain identifier (a standalone function) or
     * a namespace member (`Arr.isNonEmpty`). Instance-method callees are
     * rejected because the point-free form would drop their `this`.
     */
    const isEtaSafeCallee = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      callee: TSESTree.Expression,
    ): boolean => {
      if (callee.type === AST_NODE_TYPES.Identifier) return true;

      if (callee.type === AST_NODE_TYPES.MemberExpression) {
        return !callee.optional && isNamespaceObject(callee.object);
      }

      return false;
    };

    /**
     * `true` when the arrow's single parameter is referenced exactly once, at
     * `argument` — so it appears neither in the callee nor in any other
     * argument, and dropping the wrapper cannot change behavior.
     */
    const paramUsedOnlyAt = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      node: TSESTree.ArrowFunctionExpression,
      paramName: string,
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      argument: TSESTree.Node,
    ): boolean => {
      const scope = sourceCode.getScope(node);

      const variable = scope.variables.find((v) => v.name === paramName);

      if (variable === undefined) return false;

      const [reference] = variable.references;

      return (
        variable.references.length === 1 && reference?.identifier === argument
      );
    };

    return {
      ArrowFunctionExpression: (node) => {
        if (node.async || node.params.length !== 1) return;

        const [param] = node.params;

        if (
          param?.type !== AST_NODE_TYPES.Identifier ||
          param.typeAnnotation !== undefined
        ) {
          return;
        }

        if (node.body.type !== AST_NODE_TYPES.CallExpression) return;

        const call = node.body;

        if (call.optional) return;

        const [firstArg, ...restArgs] = call.arguments;

        if (
          firstArg?.type !== AST_NODE_TYPES.Identifier ||
          firstArg.name !== param.name
        ) {
          return;
        }

        // A spread in the remaining arguments breaks positional arg counting.
        if (restArgs.some((arg) => arg.type === AST_NODE_TYPES.SpreadElement)) {
          return;
        }

        if (!paramUsedOnlyAt(node, param.name, firstArg)) return;

        const calleeType = getType(call.callee);

        const calleeText = sourceCode.getText(call.callee);

        if (restArgs.length === 0) {
          // `(a) => f(a)` → `f`
          if (
            !isEtaSafeCallee(call.callee) ||
            !isEffectivelyUnary(calleeType)
          ) {
            return;
          }

          context.report({
            node,
            messageId: 'useFunctionDirectly',
            data: {
              original: sourceCode.getText(node),
              replacement: calleeText,
            },
            fix: (fixer) => fixer.replaceText(node, calleeText),
          });

          return;
        }

        // `(a) => f(a, ...rest)` → `f(...rest)`
        // Re-evaluating a side-effecting argument once (at currying time)
        // instead of on every call would change behavior, so require the
        // remaining arguments to be free of observable side effects.
        if (
          !restArgs.every(isPureExpression) ||
          !hasCurriedSignature(calleeType, restArgs.length)
        ) {
          return;
        }

        const replacement = `${calleeText}(${restArgs
          .map((arg) => sourceCode.getText(arg))
          .join(', ')})`;

        context.report({
          node,
          messageId: 'useCurriedForm',
          data: {
            original: sourceCode.getText(node),
            replacement,
          },
          fix: (fixer) => fixer.replaceText(node, replacement),
        });
      },
    };
  },
  defaultOptions: [],
} as const;

/**
 * `true` when every call signature of `type` accepts at most one argument, so
 * `(a) => f(a)` is equivalent to `f` even when the wrapper is used as a
 * multi-argument callback (the extra positional arguments are ignored either
 * way). Requires at least one call signature.
 */
const isEffectivelyUnary = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: ts.Type,
): boolean => {
  const signatures = type.getCallSignatures();

  return (
    signatures.length > 0 &&
    signatures.every((signature) => signatureMaxArgs(signature) <= 1)
  );
};

/**
 * `true` when `type` has a curried call signature accepting exactly
 * `restCount` arguments and returning a function that accepts one argument —
 * i.e. `f(...rest)` is the curried form of `f(a, ...rest)`.
 */
const hasCurriedSignature = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  type: ts.Type,
  restCount: number,
): boolean =>
  type.getCallSignatures().some((signature) => {
    if (!isCallableWith(signature, restCount)) return false;

    return signature
      .getReturnType()
      .getCallSignatures()
      .some((inner) => isCallableWith(inner, 1));
  });

const isCallableWith = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  signature: ts.Signature,
  argCount: number,
): boolean =>
  signatureMinArgs(signature) <= argCount &&
  argCount <= signatureMaxArgs(signature);

/** The largest number of positional arguments the signature accepts. */
const signatureMaxArgs = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  signature: ts.Signature,
): number => {
  const params = signature.getParameters();

  const last = params.at(-1);

  return last !== undefined && isRestParameter(last)
    ? Number.POSITIVE_INFINITY
    : params.length;
};

/** The number of leading required parameters (before any optional/rest). */
const signatureMinArgs = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  signature: ts.Signature,
): number => {
  const firstOptional = signature
    .getParameters()
    .findIndex(isOptionalParameter);

  return firstOptional === -1
    ? signature.getParameters().length
    : firstOptional;
};

/** A parameter that collects the rest of the arguments (`...args`). */
const isRestParameter = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  symbol: ts.Symbol,
): boolean => {
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];

  return (
    declaration !== undefined &&
    ts.isParameter(declaration) &&
    declaration.dotDotDotToken !== undefined
  );
};

/** A parameter that may be omitted (`x?`, `x = ...`) or is a rest parameter. */
const isOptionalParameter = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  symbol: ts.Symbol,
): boolean => {
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];

  return (
    declaration !== undefined &&
    ts.isParameter(declaration) &&
    (declaration.questionToken !== undefined ||
      declaration.initializer !== undefined ||
      declaration.dotDotDotToken !== undefined)
  );
};

/**
 * A conservative purity approximation: `true` only for expressions whose
 * evaluation has no observable side effects and does not depend on evaluation
 * count (so hoisting it out of the wrapper is safe). Anything not recognized
 * (calls, `new`, `await`, assignments, updates) is treated as impure.
 */
const isPureExpression = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): boolean => {
  if (
    node.type === AST_NODE_TYPES.Literal ||
    node.type === AST_NODE_TYPES.Identifier ||
    node.type === AST_NODE_TYPES.ThisExpression ||
    node.type === AST_NODE_TYPES.ArrowFunctionExpression ||
    node.type === AST_NODE_TYPES.FunctionExpression
  ) {
    return true;
  }

  if (node.type === AST_NODE_TYPES.TemplateLiteral) {
    return node.expressions.every(isPureExpression);
  }

  if (node.type === AST_NODE_TYPES.MemberExpression) {
    return node.computed
      ? isPureExpression(node.object) && isPureExpression(node.property)
      : isPureExpression(node.object);
  }

  if (node.type === AST_NODE_TYPES.UnaryExpression) {
    return node.operator !== 'delete' && isPureExpression(node.argument);
  }

  if (
    node.type === AST_NODE_TYPES.BinaryExpression ||
    node.type === AST_NODE_TYPES.LogicalExpression
  ) {
    return isPureExpression(node.left) && isPureExpression(node.right);
  }

  if (node.type === AST_NODE_TYPES.ConditionalExpression) {
    return (
      isPureExpression(node.test) &&
      isPureExpression(node.consequent) &&
      isPureExpression(node.alternate)
    );
  }

  if (node.type === AST_NODE_TYPES.ArrayExpression) {
    return node.elements.every(
      (element) =>
        element === null ||
        (element.type !== AST_NODE_TYPES.SpreadElement &&
          isPureExpression(element)),
    );
  }

  if (node.type === AST_NODE_TYPES.ObjectExpression) {
    return node.properties.every(
      (property) =>
        property.type === AST_NODE_TYPES.Property &&
        !property.computed &&
        isPureExpression(property.value),
    );
  }

  return false;
};
