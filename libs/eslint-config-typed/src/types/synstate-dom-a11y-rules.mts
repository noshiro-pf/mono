import type {
  EslintJsxA11yRules,
  EslintJsxA11yRulesOption,
} from './rules/index.mjs';

/**
 * jsx-a11y's rules as `eslintConfigForSynstateDom` registers them, under
 * `synstate-dom-a11y/` (#3408): the same rules, reading an attribute bound to
 * synstate-dom's `constant(x)` as bound to `x`.
 */
export type EslintSynstateDomA11yRules = Readonly<{
  [
    K in keyof EslintJsxA11yRules as K extends `jsx-a11y/${infer Name}`
      ? `synstate-dom-a11y/${Name}`
      : never
  ]: EslintJsxA11yRules[K];
}>;

// Exported beside the rule set, as each plugin's `...RulesOption` is.
export type EslintSynstateDomA11yRulesOption = Readonly<{
  [
    K in keyof EslintJsxA11yRulesOption as K extends `jsx-a11y/${infer Name}`
      ? `synstate-dom-a11y/${Name}`
      : never
  ]: EslintJsxA11yRulesOption[K];
}>;
