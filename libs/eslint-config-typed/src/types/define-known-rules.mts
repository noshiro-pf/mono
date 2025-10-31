import {
  type EslintArrayFuncRules,
  type EslintCustomRules,
  type EslintCypressRules,
  type EslintFunctionalRules,
  type EslintImportsRules,
  type EslintJestRules,
  type EslintJsxA11yRules,
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
  type EslintTestingLibraryRules,
  type EslintTotalFunctionsRules,
  type EslintTreeShakableRules,
  type EslintUnicornRules,
  type EslintVitestRules,
  type TypeScriptEslintRules,
} from './rules/index.mjs';

type KnownRules = DeepReadonly<
  EslintArrayFuncRules &
    EslintCustomRules &
    EslintCypressRules &
    EslintFunctionalRules &
    EslintImportsRules &
    EslintJestRules &
    EslintJsxA11yRules &
    EslintPlaywrightRules &
    EslintPluginRules &
    EslintPluginSortDestructureKeysRules &
    EslintPreferArrowFunctionRules &
    EslintPromiseRules &
    EslintReactHooksRules &
    EslintReactPerfRules &
    EslintReactRefreshRules &
    EslintReactRules &
    EslintRules &
    EslintSecurityRules &
    EslintStrictDependenciesRules &
    EslintTestingLibraryRules &
    EslintTotalFunctionsRules &
    EslintTreeShakableRules &
    EslintUnicornRules &
    EslintVitestRules &
    EslintReactCodingStyleRules &
    TypeScriptEslintRules
>;

export const defineKnownRules = (
  rules: Partial<KnownRules>,
): Partial<KnownRules> => rules;
