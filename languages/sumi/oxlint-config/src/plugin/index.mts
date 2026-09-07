import {
  genericArrowTrailingComma,
  noAccessor,
  noClass,
  noConstructorCall,
  noDecorator,
  noEnum,
  noGlobalTypeShadow,
  noInOperator,
  noLetWithoutMutPrefix,
  noNewArray,
  noThis,
  noThrow,
  noTry,
  noUsing,
  preferArrowFunction,
  requireReadonlyType,
} from './rules/index.mjs';

/**
 * The sumi JS plugin for oxlint: the language rules oxlint has no native
 * equivalent for. Loaded by `oxlintrc.jsonc` through `jsPlugins` (from the
 * built `dist/plugin/index.mjs`), and referenced there as `sumi/<rule>`.
 *
 * The default export is the plugin protocol (ESLint v9 shape).
 */
export const sumiPlugin = {
  meta: { name: 'sumi' },
  rules: {
    'generic-arrow-trailing-comma': genericArrowTrailingComma,
    'no-accessor': noAccessor,
    'no-class': noClass,
    'no-constructor-call': noConstructorCall,
    'no-decorator': noDecorator,
    'no-enum': noEnum,
    'no-global-type-shadow': noGlobalTypeShadow,
    'no-in-operator': noInOperator,
    'no-let-without-mut-prefix': noLetWithoutMutPrefix,
    'no-new-array': noNewArray,
    'no-this': noThis,
    'no-throw': noThrow,
    'no-try': noTry,
    'no-using': noUsing,
    'prefer-arrow-function': preferArrowFunction,
    'require-readonly-type': requireReadonlyType,
  },
} as const;

export default sumiPlugin;
