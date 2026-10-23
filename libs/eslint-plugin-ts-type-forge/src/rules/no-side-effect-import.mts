import { createNoSideEffectImport } from 'eslint-rule-forge';
import { TS_TYPE_FORGE_MODULE } from './constants.mjs';

/**
 * `import 'ts-type-forge';` binds nothing, and there is nothing for it to run:
 * the package ships declarations only, and its `exports` map offers no runtime
 * condition at all, so the import fails to resolve the moment the module graph
 * is loaded. TypeScript keeps a side-effect import in the emitted JavaScript —
 * that is the one kind it never elides — so this is a runtime error waiting in
 * a file that type-checks.
 *
 * The ambient globals are a separate entry point, `ts-type-forge/global`,
 * usually brought in through `compilerOptions.types` or a triple-slash
 * reference, which the rule leaves alone.
 */
export const noSideEffectImport = createNoSideEffectImport({
  moduleName: TS_TYPE_FORGE_MODULE,
  type: 'problem',
  description: `Remove a side-effect-only \`import '${TS_TYPE_FORGE_MODULE}';\`, which binds no name and has no runtime entry point to resolve to. \`${TS_TYPE_FORGE_MODULE}/global\` is left alone.`,
  message: `\`import '${TS_TYPE_FORGE_MODULE}';\` binds no name, and \`${TS_TYPE_FORGE_MODULE}\` ships types only — it has no runtime entry point, so the import throws when the module is loaded. Remove it; the ambient globals come from \`${TS_TYPE_FORGE_MODULE}/global\`, not from this.`,
});
