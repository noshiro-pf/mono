import type { TSESLint } from '@typescript-eslint/utils';
import {
  bindValueImports,
  buildCalleeResolver,
  getImportDeclarations,
  hasForeignBinding,
  type ValueImportBinding,
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
    const sourceCode = context.sourceCode;

    const declarations = getImportDeclarations(sourceCode.ast, MODULE);

    // `isNull(x)`, `n(x)` after `import { isNull as n }` and `lib.isNull(x)`
    // after `import * as lib` all call `isNull`.
    const resolve = buildCalleeResolver(declarations);

    return {
      CallExpression: (node) => {
        const resolved = resolve(node.callee);

        if (resolved?.canonicalName !== 'isNull') {
          return;
        }

        // `lib.isNullish` needs no import. Otherwise `isNullish` is written by
        // the name it is imported as, added to the existing named import, or
        // has its `type` dropped; `undefined` when none of that can bind it.
        const binding: ValueImportBinding | undefined = resolved.isNamespace
          ? { localNames: ['isNullish'], edits: () => [] }
          : bindValueImports(sourceCode, MODULE, ['isNullish']);

        const name = binding?.localNames[0];

        context.report({
          node,
          messageId: 'preferIsNullish',
          fix:
            binding === undefined ||
            name === undefined ||
            // A local `isNullish` that is not `my-lib`'s would capture the call.
            (!resolved.isNamespace &&
              hasForeignBinding(sourceCode, node, name, MODULE))
              ? null
              : (fixer) => [
                  ...binding.edits(fixer),
                  fixer.replaceText(resolved.propertyNode, name),
                ],
        });
      },
    };
  },
} as const;
