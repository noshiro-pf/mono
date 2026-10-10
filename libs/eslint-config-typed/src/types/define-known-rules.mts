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
