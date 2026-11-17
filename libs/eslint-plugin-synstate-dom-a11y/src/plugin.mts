import type { Linter } from 'eslint';
import { createRequire } from 'node:module';
// @ts-expect-error no type definition
import eslintPluginJsxA11y from 'eslint-plugin-jsx-a11y';
import { Arr, hasKey, isRecord } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { withSynstateDomConstants } from './with-synstate-dom-constants.mjs';

/**
 * The `version` of the `package.json` at `path` from this module (`src/` and
 * `dist/` alike sit one level below the package root), or `'0'` when it has
 * none.
 */
const versionOf = (path: string): string => {
  const manifest: unknown = createRequire(import.meta.url)(path);

  return isRecord(manifest) &&
    hasKey(manifest, 'version') &&
    typeof manifest.version === 'string'
    ? manifest.version
    : '0';
};

/** jsx-a11y wrapped, with jsx-a11y's own `meta` (its version included). */
const wrapped = withSynstateDomConstants(eslintPluginJsxA11y);

/**
 * jsx-a11y's rules for components written with synstate-dom, under
 * `synstate-dom-a11y/`: an attribute bound to `constant(x)` reads as bound to
 * `x`, synstate-dom's `autofocus` reads as React's `autoFocus`, and
 * `prefer-tag-over-role` leaves an SVG element alone
 * ({@link withSynstateDomConstants}).
 *
 * `configs.recommended` and `configs.strict` are jsx-a11y's presets of the same
 * names, each rule renamed to `synstate-dom-a11y/`.
 */
export const eslintPluginSynstateDomA11y = {
  ...wrapped,
  // ESLint keys a cache on `meta`: the version names both this package's
  // release and jsx-a11y's, so that upgrading either invalidates it.
  meta: {
    name: 'eslint-plugin-synstate-dom-a11y',
    version: `${versionOf('../package.json')}+jsx-a11y.${wrapped.meta?.version ?? '0'}`,
  },
  configs: {
    get recommended(): Linter.Config {
      return renamedPreset('recommended');
    },
    get strict(): Linter.Config {
      return renamedPreset('strict');
    },
  },
} as const;

const prefix = 'synstate-dom-a11y';

/**
 * The rules of jsx-a11y's flat preset `name`, read off the module, which ships
 * no types; `{}` when it has no such preset.
 */
const flatPreset = (
  name: 'recommended' | 'strict',
): ReadonlyRecord<string, Linter.RuleEntry> => {
  const plugin: unknown = eslintPluginJsxA11y;

  if (
    !isRecord(plugin) ||
    !hasKey(plugin, 'flatConfigs') ||
    !isRecord(plugin.flatConfigs) ||
    !hasKey(plugin.flatConfigs, name)
  ) {
    return {};
  }

  const config = plugin.flatConfigs[name];

  return isRecord(config) && hasKey(config, 'rules') && isRecord(config.rules)
    ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- a jsx-a11y preset's rules, which ESLint validates as it reads them
      (config.rules as ReadonlyRecord<string, Linter.RuleEntry>)
    : {};
};

/**
 * jsx-a11y's flat preset `name`, its rules renamed to `synstate-dom-a11y/` and
 * registering {@link eslintPluginSynstateDomA11y} itself. A getter builds it on
 * each read, so the preset registers the *same* object as a configuration that
 * lists the plugin under its own `plugins`: ESLint refuses two objects under one
 * name (`Cannot redefine plugin`).
 */
const renamedPreset = (name: 'recommended' | 'strict'): Linter.Config => {
  const preset = flatPreset(name);

  return {
    name: `${prefix}/${name}`,
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: { [prefix]: eslintPluginSynstateDomA11y },
    rules: Object.fromEntries(
      Arr.generate(function* () {
        for (const [ruleId, entry] of Object.entries(preset)) {
          if (ruleId.startsWith('jsx-a11y/')) {
            yield [
              `${prefix}/${ruleId.slice('jsx-a11y/'.length)}`,
              entry,
            ] as const;
          }
        }
      }),
    ),
  };
};
