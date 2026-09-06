import { ESLintUtils } from '@typescript-eslint/utils';

/**
 * Rule factory for the tsubu plugin. oxlint's JS-plugin API is ESLint's v9
 * rule API, which typescript-eslint's `RuleCreator` types precisely (visitor
 * keys are TS-ESTree node types, so handlers need no parameter annotations).
 * Docs live in the language spec, not on a rule-docs site.
 */
export const createRule = ESLintUtils.RuleCreator.withoutDocs;
