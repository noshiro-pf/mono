import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { MIN_LENGTH_ARRAY_FN, NON_EMPTY_ARRAY_FN } from './constants.mjs';
import {
  buildCalleeResolver,
  buildImportFix,
  getImportedLocalName,
  getTsFortressImports,
  hasConflictingDeclaration,
} from './import-utils.mjs';

type Options = readonly [];

type MessageIds = 'useNonEmptyArray';

export const preferNonEmptyArray: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace `minLengthArray(1, ...)` with `nonEmptyArray(...)` from ts-fortress.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useNonEmptyArray:
        'Use `{{replacement}}(...)` instead of `{{original}}(1, ...)`: both build the same `NonEmptyArray` type, and `{{replacement}}` reports a clearer `typeName` on validation failure.',
    },
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const program = sourceCode.ast;

    const tsFortressImports = getTsFortressImports(program);

    const resolveCallee = buildCalleeResolver(tsFortressImports);

    const importedLocalName = getImportedLocalName(
      tsFortressImports,
      NON_EMPTY_ARRAY_FN,
    );

    const mut_callsToFix: {
      node: TSESTree.CallExpression;
      propertyNode: TSESTree.Node;
      isNamespace: boolean;
    }[] = [];

    return {
      CallExpression: (node) => {
        const resolved = resolveCallee(node.callee);

        if (resolved === undefined) return;

        if (
          resolved.canonicalName !== MIN_LENGTH_ARRAY_FN ||
          !isRewritableMinLengthOneCall(node)
        ) {
          return;
        }

        mut_callsToFix.push({
          node,
          propertyNode: resolved.propertyNode,
          isNamespace: resolved.isNamespace,
        });
      },
      'Program:exit': () => {
        if (mut_callsToFix.length === 0) return;

        const needsNamedBinding = mut_callsToFix.some(
          (call) => !call.isNamespace,
        );

        // A named-import rewrite introduces the identifier `nonEmptyArray`; if
        // that name is already bound to something else in this file, the fix
        // would silently call the wrong function. Namespace calls
        // (`t.nonEmptyArray(...)`) are unaffected, so only bail out when a
        // named binding is actually needed.
        if (
          needsNamedBinding &&
          importedLocalName === undefined &&
          hasConflictingDeclaration(program, NON_EMPTY_ARRAY_FN)
        ) {
          return;
        }

        const localName = importedLocalName ?? NON_EMPTY_ARRAY_FN;

        // Only the first *named* call carries the import fix; a namespace call
        // (`t.nonEmptyArray(...)`) needs no new binding, so it must not be the
        // one that owns it.
        const importFixIndex =
          needsNamedBinding && importedLocalName === undefined
            ? mut_callsToFix.findIndex((call) => !call.isNamespace)
            : -1;

        for (const [
          index,
          { node, propertyNode, isNamespace },
        ] of mut_callsToFix.entries()) {
          context.report({
            node,
            messageId: 'useNonEmptyArray',
            data: {
              original: MIN_LENGTH_ARRAY_FN,
              replacement: isNamespace ? NON_EMPTY_ARRAY_FN : localName,
            },
            fix: (fixer) => [
              ...(index === importFixIndex
                ? buildImportFix(fixer, program, NON_EMPTY_ARRAY_FN)
                : []),
              fixer.replaceText(
                propertyNode,
                isNamespace ? NON_EMPTY_ARRAY_FN : localName,
              ),
              // Drop the leading `1` argument, from its start up to the start
              // of the element-type argument, so any comments and whitespace
              // in between go with it.
              ...dropFirstArgumentFix(fixer, node),
            ],
          });
        }
      },
    };
  },
  defaultOptions: [],
} as const;

/**
 * Whether `node` is a `minLengthArray(1, elementType)` call that can be
 * rewritten to `nonEmptyArray(elementType)` without changing types.
 *
 * `nonEmptyArray` takes its `defaultValue` as a `NonEmptyTuple<A>` while
 * `minLengthArray` takes the branded `MinLengthArray<1, A>`, so calls that pass
 * a `defaultValue` are left alone rather than risking a fix that does not
 * type-check. A `typeName`-only options object is safe and still rewritten.
 */
const isRewritableMinLengthOneCall = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.CallExpression,
): boolean => {
  const args = node.arguments;

  if (args.length < 2 || args.length > 3) return false;

  if (args.some((arg) => arg.type === AST_NODE_TYPES.SpreadElement)) {
    return false;
  }

  const [minLength, , options] = args;

  if (
    minLength?.type !== AST_NODE_TYPES.Literal ||
    minLength.value !== 1 ||
    node.typeArguments !== undefined
  ) {
    return false;
  }

  if (options === undefined) return true;

  return (
    options.type === AST_NODE_TYPES.ObjectExpression &&
    options.properties.every(
      (property) =>
        property.type === AST_NODE_TYPES.Property &&
        !property.computed &&
        property.key.type === AST_NODE_TYPES.Identifier &&
        property.key.name !== 'defaultValue',
    )
  );
};

const dropFirstArgumentFix = (
  fixer: TSESLint.RuleFixer,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.CallExpression,
): readonly TSESLint.RuleFix[] => {
  const [minLength, elementType] = node.arguments;

  return minLength === undefined || elementType === undefined
    ? []
    : [fixer.removeRange([minLength.range[0], elementType.range[0]])];
};
