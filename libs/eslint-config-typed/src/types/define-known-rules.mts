import {
  type EslintArrayFuncRules,
  type EslintCypressRules,
  type EslintFunctionalRules,
  type EslintImportsRules,
  type EslintJestRules,
  type EslintJsxA11yRules,
  type EslintPlaywrightRules,
  type EslintPluginRules,
  type EslintPreferArrowFunctionRules,
  type EslintPromiseRules,
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
    EslintCypressRules &
    EslintFunctionalRules &
    EslintImportsRules &
    EslintJestRules &
    EslintJsxA11yRules &
    EslintPlaywrightRules &
    EslintPluginRules &
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
    TypeScriptEslintRules
>;

export const defineKnownRules = (
  rules: Partial<KnownRules>,
): Partial<KnownRules> => rules;
