/// <reference no-default-lib="true"/>
/// <reference types="@noshiro/ts-type-utils" />

declare namespace Intl {
  interface DateTimeFormatPartTypesRegistry {
    readonly day: unknown;
    readonly dayPeriod: unknown;
    readonly era: unknown;
    readonly hour: unknown;
    readonly literal: unknown;
    readonly minute: unknown;
    readonly month: unknown;
    readonly second: unknown;
    readonly timeZoneName: unknown;
    readonly weekday: unknown;
    readonly year: unknown;
  }

  type DateTimeFormatPartTypes = keyof DateTimeFormatPartTypesRegistry;

  interface DateTimeFormatPart {
    readonly type: DateTimeFormatPartTypes;
    readonly value: string;
  }

  interface DateTimeFormat {
    formatToParts(date?: Date | number): readonly DateTimeFormatPart[];
  }
}
