import {
  type Index,
  type NegativeIndex,
} from '../type-level-integer/index.mjs';

/**
 * Represents an unsigned 8-bit integer.
 * A union of integer literals from `0` to `255` (2^8 - 1).
 *
 * Useful for representing byte values, color channel values (RGB),
 * or any data that fits within 8 bits of unsigned integer range.
 *
 * @example
 * ```ts
 * type RedChannel = Uint8; // 0-255 for RGB red component
 * type ByteValue = Uint8; // Single byte representation
 *
 * const isValidUint8 = (value: number): value is Uint8 =>
 *   Number.isInteger(value) && value >= 0 && value <= 255;
 * ```
 */
export type Uint8 = Index<256>;

/**
 * Represents an unsigned 9-bit integer.
 * A union of integer literals from `0` to `511` (2^9 - 1).
 *
 * Less commonly used than 8-bit or 16-bit integers, but useful for
 * specific protocols or data formats that require 9-bit precision.
 *
 * @example
 * ```ts
 * type NineBitValue = Uint9;
 *
 * const validate9Bit = (value: number): value is Uint9 =>
 *   Number.isInteger(value) && value >= 0 && value <= 511;
 * ```
 */
export type Uint9 = Index<512>;

/**
 * Represents an unsigned 10-bit integer.
 * A union of integer literals from `0` to `1023` (2^10 - 1).
 *
 * Commonly used in video processing and high-precision color representations
 * where 10-bit depth provides better color accuracy than 8-bit.
 *
 * @example
 * ```ts
 * type TenBitColor = Uint10; // 10-bit color depth
 * type PortNumber = Uint10; // Some port ranges
 *
 * const isValid10Bit = (value: number): value is Uint10 =>
 *   Number.isInteger(value) && value >= 0 && value <= 1023;
 * ```
 */
export type Uint10 = Index<1024>;

/**
 * Represents an unsigned 11-bit integer.
 * A union of integer literals from `0` to `2047` (2^11 - 1).
 *
 * The widest unsigned enum in this family, and the bound of the unsigned
 * integer-range utilities (`UintRange` / `UintRangeInclusive`).
 */
export type Uint11 = Index<2048>;

/**
 * Represents a signed 8-bit integer.
 * A union of integer literals from `-128` to `127`.
 */
export type Int8 = Readonly<Index<128> | NegativeIndex<128>>;

/**
 * Represents a signed 9-bit integer.
 * A union of integer literals from `-256` to `255`.
 */
export type Int9 = Readonly<Index<256> | NegativeIndex<256>>;

/**
 * Represents a signed 10-bit integer.
 * A union of integer literals from `-512` to `511`.
 */
export type Int10 = Readonly<Index<512> | NegativeIndex<512>>;

/**
 * Represents a signed 11-bit integer.
 * A union of integer literals from `-1024` to `1023`.
 *
 * The widest signed enum in this family, and the bound of the signed
 * integer-range utilities (`IntRange` / `IntRangeInclusive`).
 */
export type Int11 = Readonly<Index<1024> | NegativeIndex<1024>>;

/**
 * Represents the months of the year using 1-based indexing.
 * A union of integer literals from `1` (January) to `12` (December).
 *
 * This follows the common human-readable convention where January = 1,
 * unlike JavaScript's Date object which uses 0-based month indexing.
 *
 * @example
 * ```ts
 * const getMonthName = (month: MonthEnum): string => {
 *   const names = [
 *     'Jan',
 *     'Feb',
 *     'Mar',
 *     'Apr',
 *     'May',
 *     'Jun',
 *     'Jul',
 *     'Aug',
 *     'Sep',
 *     'Oct',
 *     'Nov',
 *     'Dec',
 *   ];
 *   return names[month - 1] ?? ''; // Convert to 0-based for array access
 * };
 *
 * const january = 1 satisfies MonthEnum;
 * const december = 12 satisfies MonthEnum;
 * // const invalid = 13 satisfies MonthEnum; // Error: not assignable to MonthEnum
 * ```
 */
export type MonthEnum = Exclude<Index<13>, 0>;

/**
 * Represents the zero-based index for months of the year.
 * A union of integer literals from `0` (January) to `11` (December).
 *
 * This matches JavaScript's Date object month indexing where January = 0.
 * Useful for direct interaction with Date constructors and methods.
 *
 * @example
 * ```ts
 * const createDate = (year: number, month: MonthIndexEnum, day: number) =>
 *   new Date(year, month, day);
 *
 * const januaryDate = createDate(2024, 0, 1); // January 1, 2024
 * const decemberDate = createDate(2024, 11, 31); // December 31, 2024
 *
 * // Convert from 1-based to 0-based
 * const toMonthIndex = (month: MonthEnum): MonthIndexEnum =>
 *   (month - 1) as MonthIndexEnum;
 * ```
 */
export type MonthIndexEnum = Index<12>;

/**
 * Represents the day of the month.
 * A union of integer literals from `1` to `31`.
 */
export type DateEnum = Exclude<Index<32>, 0>;

/**
 * Represents the zero-based index for the day of the week.
 * A union of integer literals from `0` (typically Sunday) to `6` (typically Saturday).
 */
export type DayOfWeekIndex = Index<7>;

/**
 * Represents the names of the days of the week.
 * A union of string literals: `'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thr' | 'Fri' | 'Sat'`.
 */
export type DayOfWeekName =
  'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thr' | 'Fri' | 'Sat';

/**
 * Represents the hours in a day using 24-hour format.
 * A union of integer literals from `0` (midnight) to `23` (11 PM).
 *
 * Uses the international standard 24-hour time format where:
 * - `0` represents midnight (00:00)
 * - `12` represents noon (12:00)
 * - `23` represents 11 PM (23:00)
 *
 * @example
 * ```ts
 * const formatHour = (hour: HoursEnum): string =>
 *   hour.toString().padStart(2, '0');
 *
 * const is12HourFormat = (hour: HoursEnum): string => {
 *   if (hour === 0) return '12 AM';
 *   if (hour === 12) return '12 PM';
 *   if (hour < 12) return `${hour} AM`;
 *   return `${hour - 12} PM`;
 * };
 *
 * const midnight = 0 satisfies HoursEnum;
 * const noon = 12 satisfies HoursEnum;
 * const elevenPM = 23 satisfies HoursEnum;
 * ```
 */
export type HoursEnum = Index<24>;

/**
 * Represents the minutes in an hour.
 * A union of integer literals from `0` to `59`.
 */
export type MinutesEnum = Sexagesimal;

/**
 * Represents the seconds in a minute.
 * A union of integer literals from `0` to `59`.
 */
export type SecondsEnum = Sexagesimal;

/**
 * Represents the milliseconds in a second.
 * A union of integer literals from `0` to `999`.
 */
export type MillisecondsEnum = Index<1000>;

/**
 * Represents a value in the sexagesimal system (base 60), commonly used for minutes and seconds.
 * A union of integer literals from `0` to `59`.
 */
export type Sexagesimal = Index<60>;

/**
 * Represents a percentage value as an integer.
 * A union of integer literals from `0` to `100`.
 *
 * Useful for representing progress, completion rates, or any value
 * that can be expressed as a whole number percentage.
 *
 * @example
 * ```ts
 * const calculateProgress = (completed: number, total: number): Percent => {
 *   const percentage = Math.round((completed / total) * 100);
 *   return Math.min(100, Math.max(0, percentage)) as Percent;
 * };
 *
 * const formatPercent = (value: Percent): string => `${value}%`;
 *
 * const fullProgress = 100 satisfies Percent;
 * const halfProgress = 50 satisfies Percent;
 * const noProgress = 0 satisfies Percent;
 *
 * // Usage in progress bars, loading indicators, etc.
 * type ProgressBarProps = {
 *   progress: Percent;
 *   showLabel?: boolean;
 * };
 * ```
 */
export type Percent = Index<101>;
