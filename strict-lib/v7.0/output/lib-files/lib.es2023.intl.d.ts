/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABILITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

/*
 * Modified from TypeScript's `lib.es2023.intl.d.ts` by strict-ts-lib
 * (https://github.com/noshiro-pf/mono): the declarations are rewritten with
 * stricter types. This is not the original file. See the NOTICE and LICENSE
 * files of the package this ships in.
 */

declare namespace Intl {
  interface NumberFormatOptionsUseGroupingRegistry {
    readonly min2: never;
    readonly auto: never;
    readonly always: never;
  }

  interface NumberFormatOptionsSignDisplayRegistry {
    readonly negative: never;
  }

  interface NumberFormatRangePartTypeRegistry extends NumberFormatPartTypeRegistry {
    readonly approximatelySign: never;
  }

  type NumberFormatRangePartTypes = keyof NumberFormatRangePartTypeRegistry;

  interface NumberFormatOptions {
    readonly roundingPriority?:
      | 'auto'
      | 'morePrecision'
      | 'lessPrecision'
      | undefined;
    readonly roundingIncrement?:
      | 1
      | 2
      | 5
      | 10
      | 20
      | 25
      | 50
      | 100
      | 200
      | 250
      | 500
      | 1000
      | 2000
      | 2500
      | 5000
      | undefined;
    readonly roundingMode?:
      | 'ceil'
      | 'floor'
      | 'expand'
      | 'trunc'
      | 'halfCeil'
      | 'halfFloor'
      | 'halfExpand'
      | 'halfTrunc'
      | 'halfEven'
      | undefined;
    readonly trailingZeroDisplay?: 'auto' | 'stripIfInteger' | undefined;
  }

  interface ResolvedNumberFormatOptions {
    readonly roundingPriority: 'auto' | 'morePrecision' | 'lessPrecision';
    readonly roundingMode:
      | 'ceil'
      | 'floor'
      | 'expand'
      | 'trunc'
      | 'halfCeil'
      | 'halfFloor'
      | 'halfExpand'
      | 'halfTrunc'
      | 'halfEven';
    readonly roundingIncrement:
      | 1
      | 2
      | 5
      | 10
      | 20
      | 25
      | 50
      | 100
      | 200
      | 250
      | 500
      | 1000
      | 2000
      | 2500
      | 5000;
    readonly trailingZeroDisplay: 'auto' | 'stripIfInteger';
  }

  interface NumberRangeFormatPart {
    readonly type: NumberFormatRangePartTypes;
    readonly value: string;
    readonly source: 'startRange' | 'endRange' | 'shared';
  }

  type StringNumericLiteral =
    | `${number}`
    | 'Infinity'
    | '-Infinity'
    | '+Infinity';

  interface NumberFormat {
    format(value: number | bigint | StringNumericLiteral): string;
    formatToParts(
      value: number | bigint | StringNumericLiteral,
    ): NumberFormatPart[];
    formatRange(
      start: number | bigint | StringNumericLiteral,
      end: number | bigint | StringNumericLiteral,
    ): string;
    formatRangeToParts(
      start: number | bigint | StringNumericLiteral,
      end: number | bigint | StringNumericLiteral,
    ): NumberRangeFormatPart[];
  }
}
