import type { Rule } from 'eslint';
import { hasKey, isRecord } from 'ts-data-forge';

/**
 * `upstream` run unchanged, with the fix of each report it makes offered as a
 * suggestion instead: `--fix` never applies it, and an editor still offers it.
 *
 * ## When to use
 *
 * This is the answer for a rule whose `--fix` turns out to change what code
 * does, instead of turning the rule off: its reports stay, and the rewrite is
 * left to whoever reads it. Register the result as a rule of its own
 * (`ts-restrictions/<name>`) and turn the upstream rule off beside it. A rule
 * whose rewrite there is nothing to suggest for yet (an API not every supported
 * platform has) stays off instead.
 *
 * `name` is the upstream rule's id, which its description and the error thrown
 * when the plugin no longer has it name.
 */
export const suggestionOnly = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  upstream: Rule.RuleModule | undefined,
  name: string,
): Rule.RuleModule => {
  const { fixable: _fixable, ...meta } = upstream?.meta ?? {};

  return {
    meta: {
      ...meta,
      type: meta.type ?? 'suggestion',
      docs: {
        ...meta.docs,
        description: `\`${name}\`, its fix offered only as a suggestion: ${meta.docs?.description ?? ''}`,
      },
      hasSuggestions: true,
    },
    create: (context) => {
      if (upstream === undefined) {
        throw new Error(`The plugin no longer has \`${name}\`.`);
      }

      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      const report = (descriptor: Rule.ReportDescriptor): void => {
        context.report(asSuggestion(descriptor));
      };

      // ESLint freezes the rule context, so `report` can be replaced only on an
      // object that inherits everything else from it — the same `Object.create`
      // ESLint builds the context with.
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- the context, with `report` replaced
      const upstreamContext = Object.create(context, {
        report: { value: report },
      }) as Rule.RuleContext;

      return upstream.create(upstreamContext);
    },
  };
};

/**
 * The rule `name` of `plugin`, a plugin module that ships no types, or
 * `undefined` when it has no such rule.
 */
export const pluginRule = (
  plugin: unknown,
  name: string,
): Rule.RuleModule | undefined => {
  if (
    !isRecord(plugin) ||
    !hasKey(plugin, 'rules') ||
    !isRecord(plugin.rules) ||
    !hasKey(plugin.rules, name)
  ) {
    return undefined;
  }

  const rule = plugin.rules[name];

  return isRecord(rule) &&
    hasKey(rule, 'create') &&
    typeof rule.create === 'function'
    ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- a plugin's rule, which ESLint validates as it runs it
      (rule as unknown as Rule.RuleModule)
    : undefined;
};

/**
 * The string `descriptor` holds under `key`: its message and its message id are
 * one of two shapes, which ESLint's types keep apart as a union.
 */
const stringProperty = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  descriptor: Rule.ReportDescriptor,
  key: 'message' | 'messageId',
): string | undefined => {
  const value: unknown = Reflect.get(descriptor, key);

  return typeof value === 'string' ? value : undefined;
};

/**
 * `descriptor` with its fix, if any, moved to a suggestion described by the
 * report's own message, after the suggestions it already offers.
 */
const asSuggestion = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  descriptor: Rule.ReportDescriptor,
): Rule.ReportDescriptor => {
  const { fix, ...rest } = descriptor;

  if (fix === undefined || fix === null) {
    return descriptor;
  }

  const messageId = stringProperty(descriptor, 'messageId');

  const suggestion: Rule.SuggestionReportDescriptor =
    messageId === undefined
      ? ({ desc: stringProperty(descriptor, 'message') ?? '', fix } as const)
      : ({ messageId, data: descriptor.data, fix } as const);

  // ESLint's descriptor declares a mutable array, which it only reads.
  const mut_suggest: Rule.SuggestionReportDescriptor[] = Array.from(
    descriptor.suggest ?? [],
  );

  mut_suggest.push(suggestion);

  return { ...rest, suggest: mut_suggest };
};
