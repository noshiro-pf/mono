import type { TSESLint } from '@typescript-eslint/utils';

/**
 * `rule`, which moved to another plugin, under the id it had here: deprecated,
 * naming where it went, and otherwise unchanged.
 *
 * ## Why
 *
 * A config that sets the old id, and an `eslint-disable` comment that names it,
 * fail to load once nothing is registered under it ("Definition for rule … was
 * not found"). Kept under the old id, the rule goes on running with the options
 * such a config gives it, and the preset turns the old id off beside the new
 * one, so that nothing is reported twice. The generated rule types accept only
 * `0` for a deprecated id, so a type-checked config has to rename it anyway.
 *
 * Each id registered through this is listed in `NEXT_MAJOR.md`, which removes
 * it.
 */
export const movedRule = <
  MessageIds extends string,
  Options extends readonly unknown[],
>(
  // A rule module is a record of functions, which no readonly type describes.
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  rule: TSESLint.RuleModule<MessageIds, Options>,
  movedTo: Readonly<{
    /** The npm package of the plugin the rule is in now. */
    packageName: string;
    /** The id the rule has there, prefix included. */
    ruleId: string;
  }>,
): TSESLint.RuleModule<MessageIds, Options> =>
  ({
    ...rule,
    meta: {
      ...rule.meta,
      deprecated: {
        message: `Moved to \`${movedTo.packageName}\` as \`${movedTo.ruleId}\`, which \`eslint-config-typed\` turns on in its place.`,
        replacedBy: [
          {
            plugin: { name: movedTo.packageName },
            rule: { name: movedTo.ruleId.replace(/^[^/]+\//u, '') },
          },
        ],
        // `NEXT_MAJOR.md` removes it.
        availableUntil: '8.0.0',
      },
    },
  }) as const;
