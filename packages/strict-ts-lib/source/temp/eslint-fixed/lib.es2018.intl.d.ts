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

declare namespace Intl {
  // http://cldr.unicode.org/index/cldr-spec/plural-rules#TOC-Determining-Plural-Categories
  type LDMLPluralRule = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';
  type PluralRuleType = 'cardinal' | 'ordinal';

  interface PluralRulesOptions {
    readonly localeMatcher?: 'lookup' | 'best fit' | undefined;
    readonly type?: PluralRuleType | undefined;
    readonly minimumIntegerDigits?: number | undefined;
    readonly minimumFractionDigits?: number | undefined;
    readonly maximumFractionDigits?: number | undefined;
    readonly minimumSignificantDigits?: number | undefined;
    readonly maximumSignificantDigits?: number | undefined;
  }

  interface ResolvedPluralRulesOptions {
    readonly locale: string;
    readonly pluralCategories: readonly LDMLPluralRule[];
    readonly type: PluralRuleType;
    readonly minimumIntegerDigits: number;
    readonly minimumFractionDigits: number;
    readonly maximumFractionDigits: number;
    readonly minimumSignificantDigits?: number;
    readonly maximumSignificantDigits?: number;
  }

  interface PluralRules {
    resolvedOptions(): ResolvedPluralRulesOptions;
    select(n: number): LDMLPluralRule;
  }

  interface PluralRulesConstructor {
    new (locales?: string | readonly string[], options?: PluralRulesOptions): PluralRules;
    (locales?: string | readonly string[], options?: PluralRulesOptions): PluralRules;
    supportedLocalesOf(locales: string | readonly string[], options?: { readonly localeMatcher?: 'lookup' | 'best fit' }): readonly string[];
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
