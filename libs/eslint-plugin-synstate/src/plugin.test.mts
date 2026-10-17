import { eslintPluginSynstate } from './plugin.mjs';

describe('eslintPluginSynstate.configs.recommended', () => {
  const recommended = eslintPluginSynstate.configs.recommended;

  test('registers the exported plugin object itself', () => {
    // Registering a *copy* would make `Cannot redefine plugin` errors possible
    // for users who also list the plugin in their own `plugins` record.
    expect(recommended.plugins.synstate).toBe(eslintPluginSynstate);
  });
});
