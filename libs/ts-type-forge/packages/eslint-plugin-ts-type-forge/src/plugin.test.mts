import { eslintPluginTsTypeForge } from './plugin.mjs';
import { tsTypeForgeRules } from './rules/index.mjs';

describe('eslintPluginTsTypeForge.configs.recommended', () => {
  const recommended = eslintPluginTsTypeForge.configs.recommended;

  test('enables every rule of the plugin, and nothing else, at "error"', () => {
    assert.deepStrictEqual(
      recommended.rules,
      Object.fromEntries(
        Object.keys(tsTypeForgeRules).map((name) => [
          `ts-type-forge/${name}`,
          'error',
        ]),
      ),
    );
  });

  test('registers the exported plugin object itself', () => {
    // Registering a *copy* would make `Cannot redefine plugin` errors possible
    // for users who also list the plugin in their own `plugins` record.
    expect(recommended.plugins['ts-type-forge']).toBe(eslintPluginTsTypeForge);
  });
});
