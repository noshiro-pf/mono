# eslint-rule-forge

Helpers for writing [typescript-eslint](https://typescript-eslint.io/) rules
that are hard to fool: they see through type wrappers and parentheses, and
resolve what a file imports however it is written.

A rule that matches `Number(x)` but not `(Number as NumberConstructor)(x)` has
a hole a wrapper slips through, and one that asks the type of `x as string`
trusts a claim the checker never verified. These are the helpers the
`eslint-plugin-ts-*` packages and `eslint-config-typed` share for that, in one
place, so that a fix to one of them reaches every rule.

## Installation

```sh
npm install eslint-rule-forge
```

`@typescript-eslint/utils` comes with it; `eslint` and `typescript` are peer
dependencies.

## Type wrappers

`x as T`, `x!`, `x satisfies T` and `<T>x` change a type and never a value.

| Helper              | What it gives                                                                         |
| :------------------ | :------------------------------------------------------------------------------------ |
| `isTypeWrapper`     | whether a node is one of the four                                                     |
| `skipTypeWrappers`  | the expression inside every wrapper around a node: judge syntax on this               |
| `typeWrapperLayers` | the node and every expression inside its wrappers, outermost first: ask types of each |
| `TypeWrapper`       | the four node types                                                                   |

All of them take a readonly (`DeepReadonly<TSESTree.Node>`) or a mutable node
and give back the same kind.

Judge syntax on what `skipTypeWrappers` returns, and write the fix from the
original node, so that the wrapper is kept:

```ts
import { AST_NODE_TYPES, type TSESLint } from '@typescript-eslint/utils';
import { getArgumentText, skipTypeWrappers } from 'eslint-rule-forge';

// Reports `Number(x)`, also written `(Number as NumberConstructor)(x)` or
// `Number!(x)`, and rewrites it to `toNumber(x)`.
export const noNumberCall: TSESLint.RuleModule<'noNumberCall'> = {
    meta: {
        type: 'suggestion',
        messages: { noNumberCall: 'Use `toNumber` instead of `Number`.' },
        fixable: 'code',
        schema: [],
    },
    defaultOptions: [],
    create: (context) => ({
        CallExpression: (node) => {
            // Judge the syntax on the expression inside the wrappers ...
            const callee = skipTypeWrappers(node.callee);

            const [argument] = node.arguments;

            if (
                argument === undefined ||
                callee.type !== AST_NODE_TYPES.Identifier ||
                callee.name !== 'Number'
            ) {
                return;
            }

            context.report({
                node,
                messageId: 'noNumberCall',
                // ... and write the fix from the original nodes, keeping a sequence
                // argument `(a, b)` one argument.
                fix: (fixer) =>
                    fixer.replaceText(
                        node,
                        `toNumber(${getArgumentText(context.sourceCode, argument)})`,
                    ),
            });
        },
    }),
} as const;
```

A conclusion drawn from a type — that a guard always holds, that a value is an
array — has to hold at every layer `typeWrapperLayers` returns. A widening
assertion (`x as string | null`) then makes the rule more cautious, and a
narrowing one (`x!`, `v as string` on an `unknown`), which the checker cannot
verify, changes nothing.

## Negation

Writing the negation of a condition the short way, as a fix that removes a
ternary or turns a filter into a loop has to.

| Helper                        | What it gives                                                                                                             |
| :---------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| `negationOf`                  | `a !== b` for `a === b`, `!a && !b` for `a \|\| b`, `a` for `!a` (when a boolean), else `!a`; parenthesized as an operand |
| `prefixedNegationOf`          | `!a`, `!f(x)`, `!(a === b)`: a `!` in front, with parentheses only when it needs them                                     |
| `isComparison`                | whether a node is an equality or a relational comparison                                                                  |
| `isExactlyInvertible`         | whether inverting a comparison's operator is its exact negation: always for an equality, for `<` only without `NaN`       |
| `invertedComparisonText`      | the comparison's source with its operator inverted                                                                        |
| `needsParenthesesAsOperandOf` | whether a node needs parentheses as an operand of `&&` or `\|\|`                                                          |
| `createGetLayerTypes`         | a function giving a node's type at every type-wrapper layer, which the checks above ask                                   |

`negationOf` gives `undefined` when the only exact negation is `!!a` (for an
`a` that may not be a boolean) or `!(a < b)` (for operands that may be `NaN`),
so that a rule can choose between `prefixedNegationOf` and giving up. Where
only the truthiness of the negation is read, such as the test of an `if`, its
context may call every node a boolean.

## Parentheses

The range and the text of a node leave out the parentheses written around it.

| Helper               | What it gives                                                       |
| :------------------- | :------------------------------------------------------------------ |
| `parenthesesDepth`   | how many pairs of parentheses surround a node                       |
| `getRangeWithParens` | the node's range including them                                     |
| `getArgumentText`    | the node's text for an argument list, `(a, b)` kept as one argument |

## Imports and bindings

| Helper                  | What it gives                                                                                        |
| :---------------------- | :--------------------------------------------------------------------------------------------------- |
| `getImportDeclarations` | every `import … from '<module>'` in the file, not only the first                                     |
| `getNamedImports`       | the export names those declarations import                                                           |
| `getImportedLocalName`  | the local name an export is imported as (`'y'` for `import { x as y }`)                              |
| `buildCalleeResolver`   | which export a callee calls, through aliases, namespace imports and type wrappers                    |
| `buildNamedImportFix`   | a fix inserting `import { … } from '<module>';`, for an import sorter to place                       |
| `hasForeignBinding`     | whether a name, at a node, is bound to something other than the module's import (a fix must give up) |
| `isLocallyBound`        | whether a name, at a node, is declared in the file rather than a global or a standard-library type   |

```ts
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
    },
    defaultOptions: [],
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

                const importedAs = getImportedLocalName(
                    declarations,
                    'isNullish',
                );

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
                              ...(importedAs !== undefined ||
                              resolved.isNamespace
                                  ? []
                                  : buildNamedImportFix(
                                        fixer,
                                        program,
                                        MODULE,
                                        [name],
                                    )),
                              fixer.replaceText(resolved.propertyNode, name),
                          ]
                        : null,
                });
            },
        };
    },
} as const;
```

## License

[Apache-2.0](https://github.com/noshiro-pf/mono/blob/main/libs/eslint-rule-forge/LICENSE)
