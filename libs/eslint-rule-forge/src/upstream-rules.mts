import type { Rule } from 'eslint';
import type { UnknownRecord } from 'ts-type-forge';

/**
 * `upstream` run unchanged, with the fix of each report it makes offered as a
 * suggestion instead: `--fix` never applies it, and an editor still offers it.
 *
 * ## When to use
 *
 * This is the answer for a rule whose `--fix` turns out to change what code
 * does, instead of turning the rule off: its reports stay, and the rewrite is
 * left to whoever reads it. Register the result as a rule of your own plugin
 * and turn the upstream rule off beside it. A rule whose rewrite there is
 * nothing to suggest for yet (an API not every supported platform has) stays
 * off instead.
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
 * The rule `name` of `plugin`, a plugin module that may ship no types, or
 * `undefined` when it has no such rule.
 */
export const pluginRule = (
  plugin: unknown,
  name: string,
): Rule.RuleModule | undefined =>
  asRuleModule(propertyOf(rulesOf(plugin), name));

/**
 * Every rule of `plugin`, a plugin module that may ship no types, as
 * `[name, rule]` in the order the plugin lists them: each enumerable property
 * of its `rules` whose value has a `create` function. `[]` for a value that is
 * not a plugin.
 */
export const pluginRules = (
  plugin: unknown,
): readonly (readonly [string, Rule.RuleModule])[] => {
  const rules = rulesOf(plugin);

  return rules === undefined
    ? []
    : Object.entries(rules).flatMap(([name, rule]) => {
        const module = asRuleModule(rule);

        return module === undefined ? [] : [[name, module] as const];
      });
};

/** Whether `value` is an object, not an array, whose properties are read. */
const isRecordLike = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** The own property `key` of `value`, or `undefined` when it has none. */
const propertyOf = (value: unknown, key: string): unknown =>
  isRecordLike(value) && Object.hasOwn(value, key)
    ? Reflect.get(value, key)
    : undefined;

/** The `rules` of `plugin`, or `undefined` when it has none. */
const rulesOf = (plugin: unknown): UnknownRecord | undefined => {
  const rules = propertyOf(plugin, 'rules');

  return isRecordLike(rules) ? rules : undefined;
};

/** `value` as a rule module when it has a `create` function. */
const asRuleModule = (value: unknown): Rule.RuleModule | undefined =>
  typeof propertyOf(value, 'create') === 'function'
    ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- a plugin's rule, which ESLint validates as it runs it
      (value as Rule.RuleModule)
    : undefined;

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
