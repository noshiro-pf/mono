import { eslintPluginTsTypeForge } from './plugin.mjs';

describe('eslintPluginTsTypeForge.configs.recommended', () => {
  const recommended = eslintPluginTsTypeForge.configs.recommended;

  test('registers the exported plugin object itself', () => {
    // Registering a *copy* would make `Cannot redefine plugin` errors possible
    // for users who also list the plugin in their own `plugins` record.
    expect(recommended.plugins['ts-type-forge']).toBe(eslintPluginTsTypeForge);
  });
});
