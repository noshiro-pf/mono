import { eslintPluginTsStdForge } from './plugin.mjs';
import { tsStdForgeRules } from './rules/index.mjs';

describe('eslintPluginTsStdForge.configs.recommended', () => {
  const recommended = eslintPluginTsStdForge.configs.recommended;

  test('enables every rule of the plugin, and nothing else, at "error"', () => {
    assert.deepStrictEqual(
      recommended.rules,
      Object.fromEntries(
        Object.keys(tsStdForgeRules).map((name) => [
          `ts-std-forge/${name}`,
          'error',
        ]),
      ),
    );
  });

  test('registers the exported plugin object itself', () => {
    // Registering a *copy* would make `Cannot redefine plugin` errors possible
    // for users who also list the plugin in their own `plugins` record.
    expect(recommended.plugins['ts-std-forge']).toBe(eslintPluginTsStdForge);
  });
});
