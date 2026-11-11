import type { DeepReadonly } from 'ts-type-forge';
import type {
  EslintArrayFuncRules,
  EslintCypressRules,
  EslintFunctionalRules,
  EslintImmerCodingStyleRules,
  EslintImportsRules,
  EslintJestRules,
  EslintJsxA11yRules,
  EslintMathRules,
  EslintNRules,
  EslintPlaywrightRules,
  EslintPluginRules,
  EslintPluginSortDestructureKeysRules,
  EslintPreferArrowFunctionRules,
  EslintPromiseRules,
  EslintReactCodingStyleRules,
  EslintReactHooksRules,
  EslintReactPerfRules,
  EslintReactRefreshRules,
  EslintReactRules,
  EslintRules,
  EslintSecurityRules,
  EslintStrictDependenciesRules,
  EslintStylisticRules,
  EslintTestingLibraryRules,
  EslintTotalFunctionsRules,
  EslintTreeShakableRules,
  EslintTsDataForgeRules,
  EslintTsRestrictionsRules,
  EslintUnicornRules,
  EslintVitestCodingStyleRules,
  EslintVitestRules,
  TypeScriptEslintRules,
} from './rules/index.mjs';
import type { EslintSynstateDomA11yRules } from './synstate-dom-a11y-rules.mjs';

/**
 * Every rule `eslint-config-typed` has types for, by the name a rules record
 * uses (`no-console`, `@typescript-eslint/no-explicit-any`), each with the
 * entries it accepts (a severity alone, or with the rule's options): what
 * {@link defineKnownRules} checks a rules record against.
 */
export type KnownRules = DeepReadonly<
  EslintTsRestrictionsRules &
    EslintArrayFuncRules &
    EslintCypressRules &
    EslintFunctionalRules &
    EslintImportsRules &
    EslintJestRules &
    EslintJsxA11yRules &
    EslintSynstateDomA11yRules &
    EslintMathRules &
    EslintPlaywrightRules &
    EslintPluginRules &
    EslintPluginSortDestructureKeysRules &
    EslintPreferArrowFunctionRules &
    EslintPromiseRules &
    EslintNRules &
    EslintReactHooksRules &
    EslintReactPerfRules &
    EslintReactRefreshRules &
    EslintReactRules &
    EslintRules &
    EslintStylisticRules &
    EslintSecurityRules &
    EslintStrictDependenciesRules &
    EslintTestingLibraryRules &
    EslintTotalFunctionsRules &
    EslintTreeShakableRules &
    EslintUnicornRules &
    EslintVitestRules &
    EslintVitestCodingStyleRules &
    EslintImmerCodingStyleRules &
    EslintTsDataForgeRules &
    EslintReactCodingStyleRules &
    TypeScriptEslintRules
>;

export const defineKnownRules = (
  rules: Partial<KnownRules>,
): Partial<KnownRules> => rules;
