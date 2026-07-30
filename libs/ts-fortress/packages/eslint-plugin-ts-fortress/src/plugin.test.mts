import { eslintPluginTsFortress } from './plugin.mjs';
import { tsFortressRules } from './rules/index.mjs';

describe('eslintPluginTsFortress.configs.recommended', () => {
  const recommended = eslintPluginTsFortress.configs.recommended;

  test('enables every rule of the plugin, and nothing else, at "error"', () => {
    assert.deepStrictEqual(
      recommended.rules,
      Object.fromEntries(
        Object.keys(tsFortressRules).map((name) => [
          `ts-fortress/${name}`,
          'error',
        ]),
      ),
    );
  });

  test('registers the exported plugin object itself', () => {
    // Registering a *copy* would make `Cannot redefine plugin` errors possible
    // for users who also list the plugin in their own `plugins` record.
    expect(recommended.plugins['ts-fortress']).toBe(eslintPluginTsFortress);
  });
});
