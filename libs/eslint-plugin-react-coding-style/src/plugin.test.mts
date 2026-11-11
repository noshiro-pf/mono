import { eslintPluginReactCodingStyle } from './plugin.mjs';

describe('eslintPluginReactCodingStyle.configs.recommended', () => {
  test('registers the exported plugin object itself', () => {
    // Registering a *copy* would make `Cannot redefine plugin` errors possible
    // for users who also list the plugin in their own `plugins` record.
    expect(
      eslintPluginReactCodingStyle.configs.recommended.plugins[
        'react-coding-style'
      ],
    ).toBe(eslintPluginReactCodingStyle);
  });
});
