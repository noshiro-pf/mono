import { oxlintCodeToRuleId } from 'sumi-oxlint-config';
import { type ReadonlyRecord } from 'ts-type-forge';

/**
 * `eslint(no-var)` → `no-var`, `typescript(no-explicit-any)` →
 * `typescript/no-explicit-any`; `undefined` for a `sumi(...)` plugin rule.
 */
const toOxlintRuleName = (code: string): string | undefined => {
  const groups = /^(?<plugin>[a-z]+)\((?<rule>[^)]+)\)$/u.exec(code)?.groups;

  const plugin = groups?.['plugin'];

  const rule = groups?.['rule'];

  if (plugin === undefined || rule === undefined || plugin === 'sumi') {
    return undefined;
  }

  return plugin === 'eslint' ? rule : `${plugin}/${rule}`;
};

/**
 * An oxlint config fragment that turns off every native oxlint rule the Sumi
 * preset enables (D-46), for a project that runs `sumi check` and keeps an
 * oxlint config of its own for style rules. `extends` it last. The `sumi/*`
 * plugin rules are not listed: a config that does not load the plugin has
 * nothing to turn off.
 *
 * `oxlint-config-off.json` at the package root is this object written out
 * (`pnpm run gen:oxlint-config-off`); a test keeps it in sync.
 */
export const oxlintConfigOffForSumiCheck: Readonly<{
  rules: ReadonlyRecord<string, 'off'>;
}> = {
  rules: Object.fromEntries(
    Array.from(oxlintCodeToRuleId.keys())
      .flatMap((code) => {
        const name = toOxlintRuleName(code);

        return name === undefined ? [] : [name];
      })
      .toSorted()
      .map((rule) => [rule, 'off'] as const),
  ),
} as const;
