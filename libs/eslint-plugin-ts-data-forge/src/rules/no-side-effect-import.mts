import { createNoSideEffectImport } from 'eslint-rule-forge';
import { TS_DATA_FORGE_MODULE } from './constants.mjs';

/**
 * `import 'ts-data-forge';` binds nothing and runs nothing: every export is a
 * pure value or function, and the package declares `sideEffects: false`, which
 * is a promise that evaluating it changes nothing observable. TypeScript keeps
 * a side-effect import in the emitted JavaScript — that is the one kind it
 * never elides — so what is left is a module loaded for no reason, and a
 * bundler that trusts the flag drops it anyway.
 */
export const noSideEffectImport = createNoSideEffectImport({
  moduleName: TS_DATA_FORGE_MODULE,
  type: 'suggestion',
  description: `Remove a side-effect-only \`import '${TS_DATA_FORGE_MODULE}';\`, which binds no name and, the package being \`sideEffects: false\`, does nothing.`,
  message: `\`import '${TS_DATA_FORGE_MODULE}';\` binds no name, and \`${TS_DATA_FORGE_MODULE}\` declares \`sideEffects: false\`, so loading it does nothing. Remove it, and import what you need by name.`,
});
