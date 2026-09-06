import {
  noClass,
  noConstructorCall,
  noDecorator,
  noEnum,
  noLetWithoutMutPrefix,
  noThrow,
} from './rules/index.mjs';

/**
 * The sumi JS plugin for oxlint: the language rules oxlint has no native
 * equivalent for. Loaded by `oxlintrc.jsonc` through `jsPlugins` (from the
 * built `dist/plugin/index.mjs`), and referenced there as `sumi/<rule>`.
 *
 * The default export is the plugin protocol (ESLint v9 shape).
 */
const sumiPlugin = {
  meta: { name: 'sumi' },
  rules: {
    'no-class': noClass,
    'no-constructor-call': noConstructorCall,
    'no-decorator': noDecorator,
    'no-enum': noEnum,
    'no-let-without-mut-prefix': noLetWithoutMutPrefix,
    'no-throw': noThrow,
  },
} as const;

export default sumiPlugin;
