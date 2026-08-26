import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';
import { isLocallyBound } from './ast-utils.mjs';
import { resolveTypeName, type ImportStyle } from './import-style.mjs';
import { buildTypeImportFix } from './import-utils.mjs';

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

/**
 * The ts-type-forge replacements offered for one standard-library type, in the
 * order they are suggested.
 */
export type StdTypeAlternatives = ReadonlyMap<string, readonly string[]>;

/**
 * Reports a reference to a banned standard-library type and offers one
 * suggestion per ts-type-forge alternative.
 *
 * Choosing between the alternatives is a semantic decision — `StrictExclude`
 * additionally checks that the subtrahend is part of the union, `ReadonlyRecord`
 * and `MutableRecord` describe different types — so this is deliberately *not*
 * an autofix. Each suggestion carries its own import fix, which is safe because
 * ESLint applies suggestions one at a time.
 */
export const reportStdTypeReference = <MessageIds extends string>(
  context: TSESLint.RuleContext<MessageIds, readonly unknown[]>,
  node: TSESTree.TSTypeReference,
  alternatives: StdTypeAlternatives,
  messageIds: Readonly<{ report: MessageIds; suggestion: MessageIds }>,
  importStyle: ImportStyle,
): void => {
  const typeName = node.typeName;

  // `ns.Pick` / `import('…').Pick` never denote the standard-library type.
  if (typeName.type !== AST_NODE_TYPES.Identifier) return;

  const stdName = typeName.name;

  const candidates = alternatives.get(stdName);

  if (candidates === undefined) return;

  // A file that declares — or imports — its own `Pick` does not mean the
  // standard-library one, so there is nothing to steer.
  if (isLocallyBound(context.sourceCode, node, stdName)) return;

  const program = context.sourceCode.ast;

  context.report({
    node: typeName,
    messageId: messageIds.report,
    data: { name: stdName, alternatives: formatAlternatives(candidates) },
    suggest: candidates.flatMap((candidate) => {
      const target = resolveTypeName(program, candidate, importStyle);

      // The replacement name is already bound to something else in this file,
      // so rewriting to it would resolve to the wrong declaration.
      return target === undefined
        ? []
        : [
            {
              messageId: messageIds.suggestion,
              data: { name: stdName, replacement: target.localName },
              fix: (fixer: TSESLint.RuleFixer): readonly TSESLint.RuleFix[] =>
                Arr.toPushed(
                  target.needsImport
                    ? buildTypeImportFix(fixer, program, candidate)
                    : [],
                  fixer.replaceText(typeName, target.localName),
                ),
            },
          ];
    }),
  });
};

/** `['StrictPick', 'RelaxedPick']` → `` '`StrictPick` or `RelaxedPick`' ``. */
const formatAlternatives = (candidates: readonly string[]): string =>
  candidates.map((candidate) => `\`${candidate}\``).join(' or ');
