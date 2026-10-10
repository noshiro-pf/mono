import { eslintPluginTsDataForge } from './plugin.mjs';

describe('eslintPluginTsDataForge.configs.recommended', () => {
  const recommended = eslintPluginTsDataForge.configs.recommended;

  test('registers the exported plugin object itself', () => {
    // Registering a *copy* would make `Cannot redefine plugin` errors possible
    // for users who also list the plugin in their own `plugins` record.
    expect(recommended.plugins['ts-data-forge']).toBe(eslintPluginTsDataForge);
  });
});
