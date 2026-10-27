import {
  AST_NODE_TYPES,
  ASTUtils,
  TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  buildCalleeResolver,
  buildNamedImportFix,
  getArgumentText,
  getImportDeclarations,
  getImportedLocalName,
  getRangeWithParens,
  skipTypeWrappers,
  type ResolvedCallee,
} from 'eslint-rule-forge';
import { SYNSTATE_MODULE } from './constants.mjs';
import { isShadowedCallee, replacementCallee } from './synstate-callee.mjs';

type Options = readonly [];

type MessageIds = 'preferMapTo';

/**
 * `map` passes on a result only when it is not `Object.is` the one it holds,
 * so `click$.pipe(map(() => true))` emits on the first click and on none
 * after it. `mapTo(true)` emits on every one. A `map` given `equals` is left
 * alone: its author has said how results compare.
 *
 * Only a body that is the same value every time it runs is reported — a
 * literal other than a regular expression, `undefined`, or a `const` or an
 * import — because `mapTo` evaluates its value once.
 */
export const preferMapTo: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require `mapTo(c)` instead of `map(() => c)`, since `map` stops every result after the first as equal, while `mapTo` emits on every source value.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferMapTo:
        '`map` does not pass on a result equal to the one it holds, so this emits once and then never again. Use `mapTo(...)`, which emits on every source value.',
    },
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const program = sourceCode.ast;

    const imports = getImportDeclarations(program, SYNSTATE_MODULE);

    const resolveCallee = buildCalleeResolver(imports);

    const importedMapTo = getImportedLocalName(imports, 'mapTo');

    const mut_reports: Readonly<{
      node: TSESTree.CallExpression;
      resolved: ResolvedCallee;
      body: TSESTree.Expression;
    }>[] = [];

    return {
      CallExpression: (node) => {
        const resolved = resolveCallee(node.callee);

        if (
          resolved?.canonicalName !== 'map' ||
          isShadowedCallee(sourceCode, node.callee) ||
          node.arguments.length !== 1
        ) {
          return;
        }

        const [argument] = node.arguments;

        if (argument === undefined) {
          return;
        }

        const body = constantBodyOf(sourceCode, argument);

        if (body === undefined) {
          return;
        }

        mut_reports.push({ node, resolved, body });
      },
      'Program:exit': () => {
        // The import goes with the first report that needs it, and with no
        // other: two insertions at the start of the file conflict, and one
        // of them would be dropped.
        let mut_importPlanned = false;

        for (const { node, resolved, body } of mut_reports) {
          const calleeText = replacementCallee(
            sourceCode,
            node,
            resolved,
            'mapTo',
            importedMapTo,
          );

          const addsImport =
            calleeText !== undefined &&
            !resolved.isNamespace &&
            importedMapTo === undefined &&
            !mut_importPlanned;

          if (addsImport) {
            mut_importPlanned = true;
          }

          context.report({
            node,
            messageId: 'preferMapTo',
            fix:
              calleeText === undefined
                ? null
                : (fixer) => [
                    ...(addsImport
                      ? buildNamedImportFix(fixer, program, SYNSTATE_MODULE, [
                          'mapTo',
                        ])
                      : []),
                    resolved.isNamespace
                      ? fixer.replaceText(resolved.propertyNode, calleeText)
                      : fixer.replaceTextRange(
                          getRangeWithParens(sourceCode, node.callee),
                          calleeText,
                        ),
                    fixer.replaceTextRange(
                      getRangeWithParens(sourceCode, node.arguments[0] ?? node),
                      getArgumentText(sourceCode, body),
                    ),
                  ],
          });
        }
      },
    };
  },
  defaultOptions: [],
} as const;

/**
 * The body of `argument` when it is an arrow function that returns the same
 * value every time it runs: simple parameters, which run nothing, and an
 * expression body that {@link isConstant} accepts.
 */
const constantBodyOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  argument: TSESTree.CallExpressionArgument,
): TSESTree.Expression | undefined => {
  const fn = skipTypeWrappers(argument);

  return fn.type === AST_NODE_TYPES.ArrowFunctionExpression &&
    !fn.async &&
    fn.body.type !== AST_NODE_TYPES.BlockStatement &&
    fn.params.every((param) => param.type === AST_NODE_TYPES.Identifier) &&
    isConstant(sourceCode, fn.body)
    ? fn.body
    : undefined;
};

/**
 * Whether `expression`, read through its type wrappers, is the same value
 * each time it is evaluated: a literal other than a regular expression (each
 * evaluation of which makes a new object), a template literal with no
 * expression, `undefined`, a `const` or an import, or `-`, `+`, `!` or `void`
 * of one of those.
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

  return (
    unwrapped.type === AST_NODE_TYPES.UnaryExpression &&
    (unwrapped.operator === '-' ||
      unwrapped.operator === '+' ||
      unwrapped.operator === '!' ||
      unwrapped.operator === 'void') &&
    isConstant(sourceCode, unwrapped.argument)
  );
};

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

  return variable.defs.every(
    (def) =>
      def.type === TSESLint.Scope.DefinitionType.ImportBinding ||
      (def.type === TSESLint.Scope.DefinitionType.Variable &&
        def.parent.kind === 'const'),
  );
};
