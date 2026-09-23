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

/*
 * Modified from TypeScript's `lib.es2018.intl.d.ts` by strict-ts-lib
 * (https://github.com/noshiro-pf/mono): the declarations are rewritten with
 * stricter types. This is not the original file. See the NOTICE and LICENSE
 * files of the package this ships in.
 */

/// <reference no-default-lib="true"/>

declare namespace Intl {
  // http://cldr.unicode.org/index/cldr-spec/plural-rules#TOC-Determining-Plural-Categories
  type LDMLPluralRule = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';
  type PluralRuleType = 'cardinal' | 'ordinal';

  interface PluralRulesOptions {
    readonly localeMatcher?: 'lookup' | 'best fit' | undefined;
    readonly type?: PluralRuleType | undefined;
    readonly minimumIntegerDigits?:
      | import('ts-type-forge').UintRangeInclusive<1, 21>
      | undefined;
    readonly minimumFractionDigits?:
      | import('ts-type-forge').UintRangeInclusive<0, 20>
      | undefined;
    readonly maximumFractionDigits?:
      | import('ts-type-forge').UintRangeInclusive<0, 20>
      | undefined;
    readonly minimumSignificantDigits?:
      | import('ts-type-forge').UintRangeInclusive<1, 21>
      | undefined;
    readonly maximumSignificantDigits?:
      | import('ts-type-forge').UintRangeInclusive<1, 21>
      | undefined;
  }

  interface ResolvedPluralRulesOptions {
    readonly locale: string;
    readonly pluralCategories: readonly LDMLPluralRule[];
    readonly type: PluralRuleType;
    readonly minimumIntegerDigits: import('ts-type-forge').UintRangeInclusive<
      1,
      21
    >;
    readonly minimumFractionDigits: import('ts-type-forge').UintRangeInclusive<
      0,
      20
    >;
    readonly maximumFractionDigits: import('ts-type-forge').UintRangeInclusive<
      0,
      20
    >;
    readonly minimumSignificantDigits?: import('ts-type-forge').UintRangeInclusive<
      1,
      21
    >;
    readonly maximumSignificantDigits?: import('ts-type-forge').UintRangeInclusive<
      1,
      21
    >;
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
