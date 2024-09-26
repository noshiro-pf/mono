/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />

declare namespace Intl {
  // http://cldr.unicode.org/index/cldr-spec/plural-rules#TOC-Determining-Plural-Categories
  type LDMLPluralRule = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';
  type PluralRuleType = 'cardinal' | 'ordinal';

  interface PluralRulesOptions {
    readonly localeMatcher?: 'lookup' | 'best fit' | undefined;
    readonly type?: PluralRuleType | undefined;
    readonly minimumIntegerDigits?: UintRange<1, 22> | undefined;
    readonly minimumFractionDigits?: UintRange<0, 21> | undefined;
    readonly maximumFractionDigits?: UintRange<0, 21> | undefined;
    readonly minimumSignificantDigits?: UintRange<1, 22> | undefined;
    readonly maximumSignificantDigits?: UintRange<1, 22> | undefined;
  }

  interface ResolvedPluralRulesOptions {
    readonly locale: string;
    readonly pluralCategories: readonly LDMLPluralRule[];
    readonly type: PluralRuleType;
    readonly minimumIntegerDigits: UintRange<1, 22>;
    readonly minimumFractionDigits: UintRange<0, 21>;
    readonly maximumFractionDigits: UintRange<0, 21>;
    readonly minimumSignificantDigits?: UintRange<1, 22>;
    readonly maximumSignificantDigits?: UintRange<1, 22>;
  }

  interface PluralRules {
    resolvedOptions(): ResolvedPluralRulesOptions;
    select(n: number): LDMLPluralRule;
  }

  interface PluralRulesConstructor {
    new (
      locales?: string | readonly string[],
      options?: PluralRulesOptions,
    ): PluralRules;
    (
      locales?: string | readonly string[],
      options?: PluralRulesOptions,
    ): PluralRules;
    supportedLocalesOf(
      locales: string | readonly string[],
      options?: { readonly localeMatcher?: 'lookup' | 'best fit' },
    ): readonly string[];
  }

  const PluralRules: PluralRulesConstructor;

  interface NumberFormatPartTypeRegistry {
    readonly literal: never;
    readonly nan: never;
    readonly infinity: never;
    readonly percent: never;
    readonly integer: never;
    readonly group: never;
    readonly decimal: never;
    readonly fraction: never;
    readonly plusSign: never;
    readonly minusSign: never;
    readonly percentSign: never;
    readonly currency: never;
  }

  type NumberFormatPartTypes = keyof NumberFormatPartTypeRegistry;

  interface NumberFormatPart {
    readonly type: NumberFormatPartTypes;
    readonly value: string;
  }

  interface NumberFormat {
    formatToParts(number?: number | bigint): readonly NumberFormatPart[];
  }
}
