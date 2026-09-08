import { type ReadonlyRecord } from 'ts-type-forge';
import { eslintRulesByRuleId } from './eslint-rules-by-rule-id.mjs';

/**
 * A flat-config block that turns off every ESLint rule `sumi check` already
 * covers (D-46). Put it *last* in the project's config so it wins the
 * last-wins merge:
 *
 * ```ts
 * export default [...eslintConfigForTypeScript(options), eslintConfigOffForSumiCheck];
 * ```
 */
export const eslintConfigOffForSumiCheck: Readonly<{
  name: string;
  rules: ReadonlyRecord<string, 'off'>;
}> = {
  name: 'sumi/off-for-sumi-check',
  rules: Object.fromEntries(
    Array.from(eslintRulesByRuleId.values())
      .flat()
      .toSorted()
      .map((rule) => [rule, 'off'] as const),
  ),
} as const;
