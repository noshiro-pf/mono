import type { TSESLint } from '@typescript-eslint/utils';
import {
  buildCalleeResolver,
  buildNamedImportFix,
  getImportDeclarations,
  getImportedLocalName,
  hasForeignBinding,
} from 'eslint-rule-forge';

const MODULE = 'my-lib';

// Rewrites a call to `isNull` from `my-lib`, however it is imported, to
// `isNullish` from the same module, adding the import when it is missing.
export const preferIsNullish: TSESLint.RuleModule<'preferIsNullish'> = {
  meta: {
    type: 'suggestion',
    messages: { preferIsNullish: 'Use `isNullish`.' },
    fixable: 'code',
    schema: [],
    defaultOptions: [],
  },
  create: (context) => {
    const program = context.sourceCode.ast;

    const declarations = getImportDeclarations(program, MODULE);

    // `isNull(x)`, `n(x)` after `import { isNull as n }` and `lib.isNull(x)`
    // after `import * as lib` all call `isNull`.
    const resolve = buildCalleeResolver(declarations);

    return {
      CallExpression: (node) => {
        const resolved = resolve(node.callee);

        if (resolved?.canonicalName !== 'isNull') {
          return;
        }

        const importedAs = getImportedLocalName(declarations, 'isNullish');

        const name = resolved.isNamespace
          ? 'isNullish'
          : (importedAs ?? 'isNullish');

        // A local `isNullish` that is not `my-lib`'s would capture the call.
        const canFix =
          resolved.isNamespace ||
          !hasForeignBinding(context.sourceCode, node, name, MODULE);

        context.report({
          node,
          messageId: 'preferIsNullish',
          fix: canFix
            ? (fixer) => [
                ...(importedAs !== undefined || resolved.isNamespace
                  ? []
                  : buildNamedImportFix(fixer, program, MODULE, [name])),
                fixer.replaceText(resolved.propertyNode, name),
              ]
            : null,
        });
      },
    };
  },
} as const;
