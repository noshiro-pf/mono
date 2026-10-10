import { eslintPluginTsFortress } from './plugin.mjs';

describe('eslintPluginTsFortress.configs.recommended', () => {
  const recommended = eslintPluginTsFortress.configs.recommended;

  test('registers the exported plugin object itself', () => {
    // Registering a *copy* would make `Cannot redefine plugin` errors possible
    // for users who also list the plugin in their own `plugins` record.
    expect(recommended.plugins['ts-fortress']).toBe(eslintPluginTsFortress);
  });
});
