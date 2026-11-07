import type { ReadonlyRecord } from 'ts-type-forge';
import { eslintRulesByRuleId } from './eslint-rules-by-rule-id.mjs';

/**
 * Rules the table maps that the block leaves on: Sumi checks only part of what
 * they are configured with, and turning them off would drop the rest with
 * nothing failing (D-46). `no-restricted-imports` carries a package's own
 * restrictions beside the index-file pattern `modules/no-index-file-import`
 * covers, and a restriction set before this block was lost (#3068); the pattern
 * is reported twice instead.
 */
export const keptOnRules: ReadonlySet<string> = new Set<string>([
  'no-restricted-imports',
]);

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
      .filter((rule) => !keptOnRules.has(rule))
      .toSorted()
      .map((rule) => [rule, 'off'] as const),
  ),
} as const;
