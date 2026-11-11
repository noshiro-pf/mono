import { eslintPluginImmerCodingStyle } from 'eslint-plugin-immer-coding-style';
import { eslintPluginReactCodingStyle } from 'eslint-plugin-react-coding-style';
import { eslintPluginTsRestrictions } from 'eslint-plugin-ts-restrictions';
import { eslintPluginTsUiRestrictions } from 'eslint-plugin-ts-ui-restrictions';
import { eslintPluginVitestCodingStyle } from 'eslint-plugin-vitest-coding-style';
import { Arr } from 'ts-data-forge';
import { eslintImmerCodingStyleRules } from './eslint-immer-coding-style-rules.mjs';
import { eslintReactCodingStyleRules } from './eslint-react-coding-style-rules.mjs';
import { eslintTsRestrictionsRules } from './eslint-ts-restrictions-rules.mjs';
import { eslintTsUiRestrictionsRules } from './eslint-ts-ui-restrictions-rules.mjs';
import { eslintVitestCodingStyleRules } from './eslint-vitest-coding-style-rules.mjs';

// Each standalone plugin documents its `recommended` preset as the rules this
// package turns on, as it configures them. Both lists are written by hand, so a
// rule turned on here and not there would leave that plugin's users without it.
describe('each standalone recommended preset matches this package', () => {
  test.each([
    {
      plugin: 'ts-restrictions',
      here: eslintTsRestrictionsRules,
      preset: eslintPluginTsRestrictions.configs.recommended.rules,
      // These wrap rules of plugins the standalone package does not depend on,
      // so they exist only here.
      onlyHere: [
        'ts-restrictions/prefer-catch',
        'ts-restrictions/prefer-global-this',
      ],
    },
    {
      plugin: 'ts-ui-restrictions',
      here: eslintTsUiRestrictionsRules,
      preset: eslintPluginTsUiRestrictions.configs.recommended.rules,
      onlyHere: [],
    },
    {
      plugin: 'immer-coding-style',
      here: eslintImmerCodingStyleRules,
      preset: eslintPluginImmerCodingStyle.configs.recommended.rules,
      onlyHere: [],
    },
    {
      plugin: 'react-coding-style',
      here: eslintReactCodingStyleRules,
      preset: eslintPluginReactCodingStyle.configs.recommended.rules,
      onlyHere: [],
    },
    {
      plugin: 'vitest-coding-style',
      here: eslintVitestCodingStyleRules,
      preset: eslintPluginVitestCodingStyle.configs.recommended.rules,
      onlyHere: [],
    },
  ] as const)(
    '$plugin: same rules, severities and options',
    ({ here, preset, onlyHere }) => {
      const skipped = new Set<string>(onlyHere);

      const expected = Object.fromEntries(
        Object.entries(here)
          .map(([name, entry]) => [name, normalize(entry)] as const)
          .filter(
            ([name, [severity]]) => severity !== 'off' && !skipped.has(name),
          )
          .toSorted(([a], [b]) => a.localeCompare(b)),
      );

      const actual = Object.fromEntries(
        Object.entries(preset)
          .map(([name, entry]) => [name, normalize(entry)] as const)
          .toSorted(([a], [b]) => a.localeCompare(b)),
      );

      assert.deepStrictEqual(actual, expected);
    },
  );
});

const severityName = (severity: unknown): unknown =>
  severity === 0
    ? 'off'
    : severity === 1
      ? 'warn'
      : severity === 2
        ? 'error'
        : severity;

/** A rule entry as `[severity, ...options]`, its severity spelled out. */
const normalize = (entry: unknown): readonly unknown[] => {
  const [severity, ...options]: readonly unknown[] = Arr.isArray(entry)
    ? entry
    : ([entry] as const);

  return Arr.toUnshifted(severityName(severity))(options);
};
