import { eslintPluginTsStdForge } from './plugin.mjs';

describe('eslintPluginTsStdForge.configs.recommended', () => {
  const recommended = eslintPluginTsStdForge.configs.recommended;

  test('registers the exported plugin object itself', () => {
    // Registering a *copy* would make `Cannot redefine plugin` errors possible
    // for users who also list the plugin in their own `plugins` record.
    expect(recommended.plugins['ts-std-forge']).toBe(eslintPluginTsStdForge);
  });
});
