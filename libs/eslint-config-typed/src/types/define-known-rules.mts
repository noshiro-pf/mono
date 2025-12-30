import {
  type EslintArrayFuncRules,
  type EslintCypressRules,
  type EslintFunctionalRules,
  type EslintImmerCodingStyleRules,
  type EslintImportsRules,
  type EslintJestRules,
  type EslintJsxA11yRules,
  type EslintMathRules,
  type EslintNRules,
  type EslintPlaywrightRules,
  type EslintPluginRules,
  type EslintPluginSortDestructureKeysRules,
  type EslintPreferArrowFunctionRules,
  type EslintPromiseRules,
  type EslintReactCodingStyleRules,
  type EslintReactHooksRules,
  type EslintReactPerfRules,
  type EslintReactRefreshRules,
  type EslintReactRules,
  type EslintRules,
  type EslintSecurityRules,
  type EslintStrictDependenciesRules,
  type EslintStylisticRules,
  type EslintTestingLibraryRules,
  type EslintTotalFunctionsRules,
  type EslintTreeShakableRules,
  type EslintTsDataForgeRules,
  type EslintTsRestrictionsRules,
  type EslintUnicornRules,
  type EslintVitestCodingStyleRules,
  type EslintVitestRules,
  type TypeScriptEslintRules,
} from './rules/index.mjs';

type KnownRules = DeepReadonly<
  EslintTsRestrictionsRules &
    EslintArrayFuncRules &
    EslintCypressRules &
    EslintFunctionalRules &
    EslintImportsRules &
    EslintJestRules &
    EslintJsxA11yRules &
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
