import { brandedString } from '../../../brand/index.mjs';
import { boolean, string } from '../../../primitives/index.mjs';
import { record } from '../../../record/index.mjs';
import { type Type, type TypeOf } from '../../../type.mjs';

/**
 * @link https://github.com/validatorjs/validator.js/tree/v13.1.17?tab=readme-ov-file#validators
 * @link https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString
 * @link https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-date-time-string-format
 */
export const iso8601 = (options?: ISO8601ValidatorOption): Type<Iso8601> => {
  const filledOptions = ISO8601ValidatorOption.fill(options);

  const is = isISO8601(filledOptions);

  return brandedString({
    is,
    defaultValue: filledOptions.defaultValue,
    typeName: 'Iso8601',
  });
};

const ISO8601ValidatorOption = record({
  /**
   *  If strict is true, date strings with invalid dates like 2009-02-29 will be invalid.
   */
  strict: boolean(false),

  /**
   * If strictSeparator is true, date strings with date and time separated by anything other than a T will be invalid.
   */
  strictSeparator: boolean(false),

  /**
   * @default new Date().toISOString()
   */
  defaultValue: string(new Date().toISOString()),
});

type ISO8601ValidatorOption = TypeOf<typeof ISO8601ValidatorOption>;

const isISO8601 =
  (options?: Partial<StrictOmit<ISO8601ValidatorOption, 'defaultValue'>>) =>
  (str: string): str is Iso8601 => {
    const filledOptions = ISO8601ValidatorOption.fill(options);

    const check = filledOptions.strictSeparator
      ? regexpIso8601StrictSeparator.test(str)
      : regexpIso8601.test(str);

    if (check && filledOptions.strict) return isValidDate(str);

    return check;
  };

// from http://goo.gl/0ejHHW
const regexpIso8601 =
  // eslint-disable-next-line security/detect-unsafe-regex
  /^([+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-3])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([\sT]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([,.]\d+(?!:))?)?(\17[0-5]\d([,.]\d+)?)?([Zz]|([+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/u;

// same as above, except with a strict 'T' separator between date and time
const regexpIso8601StrictSeparator =
  // eslint-disable-next-line security/detect-unsafe-regex
  /^([+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-3])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))(T((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([,.]\d+(?!:))?)?(\17[0-5]\d([,.]\d+)?)?([Zz]|([+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/u;

const isValidDate = (str: string): boolean => {
  // str must have passed the ISO8601 check
  // this check is meant to catch invalid dates
  // like 2009-02-31
  // first check for ordinal dates
  const ordinalMatch = /^(\d{4})-?(\d{3})([ T]\.*|$)/u.exec(str);

  if (ordinalMatch !== null) {
    const oYear = Number(ordinalMatch[1]);

    const oDay = Number(ordinalMatch[2]);

    // if is leap year
    if ((oYear % 4 === 0 && oYear % 100 !== 0) || oYear % 400 === 0)
      return oDay <= 366;

    return oDay <= 365;
  }

  const match = /(\d{4})-?(\d{0,2})-?(\d*)/u.exec(str)?.map(Number);

  const year = match?.[1];

  const month: number | undefined = match?.[2];

  const date: number | undefined = match?.[3];

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
