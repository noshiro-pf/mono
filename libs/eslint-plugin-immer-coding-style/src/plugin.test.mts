import { eslintPluginImmerCodingStyle } from './plugin.mjs';

describe('eslintPluginImmerCodingStyle.configs.recommended', () => {
  test('registers the exported plugin object itself', () => {
    // Registering a *copy* would make `Cannot redefine plugin` errors possible
    // for users who also list the plugin in their own `plugins` record.
    expect(
      eslintPluginImmerCodingStyle.configs.recommended.plugins[
        'immer-coding-style'
      ],
    ).toBe(eslintPluginImmerCodingStyle);
  });
});
