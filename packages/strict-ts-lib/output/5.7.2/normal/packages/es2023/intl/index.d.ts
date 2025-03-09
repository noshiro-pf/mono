/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />

declare namespace Intl {
  interface NumberFormatOptionsUseGroupingRegistry {
    readonly min2: never;
    readonly auto: never;
    readonly always: never;
  }

  interface NumberFormatOptionsSignDisplayRegistry {
    readonly negative: never;
  }

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

  interface NumberRangeFormatPart extends NumberFormatPart {
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
