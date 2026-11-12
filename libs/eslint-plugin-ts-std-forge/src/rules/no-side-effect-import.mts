import { createNoSideEffectImport } from 'eslint-rule-forge';
import { TS_STD_FORGE_MODULE } from './constants.mjs';

/**
 * `import 'ts-std-forge';` binds nothing and runs nothing: the package declares
 * `sideEffects: false`, a promise that evaluating it changes nothing
 * observable. TypeScript keeps a side-effect import in the emitted JavaScript,
 * so what is left is a module loaded for no reason, which a bundler that trusts
 * the flag drops anyway.
 */
export const noSideEffectImport = createNoSideEffectImport({
  moduleName: TS_STD_FORGE_MODULE,
  type: 'suggestion',
  description: `Remove a side-effect-only \`import '${TS_STD_FORGE_MODULE}';\`, which binds no name and, the package being \`sideEffects: false\`, does nothing.`,
  message: `\`import '${TS_STD_FORGE_MODULE}';\` binds no name, and \`${TS_STD_FORGE_MODULE}\` declares \`sideEffects: false\`, so loading it does nothing. Remove it, and import what you need by name.`,
});
