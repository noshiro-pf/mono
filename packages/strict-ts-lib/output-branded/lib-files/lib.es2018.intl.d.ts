/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

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

  // We can only have one definition for 'type' in TypeScript, and so you can learn where the keys come from here:
  type ES2018NumberFormatPartType =
    | 'literal'
    | 'nan'
    | 'infinity'
    | 'percent'
    | 'integer'
    | 'group'
    | 'decimal'
    | 'fraction'
    | 'plusSign'
    | 'minusSign'
    | 'percentSign'
    | 'currency'
    | 'code'
    | 'symbol'
    | 'name';
  type ES2020NumberFormatPartType =
    | 'compact'
    | 'exponentInteger'
    | 'exponentMinusSign'
    | 'exponentSeparator'
    | 'unit'
    | 'unknown';
  type NumberFormatPartTypes =
    | ES2018NumberFormatPartType
    | ES2020NumberFormatPartType;

  interface NumberFormatPart {
    readonly type: NumberFormatPartTypes;
    readonly value: string;
  }

  interface NumberFormat {
    formatToParts(number?: number | bigint): readonly NumberFormatPart[];
  }
}
