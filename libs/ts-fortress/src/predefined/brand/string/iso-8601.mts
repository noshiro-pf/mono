import { Result, SafeNumber } from 'ts-std-forge';
import type { Brand, NonEmptyString } from 'ts-type-forge';
import { brand } from '../../../brand/index.mjs';
import { boolean, string } from '../../../primitives/index.mjs';
import { record } from '../../../record/index.mjs';
import type { Type } from '../../../type.mjs';

// A valid ISO 8601 string always begins with a 4-digit year, so `Iso8601` is
// branded on top of `NonEmptyString` and is assignable to it.
export type Iso8601 = Brand<NonEmptyString, 'Iso8601'>;

/**
 * @link https://github.com/validatorjs/validator.js/tree/v13.1.17?tab=readme-ov-file#validators
 * @link https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
 * @link https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-date-time-string-format
 */
export const iso8601 = (options?: Iso8601ValidatorOption): Type<Iso8601> => {
  const filledOptions = Iso8601ValidatorOption.fill(options);

  const is = isISO8601(filledOptions);

  return brand<NonEmptyString, readonly ['Iso8601']>({
    baseType: string(filledOptions.defaultValue, { nonempty: true }),
    is,
    brandKeys: ['Iso8601'],
    typeName: 'Iso8601',
  });
};

/**
 * The options {@link iso8601} takes, all or none: `strict` rejects a calendar
 * date that does not exist (`2009-02-29`), `strictSeparator` a separator
 * between date and time other than `T`, and `defaultValue` is the type's
 * default. Left out, both checks are off and the default is the Unix epoch,
 * `1970-01-01T00:00:00.000Z`, so that the type does not depend on when its
 * module was loaded.
 */
export type Iso8601ValidatorOption = Readonly<{
  strict: boolean;
  strictSeparator: boolean;
  defaultValue: string;
}>;

// Annotated rather than inferred, so that declaration emit writes
// `Type<Iso8601ValidatorOption>` instead of expanding the codec structurally —
// around a hundred lines of it, for a const this module does not export.
//
// The type above is hand-written because the annotation needs it to exist
// first: `TypeOf<typeof Iso8601ValidatorOption>` would be circular here.
const Iso8601ValidatorOption: Type<Iso8601ValidatorOption> = record({
  /**
   * If strict is true, date strings with invalid dates like 2009-02-29 will be
   * invalid, and so will week 53 of a year that has 52 ISO weeks (2010-W53-1).
   */
  strict: boolean(),

  /**
   * If strictSeparator is true, date strings with date and time separated by anything other than a T will be invalid.
   */
  strictSeparator: boolean(),

  /**
   * @default '1970-01-01T00:00:00.000Z'
   */
  defaultValue: string('1970-01-01T00:00:00.000Z'),
});

const parseDigits = (digits: string | undefined): number | undefined => {
  if (digits === undefined) {
    return undefined;
  }

  const parsed = SafeNumber.parseInteger(digits);

  return Result.isOk(parsed) ? parsed.value : undefined;
};

const isLeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

const positiveModulo = (n: number, m: 4 | 7 | 100 | 400): number =>
  ((n % m) + m) % m;

/**
 * The number of ISO weeks in `year`: 53 when its January 1 is a Thursday, or a
 * Wednesday in a leap year, and 52 otherwise. The weekday comes from Gauss's
 * formula (0 is Sunday) rather than `Date`, which reads the years 0–99 as
 * 1900–1999.
 */
const isoWeeksIn = (year: number): 52 | 53 => {
  const y = year - 1;

  const january1 = positiveModulo(
    1 +
      5 * positiveModulo(y, 4) +
      4 * positiveModulo(y, 100) +
      6 * positiveModulo(y, 400),
    7,
  );

  return january1 === 4 || (january1 === 3 && isLeapYear(year)) ? 53 : 52;
};

const isValidDate = (str: string): boolean => {
  // str must have passed the ISO8601 check this check is meant to catch invalid
  // dates like 2009-02-31 first check for ordinal dates
  const ordinalMatch = /^(\d{4})-?(\d{3})([ T]\.*|$)/u.exec(str) ?? undefined;

  if (ordinalMatch !== undefined) {
    const oYear = parseDigits(ordinalMatch[1]);

    const oDay = parseDigits(ordinalMatch[2]);

    return (
      oYear !== undefined &&
      oDay !== undefined &&
      (isLeapYear(oYear) ? oDay <= 366 : oDay <= 365)
    );
  }

  // The sign is part of the year: -2008 has 53 weeks and 2008 has 52.
  const weekMatch = /^([+-]?\d{4})-?W(\d{2})/u.exec(str) ?? undefined;

  if (weekMatch !== undefined) {
    const wYear = parseDigits(weekMatch[1]);

    const week = parseDigits(weekMatch[2]);

    return (
      wYear !== undefined && week !== undefined && week <= isoWeeksIn(wYear)
    );
  }

  const match = /(\d{4})-?(\d{0,2})-?(\d*)/u.exec(str) ?? undefined;

  const year = parseDigits(match?.[1]);

  // An absent month or day is an empty capture, which leaves the part unchecked
  // rather than reading as `0` (the reduced forms `2009` and `2009-05` are
  // valid ISO 8601).
  const month = parseDigits(match?.[2]);

  const date = parseDigits(match?.[3]);

  // create a date object and compare
  const d = new Date(
    `${year}-${`0${month ?? 1}`.slice(-2)}-${`0${date ?? 1}`.slice(-2)}`,
  );

  if (month !== undefined && date !== undefined) {
    return (
      d.getUTCFullYear() === year &&
      d.getUTCMonth() + 1 === month &&
      d.getUTCDate() === date
    );
  }

  return true;
};

const isISO8601 =
  ({ strict, strictSeparator }: Iso8601ValidatorOption) =>
  (str: string): str is Iso8601 => {
    const check = strictSeparator
      ? regexpIso8601StrictSeparator.test(str)
      : regexpIso8601.test(str);

    return check && strict ? isValidDate(str) : check;
  };

// from http://goo.gl/0ejHHW
const regexpIso8601 =
  // eslint-disable-next-line security/detect-unsafe-regex
  /^([+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W(0[1-9]|[1-4]\d|5[0-3])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([\sT]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([,.]\d+(?!:))?)?(\17[0-5]\d([,.]\d+)?)?([Zz]|([+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/u;

// same as above, except with a strict 'T' separator between date and time
const regexpIso8601StrictSeparator =
  // eslint-disable-next-line security/detect-unsafe-regex
  /^([+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W(0[1-9]|[1-4]\d|5[0-3])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))(T((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([,.]\d+(?!:))?)?(\17[0-5]\d([,.]\d+)?)?([Zz]|([+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/u;
