// oxlint's `jsPlugins` loads a plugin from a module's default export, and
// `eslint-plugin-ts-type-forge` exports it by name only.
import { eslintPluginTsTypeForge } from 'eslint-plugin-ts-type-forge';

const plugin = {
  meta: eslintPluginTsTypeForge.meta,
  rules: eslintPluginTsTypeForge.rules,
} as const;

export default plugin;
