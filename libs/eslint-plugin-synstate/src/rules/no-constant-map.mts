import {
  AST_NODE_TYPES,
  ASTUtils,
  TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  buildCalleeResolver,
  getImportDeclarations,
  getRangeWithParens,
  isShadowedCallee,
  skipTypeWrappers,
} from 'eslint-rule-forge';
import { SYNSTATE_MODULE } from './constants.mjs';

type Options = readonly [];

type MessageIds = 'constantMap';

/**
 * `map` passes on a result only when it is not `Object.is` the one it holds, so
 * `click$.pipe(map(() => true))` emits on the first click and on none after it.
 * `map(() => true, { equals: () => false })` emits on every one. A `map` given
 * options is left alone: its author has said how results compare.
 *
 * Only a function that returns the same value every time it runs is reported
 * (`isConstantFunction`; the README lists what that covers), since a body that
 * computes may give a new value each time.
 */
export const noConstantMap: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require `{ equals: () => false }` on `map(() => c)`, since `map` stops every result after the first as equal to the one it holds.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      constantMap:
        '`map` does not pass on a result equal to the one it holds, so this emits once and then never again. Give it `{ equals: () => false }` to emit on every source value.',
    },
    defaultOptions: [],
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const imports = getImportDeclarations(sourceCode.ast, SYNSTATE_MODULE);

    const resolveCallee = buildCalleeResolver(imports);

    return {
      CallExpression: (node) => {
        const resolved = resolveCallee(node.callee);

        if (
          resolved?.canonicalName !== 'map' ||
          isShadowedCallee(sourceCode, resolved, SYNSTATE_MODULE) ||
          node.arguments.length !== 1
        ) {
          return;
        }

        const [argument] = node.arguments;

        if (
          argument === undefined ||
          !isConstantFunction(sourceCode, argument)
        ) {
          return;
        }

        const argumentRange = getRangeWithParens(sourceCode, argument);

        context.report({
          node,
          messageId: 'constantMap',
          fix: (fixer) =>
            fixer.insertTextAfterRange(
              argumentRange,
              ', { equals: () => false }',
            ),
        });
      },
    };
  },
} as const;

/**
 * Whether `identifier` names a `const` or an import, or is the global
 * `undefined`. A `let`, a parameter or any other global may hold another value
 * the next time it is read.
 */
const isConstantBinding = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  identifier: TSESTree.Identifier,
): boolean => {
  const variable = ASTUtils.findVariable(
    sourceCode.getScope(identifier),
    identifier.name,
  );

  if (variable === null || variable.defs.length === 0) {
    return identifier.name === 'undefined';
  }

  // An import is read as constant, though an ES import is a live binding: a
  // module that reassigns an exported `let` defeats it. The rule reads one
  // file, and the README says that it takes imports to be constant.
  return variable.defs.every(
    (def) =>
      def.type === TSESLint.Scope.DefinitionType.ImportBinding ||
      (def.type === TSESLint.Scope.DefinitionType.Variable &&
        def.parent.kind === 'const'),
  );
};

/**
 * Whether `expression` is a primitive written in place: a literal other than a
 * regular expression, a template literal with no expression, or `-` or `+` of
 * one of those.
 */
const isWrittenPrimitive = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  expression: TSESTree.Expression,
): boolean => {
  const unwrapped = skipTypeWrappers(expression);

  if (unwrapped.type === AST_NODE_TYPES.Literal) {
    return !unwrapped.raw.startsWith('/');
  }

  if (unwrapped.type === AST_NODE_TYPES.TemplateLiteral) {
    return unwrapped.expressions.length === 0;
  }

  return (
    unwrapped.type === AST_NODE_TYPES.UnaryExpression &&
    (unwrapped.operator === '-' || unwrapped.operator === '+') &&
    isWrittenPrimitive(unwrapped.argument)
  );
};

/**
 * Whether `expression`, read through its type wrappers, is a constant that is
 * not an object, so that `-` and `+` of it give the same value each time (save
 * `+` of a bigint, which throws; see {@link isBigint}): what
 * {@link isWrittenPrimitive} accepts, the global `undefined`, or a `const`
 * named alone (not destructured) and initialized with what `isWrittenPrimitive`
 * accepts. Any other name may hold an object whose `valueOf` answers
 * differently each time.
 */
const isPrimitiveConstant = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  expression: TSESTree.Expression,
): boolean => {
  const unwrapped = skipTypeWrappers(expression);

  if (unwrapped.type === AST_NODE_TYPES.Identifier) {
    const variable = ASTUtils.findVariable(
      sourceCode.getScope(unwrapped),
      unwrapped.name,
    );

    if (variable === null || variable.defs.length === 0) {
      return unwrapped.name === 'undefined';
    }

    const [def, ...rest] = variable.defs;

    return (
      rest.length === 0 &&
      def?.type === TSESLint.Scope.DefinitionType.Variable &&
      def.parent.kind === 'const' &&
      def.node.id.type === AST_NODE_TYPES.Identifier &&
      def.node.init !== null &&
      isWrittenPrimitive(def.node.init)
    );
  }

  return isWrittenPrimitive(unwrapped);
};

/**
 * Whether `expression`, read through its type wrappers, is a bigint written in
 * place: a bigint literal or `-` of one.
 */
const isWrittenBigint = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  expression: TSESTree.Expression,
): boolean => {
  const unwrapped = skipTypeWrappers(expression);

  return unwrapped.type === AST_NODE_TYPES.Literal
    ? typeof unwrapped.value === 'bigint'
    : unwrapped.type === AST_NODE_TYPES.UnaryExpression &&
        unwrapped.operator === '-' &&
        isWrittenBigint(unwrapped.argument);
};

/**
 * Whether `expression`, read through its type wrappers, is a bigint: one
 * written in place, a `const` named alone (not destructured) and initialized
 * with one, or `-` of anything this accepts. A `const` is followed one step
 * only, so that one naming itself ends.
 */
const isBigint = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  expression: TSESTree.Expression,
): boolean => {
  const unwrapped = skipTypeWrappers(expression);

  if (unwrapped.type === AST_NODE_TYPES.UnaryExpression) {
    return (
      unwrapped.operator === '-' && isBigint(sourceCode, unwrapped.argument)
    );
  }

  if (unwrapped.type !== AST_NODE_TYPES.Identifier) {
    return isWrittenBigint(unwrapped);
  }

  const variable = ASTUtils.findVariable(
    sourceCode.getScope(unwrapped),
    unwrapped.name,
  );

  const def = variable?.defs.length === 1 ? variable.defs[0] : undefined;

  return (
    def?.type === TSESLint.Scope.DefinitionType.Variable &&
    def.parent.kind === 'const' &&
    // Not seen in the result while `isPrimitiveConstant` refuses the same
    // names, but a destructured name is not its initializer here either.
    def.node.id.type === AST_NODE_TYPES.Identifier &&
    def.node.init !== null &&
    isWrittenBigint(def.node.init)
  );
};

/**
 * Whether `expression`, read through its type wrappers, is the same value each
 * time it is evaluated: a literal other than a regular expression (each
 * evaluation of which makes a new object), a template literal with no
 * expression, `undefined`, a `const` or an import, `!` or `void` of one of
 * those, or `-` or `+` of one that {@link isPrimitiveConstant} accepts or of
 * such a `!`, `void`, `-` or `+` — but not `+` of a bigint, which throws.
 */
const isConstant = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  expression: TSESTree.Expression,
): boolean => {
  const unwrapped = skipTypeWrappers(expression);

  if (unwrapped.type === AST_NODE_TYPES.Literal) {
    // Only a regular expression is written starting with `/`.
    return !unwrapped.raw.startsWith('/');
  }

  if (unwrapped.type === AST_NODE_TYPES.TemplateLiteral) {
    return unwrapped.expressions.length === 0;
  }

  if (unwrapped.type === AST_NODE_TYPES.Identifier) {
    return isConstantBinding(sourceCode, unwrapped);
  }

  if (unwrapped.type !== AST_NODE_TYPES.UnaryExpression) {
    return false;
  }

  switch (unwrapped.operator) {
    case '!':
    case 'void':
      return isConstant(sourceCode, unwrapped.argument);

    case '-':
    case '+': {
      const argument = skipTypeWrappers(unwrapped.argument);

      // `+` of a bigint throws each time it runs.
      if (unwrapped.operator === '+' && isBigint(sourceCode, argument)) {
        return false;
      }

      // `!`, `void`, `-` and `+` give a boolean, `undefined`, a number or a
      // bigint, never an object, when this function accepts them.
      return argument.type === AST_NODE_TYPES.UnaryExpression &&
        (argument.operator === '!' ||
          argument.operator === 'void' ||
          argument.operator === '-' ||
          argument.operator === '+')
        ? isConstant(sourceCode, argument)
        : isPrimitiveConstant(sourceCode, argument);
    }

    case '~':
    case 'delete':
    case 'typeof':
      return false;
  }
};

/**
 * Whether a function body does nothing but give one value that
 * {@link isConstant} accepts: an expression body, a block of one `return` of
 * such a value, or a block that returns `undefined` (an empty one, or one bare
 * `return`).
 */
const returnsConstant = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  body: TSESTree.BlockStatement | TSESTree.Expression,
): boolean => {
  if (body.type !== AST_NODE_TYPES.BlockStatement) {
    return isConstant(sourceCode, body);
  }

  const [statement, ...rest] = body.body;

  if (statement === undefined) {
    return true;
  }

  return (
    rest.length === 0 &&
    statement.type === AST_NODE_TYPES.ReturnStatement &&
    (statement.argument === null || isConstant(sourceCode, statement.argument))
  );
};

/**
 * Whether `argument` is a function that returns the same value every time it
 * runs: an arrow function or a function expression, neither async nor a
 * generator, whose body {@link returnsConstant} accepts. Its parameters are not
 * read: a default or a destructuring runs code, but nothing it runs changes a
 * constant that the body returns.
 */
const isConstantFunction = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  argument: TSESTree.CallExpressionArgument,
): boolean => {
  const fn = skipTypeWrappers(argument);

  return (
    (fn.type === AST_NODE_TYPES.ArrowFunctionExpression ||
      fn.type === AST_NODE_TYPES.FunctionExpression) &&
    !fn.async &&
    !fn.generator &&
    returnsConstant(sourceCode, fn.body)
  );
};
