/// <reference path="./lib.es2015.symbol.wellknown.d.ts" />
/// <reference path="./lib.es2020.intl.d.ts" />
/// <reference path="./lib.es2025.intl.d.ts" />

declare namespace Temporal {
  type CalendarLike =
    | PlainDate
    | PlainDateTime
    | PlainMonthDay
    | PlainYearMonth
    | ZonedDateTime
    | string;
  type DurationLike = Duration | DurationLikeObject | string;
  type InstantLike = Instant | ZonedDateTime | string;
  type PlainDateLike =
    | PlainDate
    | ZonedDateTime
    | PlainDateTime
    | DateLikeObject
    | string;
  type PlainDateTimeLike =
    | PlainDateTime
    | ZonedDateTime
    | PlainDate
    | DateTimeLikeObject
    | string;
  type PlainMonthDayLike = PlainMonthDay | DateLikeObject | string;
  type PlainTimeLike =
    | PlainTime
    | PlainDateTime
    | ZonedDateTime
    | TimeLikeObject
    | string;
  type PlainYearMonthLike = PlainYearMonth | YearMonthLikeObject | string;
  type TimeZoneLike = ZonedDateTime | string;
  type ZonedDateTimeLike = ZonedDateTime | ZonedDateTimeLikeObject | string;

  type PartialTemporalLike<T extends object> = {
    readonly [P in Exclude<keyof T, 'calendar' | 'timeZone'>]?:
      | T[P]
      | undefined;
  };

  interface DateLikeObject {
    readonly year?: number | undefined;
    readonly era?: string | undefined;
    readonly eraYear?: number | undefined;
    readonly month?: number | undefined;
    readonly monthCode?: string | undefined;
    readonly day: number;
    readonly calendar?: string | undefined;
  }

  interface DateTimeLikeObject extends DateLikeObject, TimeLikeObject {}

  interface DurationLikeObject {
    readonly years?: number | undefined;
    readonly months?: number | undefined;
    readonly weeks?: number | undefined;
    readonly days?: number | undefined;
    readonly hours?: number | undefined;
    readonly minutes?: number | undefined;
    readonly seconds?: number | undefined;
    readonly milliseconds?: number | undefined;
    readonly microseconds?: number | undefined;
    readonly nanoseconds?: number | undefined;
  }

  interface TimeLikeObject {
    readonly hour?: number | undefined;
    readonly minute?: number | undefined;
    readonly second?: number | undefined;
    readonly millisecond?: number | undefined;
    readonly microsecond?: number | undefined;
    readonly nanosecond?: number | undefined;
  }

  interface YearMonthLikeObject extends Omit<DateLikeObject, 'day'> {}

  interface ZonedDateTimeLikeObject extends DateTimeLikeObject {
    readonly timeZone: TimeZoneLike;
    readonly offset?: string | undefined;
  }

  type DateUnit = 'year' | 'month' | 'week' | 'day';
  type TimeUnit =
    | 'hour'
    | 'minute'
    | 'second'
    | 'millisecond'
    | 'microsecond'
    | 'nanosecond';
  type PluralizeUnit<T extends DateUnit | TimeUnit> =
    | T
    | {
        readonly year: 'years';
        readonly month: 'months';
        readonly week: 'weeks';
        readonly day: 'days';
        readonly hour: 'hours';
        readonly minute: 'minutes';
        readonly second: 'seconds';
        readonly millisecond: 'milliseconds';
        readonly microsecond: 'microseconds';
        readonly nanosecond: 'nanoseconds';
      }[T];

  interface DisambiguationOptions {
    readonly disambiguation?:
      | 'compatible'
      | 'earlier'
      | 'later'
      | 'reject'
      | undefined;
  }

  interface OverflowOptions {
    readonly overflow?: 'constrain' | 'reject' | undefined;
  }

  interface TransitionOptions {
    readonly direction: 'next' | 'previous';
  }

  interface RoundingOptions<Units extends DateUnit | TimeUnit> {
    readonly smallestUnit?: PluralizeUnit<Units> | undefined;
    readonly roundingIncrement?: number | undefined;
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
  }

  interface RoundingOptionsWithLargestUnit<
    Units extends DateUnit | TimeUnit,
  > extends RoundingOptions<Units> {
    readonly largestUnit?: 'auto' | PluralizeUnit<Units> | undefined;
  }

  interface ToStringRoundingOptions<
    Units extends DateUnit | TimeUnit,
  > extends Pick<RoundingOptions<Units>, 'smallestUnit' | 'roundingMode'> {}

  interface ToStringRoundingOptionsWithFractionalSeconds<
    Units extends DateUnit | TimeUnit,
  > extends ToStringRoundingOptions<Units> {
    readonly fractionalSecondDigits?:
      | 'auto'
      | 0
      | 1
      | 2
      | 3
      | 4
      | 5
      | 6
      | 7
      | 8
      | 9
      | undefined;
  }

  namespace Now {
    function timeZoneId(): string;
    function instant(): Instant;
    function plainDateTimeISO(timeZone?: TimeZoneLike): PlainDateTime;
    function zonedDateTimeISO(timeZone?: TimeZoneLike): ZonedDateTime;
    function plainDateISO(timeZone?: TimeZoneLike): PlainDate;
    function plainTimeISO(timeZone?: TimeZoneLike): PlainTime;
  }

  interface PlainDateToStringOptions {
    readonly calendarName?:
      | 'auto'
      | 'always'
      | 'never'
      | 'critical'
      | undefined;
  }

  interface PlainDateToZonedDateTimeOptions {
    readonly plainTime?: PlainTimeLike | undefined;
    readonly timeZone: TimeZoneLike;
  }

  interface PlainDate {
    readonly calendarId: string;
    readonly era: string | undefined;
    readonly eraYear: number | undefined;
    readonly year: number;
    readonly month: number;
    readonly monthCode: string;
    readonly day: number;
    readonly dayOfWeek: number;
    readonly dayOfYear: number;
    readonly weekOfYear: number | undefined;
    readonly yearOfWeek: number | undefined;
    readonly daysInWeek: number;
    readonly daysInMonth: number;
    readonly daysInYear: number;
    readonly monthsInYear: number;
    readonly inLeapYear: boolean;
    toPlainYearMonth(): PlainYearMonth;
    toPlainMonthDay(): PlainMonthDay;
    add(duration: DurationLike, options?: OverflowOptions): PlainDate;
    subtract(duration: DurationLike, options?: OverflowOptions): PlainDate;
    with(
      dateLike: PartialTemporalLike<DateLikeObject>,
      options?: OverflowOptions,
    ): PlainDate;
    withCalendar(calendarLike: CalendarLike): PlainDate;
    until(
      other: PlainDateLike,
      options?: RoundingOptionsWithLargestUnit<DateUnit>,
    ): Duration;
    since(
      other: PlainDateLike,
      options?: RoundingOptionsWithLargestUnit<DateUnit>,
    ): Duration;
    equals(other: PlainDateLike): boolean;
    toPlainDateTime(time?: PlainTimeLike): PlainDateTime;
    toZonedDateTime(timeZone: TimeZoneLike): ZonedDateTime;
    toZonedDateTime(item: PlainDateToZonedDateTimeOptions): ZonedDateTime;
    toString(options?: PlainDateToStringOptions): string;
    toLocaleString(
      locales?: Intl.LocalesArgument,
      options?: Intl.DateTimeFormatOptions,
    ): string;
    toJSON(): string;
    valueOf(): never;
    readonly [Symbol.toStringTag]: 'Temporal.PlainDate';
  }

  interface PlainDateConstructor {
    new (
      isoYear: number,
      isoMonth: number,
      isoDay: number,
      calendar?: string,
    ): PlainDate;
    readonly prototype: PlainDate;
    from(item: PlainDateLike, options?: OverflowOptions): PlainDate;
    compare(one: PlainDateLike, two: PlainDateLike): number;
  }
  const PlainDate: PlainDateConstructor;

  interface PlainTimeToStringOptions extends ToStringRoundingOptionsWithFractionalSeconds<
    Exclude<TimeUnit, 'hour'>
  > {}

  interface PlainTime {
    readonly hour: number;
    readonly minute: number;
    readonly second: number;
    readonly millisecond: number;
    readonly microsecond: number;
    readonly nanosecond: number;
    add(duration: DurationLike): PlainTime;
    subtract(duration: DurationLike): PlainTime;
    with(
      timeLike: PartialTemporalLike<TimeLikeObject>,
      options?: OverflowOptions,
    ): PlainTime;
    until(
      other: PlainTimeLike,
      options?: RoundingOptionsWithLargestUnit<TimeUnit>,
    ): Duration;
    since(
      other: PlainTimeLike,
      options?: RoundingOptionsWithLargestUnit<TimeUnit>,
    ): Duration;
    equals(other: PlainTimeLike): boolean;
    round(roundTo: PluralizeUnit<TimeUnit>): PlainTime;
    round(roundTo: RoundingOptions<TimeUnit>): PlainTime;
    toString(options?: PlainTimeToStringOptions): string;
    toLocaleString(
      locales?: Intl.LocalesArgument,
      options?: Intl.DateTimeFormatOptions,
    ): string;
    toJSON(): string;
    valueOf(): never;
    readonly [Symbol.toStringTag]: 'Temporal.PlainTime';
  }

  interface PlainTimeConstructor {
    new (
      hour?: number,
      minute?: number,
      second?: number,
      millisecond?: number,
      microsecond?: number,
      nanosecond?: number,
    ): PlainTime;
    readonly prototype: PlainTime;
    from(item: PlainTimeLike, options?: OverflowOptions): PlainTime;
    compare(one: PlainTimeLike, two: PlainTimeLike): number;
  }
  const PlainTime: PlainTimeConstructor;

  interface PlainDateTimeToStringOptions
    extends PlainDateToStringOptions, PlainTimeToStringOptions {}

  interface PlainDateTime {
    readonly calendarId: string;
    readonly era: string | undefined;
    readonly eraYear: number | undefined;
    readonly year: number;
    readonly month: number;
    readonly monthCode: string;
    readonly day: number;
    readonly hour: number;
    readonly minute: number;
    readonly second: number;
    readonly millisecond: number;
    readonly microsecond: number;
    readonly nanosecond: number;
    readonly dayOfWeek: number;
    readonly dayOfYear: number;
    readonly weekOfYear: number | undefined;
    readonly yearOfWeek: number | undefined;
    readonly daysInWeek: number;
    readonly daysInMonth: number;
    readonly daysInYear: number;
    readonly monthsInYear: number;
    readonly inLeapYear: boolean;
    with(
      dateTimeLike: PartialTemporalLike<DateTimeLikeObject>,
      options?: OverflowOptions,
    ): PlainDateTime;
    withPlainTime(plainTime?: PlainTimeLike): PlainDateTime;
    withCalendar(calendar: CalendarLike): PlainDateTime;
    add(duration: DurationLike, options?: OverflowOptions): PlainDateTime;
    subtract(duration: DurationLike, options?: OverflowOptions): PlainDateTime;
    until(
      other: PlainDateTimeLike,
      options?: RoundingOptionsWithLargestUnit<DateUnit | TimeUnit>,
    ): Duration;
    since(
      other: PlainDateTimeLike,
      options?: RoundingOptionsWithLargestUnit<DateUnit | TimeUnit>,
    ): Duration;
    round(roundTo: PluralizeUnit<'day' | TimeUnit>): PlainDateTime;
    round(roundTo: RoundingOptions<'day' | TimeUnit>): PlainDateTime;
    equals(other: PlainDateTimeLike): boolean;
    toString(options?: PlainDateTimeToStringOptions): string;
    toLocaleString(
      locales?: Intl.LocalesArgument,
      options?: Intl.DateTimeFormatOptions,
    ): string;
    toJSON(): string;
    valueOf(): never;
    toZonedDateTime(
      timeZone: TimeZoneLike,
      options?: DisambiguationOptions,
    ): ZonedDateTime;
    toPlainDate(): PlainDate;
    toPlainTime(): PlainTime;
    readonly [Symbol.toStringTag]: 'Temporal.PlainDateTime';
  }

  interface PlainDateTimeConstructor {
    new (
      isoYear: number,
      isoMonth: number,
      isoDay: number,
      hour?: number,
      minute?: number,
      second?: number,
      millisecond?: number,
      microsecond?: number,
      nanosecond?: number,
      calendar?: string,
    ): PlainDateTime;
    readonly prototype: PlainDateTime;
    from(item: PlainDateTimeLike, options?: OverflowOptions): PlainDateTime;
    compare(one: PlainDateTimeLike, two: PlainDateTimeLike): number;
  }
  const PlainDateTime: PlainDateTimeConstructor;

  interface ZonedDateTimeToStringOptions extends PlainDateTimeToStringOptions {
    readonly offset?: 'auto' | 'never' | undefined;
    readonly timeZoneName?: 'auto' | 'never' | 'critical' | undefined;
  }

  interface ZonedDateTimeFromOptions
    extends OverflowOptions, DisambiguationOptions {
    readonly offset?: 'use' | 'ignore' | 'prefer' | 'reject' | undefined;
  }

  interface ZonedDateTime {
    readonly calendarId: string;
    readonly timeZoneId: string;
    readonly era: string | undefined;
    readonly eraYear: number | undefined;
    readonly year: number;
    readonly month: number;
    readonly monthCode: string;
    readonly day: number;
    readonly hour: number;
    readonly minute: number;
    readonly second: number;
    readonly millisecond: number;
    readonly microsecond: number;
    readonly nanosecond: number;
    readonly epochMilliseconds: number;
    readonly epochNanoseconds: bigint;
    readonly dayOfWeek: number;
    readonly dayOfYear: number;
    readonly weekOfYear: number | undefined;
    readonly yearOfWeek: number | undefined;
    readonly hoursInDay: number;
    readonly daysInWeek: number;
    readonly daysInMonth: number;
    readonly daysInYear: number;
    readonly monthsInYear: number;
    readonly inLeapYear: boolean;
    readonly offsetNanoseconds: number;
    readonly offset: string;
    with(
      zonedDateTimeLike: PartialTemporalLike<ZonedDateTimeLikeObject>,
      options?: ZonedDateTimeFromOptions,
    ): ZonedDateTime;
    withPlainTime(plainTime?: PlainTimeLike): ZonedDateTime;
    withTimeZone(timeZone: TimeZoneLike): ZonedDateTime;
    withCalendar(calendar: CalendarLike): ZonedDateTime;
    add(duration: DurationLike, options?: OverflowOptions): ZonedDateTime;
    subtract(duration: DurationLike, options?: OverflowOptions): ZonedDateTime;
    until(
      other: ZonedDateTimeLike,
      options?: RoundingOptionsWithLargestUnit<DateUnit | TimeUnit>,
    ): Duration;
    since(
      other: ZonedDateTimeLike,
      options?: RoundingOptionsWithLargestUnit<DateUnit | TimeUnit>,
    ): Duration;
    round(roundTo: PluralizeUnit<'day' | TimeUnit>): ZonedDateTime;
    round(roundTo: RoundingOptions<'day' | TimeUnit>): ZonedDateTime;
    equals(other: ZonedDateTimeLike): boolean;
    toString(options?: ZonedDateTimeToStringOptions): string;
    toLocaleString(
      locales?: Intl.LocalesArgument,
      options?: Intl.DateTimeFormatOptions,
    ): string;
    toJSON(): string;
    valueOf(): never;
    startOfDay(): ZonedDateTime;
    getTimeZoneTransition(direction: 'next' | 'previous'): ZonedDateTime | null;
    getTimeZoneTransition(direction: TransitionOptions): ZonedDateTime | null;
    toInstant(): Instant;
    toPlainDate(): PlainDate;
    toPlainTime(): PlainTime;
    toPlainDateTime(): PlainDateTime;
    readonly [Symbol.toStringTag]: 'Temporal.ZonedDateTime';
  }

  interface ZonedDateTimeConstructor {
    new (
      epochNanoseconds: bigint,
      timeZone: string,
      calendar?: string,
    ): ZonedDateTime;
    readonly prototype: ZonedDateTime;
    from(
      item: ZonedDateTimeLike,
      options?: ZonedDateTimeFromOptions,
    ): ZonedDateTime;
    compare(one: ZonedDateTimeLike, two: ZonedDateTimeLike): number;
  }
  const ZonedDateTime: ZonedDateTimeConstructor;

  interface DurationRelativeToOptions {
    readonly relativeTo?: ZonedDateTimeLike | PlainDateLike | undefined;
  }

  interface DurationRoundingOptions
    extends
      DurationRelativeToOptions,
      RoundingOptionsWithLargestUnit<DateUnit | TimeUnit> {}

  interface DurationToStringOptions extends ToStringRoundingOptionsWithFractionalSeconds<
    Exclude<TimeUnit, 'hour' | 'minute'>
  > {}

  interface DurationTotalOptions extends DurationRelativeToOptions {
    readonly unit: PluralizeUnit<DateUnit | TimeUnit>;
  }

  interface Duration {
    readonly years: number;
    readonly months: number;
    readonly weeks: number;
    readonly days: number;
    readonly hours: number;
    readonly minutes: number;
    readonly seconds: number;
    readonly milliseconds: number;
    readonly microseconds: number;
    readonly nanoseconds: number;
    readonly sign: number;
    readonly blank: boolean;
    with(durationLike: PartialTemporalLike<DurationLikeObject>): Duration;
    negated(): Duration;
    abs(): Duration;
    add(other: DurationLike): Duration;
    subtract(other: DurationLike): Duration;
    round(roundTo: PluralizeUnit<'day' | TimeUnit>): Duration;
    round(roundTo: DurationRoundingOptions): Duration;
    total(totalOf: PluralizeUnit<'day' | TimeUnit>): number;
    total(totalOf: DurationTotalOptions): number;
    toString(options?: DurationToStringOptions): string;
    toLocaleString(
      locales?: Intl.LocalesArgument,
      options?: Intl.DurationFormatOptions,
    ): string;
    toJSON(): string;
    valueOf(): never;
    readonly [Symbol.toStringTag]: 'Temporal.Duration';
  }

  interface DurationConstructor {
    new (
      years?: number,
      months?: number,
      weeks?: number,
      days?: number,
      hours?: number,
      minutes?: number,
      seconds?: number,
      milliseconds?: number,
      microseconds?: number,
      nanoseconds?: number,
    ): Duration;
    readonly prototype: Duration;
    from(item: DurationLike): Duration;
    compare(
      one: DurationLike,
      two: DurationLike,
      options?: DurationRelativeToOptions,
    ): number;
  }
  const Duration: DurationConstructor;

  interface InstantToStringOptions extends PlainTimeToStringOptions {
    readonly timeZone?: TimeZoneLike | undefined;
  }

  interface Instant {
    readonly epochMilliseconds: number;
    readonly epochNanoseconds: bigint;
    add(duration: DurationLike): Instant;
    subtract(duration: DurationLike): Instant;
    until(
      other: InstantLike,
      options?: RoundingOptionsWithLargestUnit<TimeUnit>,
    ): Duration;
    since(
      other: InstantLike,
      options?: RoundingOptionsWithLargestUnit<TimeUnit>,
    ): Duration;
    round(roundTo: PluralizeUnit<TimeUnit>): Instant;
    round(roundTo: RoundingOptions<TimeUnit>): Instant;
    equals(other: InstantLike): boolean;
    toString(options?: InstantToStringOptions): string;
    toLocaleString(
      locales?: Intl.LocalesArgument,
      options?: Intl.DateTimeFormatOptions,
    ): string;
    toJSON(): string;
    valueOf(): never;
    toZonedDateTimeISO(timeZone: TimeZoneLike): ZonedDateTime;
    readonly [Symbol.toStringTag]: 'Temporal.Instant';
  }

  interface InstantConstructor {
    new (epochNanoseconds: bigint): Instant;
    readonly prototype: Instant;
    from(item: InstantLike): Instant;
    fromEpochMilliseconds(epochMilliseconds: number): Instant;
    fromEpochNanoseconds(epochNanoseconds: bigint): Instant;
    compare(one: InstantLike, two: InstantLike): number;
  }
  const Instant: InstantConstructor;

  interface PlainYearMonthToPlainDateOptions {
    readonly day: number;
  }

  interface PlainYearMonth {
    readonly calendarId: string;
    readonly era: string | undefined;
    readonly eraYear: number | undefined;
    readonly year: number;
    readonly month: number;
    readonly monthCode: string;
    readonly daysInYear: number;
    readonly daysInMonth: number;
    readonly monthsInYear: number;
    readonly inLeapYear: boolean;
    with(
      yearMonthLike: PartialTemporalLike<YearMonthLikeObject>,
      options?: OverflowOptions,
    ): PlainYearMonth;
    add(duration: DurationLike, options?: OverflowOptions): PlainYearMonth;
    subtract(duration: DurationLike, options?: OverflowOptions): PlainYearMonth;
    until(
      other: PlainYearMonthLike,
      options?: RoundingOptionsWithLargestUnit<'year' | 'month'>,
    ): Duration;
    since(
      other: PlainYearMonthLike,
      options?: RoundingOptionsWithLargestUnit<'year' | 'month'>,
    ): Duration;
    equals(other: PlainYearMonthLike): boolean;
    toString(options?: PlainDateToStringOptions): string;
    toLocaleString(
      locales?: Intl.LocalesArgument,
      options?: Intl.DateTimeFormatOptions,
    ): string;
    toJSON(): string;
    valueOf(): never;
    toPlainDate(item: PlainYearMonthToPlainDateOptions): PlainDate;
    readonly [Symbol.toStringTag]: 'Temporal.PlainYearMonth';
  }

  interface PlainYearMonthConstructor {
    new (
      isoYear: number,
      isoMonth: number,
      calendar?: string,
      referenceISODay?: number,
    ): PlainYearMonth;
    readonly prototype: PlainYearMonth;
    from(item: PlainYearMonthLike, options?: OverflowOptions): PlainYearMonth;
    compare(one: PlainYearMonthLike, two: PlainYearMonthLike): number;
  }
  const PlainYearMonth: PlainYearMonthConstructor;

  interface PlainMonthDayToPlainDateOptions {
    readonly era?: string | undefined;
    readonly eraYear?: number | undefined;
    readonly year?: number | undefined;
  }

  interface PlainMonthDay {
    readonly calendarId: string;
    readonly monthCode: string;
    readonly day: number;
    with(
      monthDayLike: PartialTemporalLike<DateLikeObject>,
      options?: OverflowOptions,
    ): PlainMonthDay;
    equals(other: PlainMonthDayLike): boolean;
    toString(options?: PlainDateToStringOptions): string;
    toLocaleString(
      locales?: Intl.LocalesArgument,
      options?: Intl.DateTimeFormatOptions,
    ): string;
    toJSON(): string;
    valueOf(): never;
    toPlainDate(item: PlainMonthDayToPlainDateOptions): PlainDate;
    readonly [Symbol.toStringTag]: 'Temporal.PlainMonthDay';
  }

  interface PlainMonthDayConstructor {
    new (
      isoMonth: number,
      isoDay: number,
      calendar?: string,
      referenceISOYear?: number,
    ): PlainMonthDay;
    readonly prototype: PlainMonthDay;
    from(item: PlainMonthDayLike, options?: OverflowOptions): PlainMonthDay;
  }
  const PlainMonthDay: PlainMonthDayConstructor;
}
