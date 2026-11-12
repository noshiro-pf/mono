import { eslintPluginTsRestrictions } from 'eslint-plugin-ts-restrictions';
import { Arr } from 'ts-data-forge';
import { eslintTsRestrictionsRules } from './eslint-ts-restrictions-rules.mjs';

// `eslint-plugin-ts-restrictions` documents its `recommended` preset as the
// rules this package turns on, as it configures them. Both lists are written by
// hand, so a rule turned on here and not there would leave the standalone
// plugin's users without it.
describe('the standalone recommended preset matches eslintTsRestrictionsRules', () => {
  test('same rules, severities and options', () => {
    // These wrap rules of plugins the standalone package does not depend on, so
    // they exist only here.
    const onlyHere = new Set<string>([
      'ts-restrictions/prefer-catch',
      'ts-restrictions/prefer-global-this',
    ]);

    const expected = Object.fromEntries(
      Object.entries(eslintTsRestrictionsRules)
        .map(([name, entry]) => [name, normalize(entry)] as const)
        .filter(
          ([name, [severity]]) => severity !== 'off' && !onlyHere.has(name),
        )
        .toSorted(([a], [b]) => a.localeCompare(b)),
    );

    const actual = Object.fromEntries(
      Object.entries(eslintPluginTsRestrictions.configs.recommended.rules)
        .map(([name, entry]) => [name, normalize(entry)] as const)
        .toSorted(([a], [b]) => a.localeCompare(b)),
    );

    assert.deepStrictEqual(actual, expected);
  });
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
