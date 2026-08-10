import {
  type FixedLengthString,
  type MaxLengthString,
  type MinLengthString,
} from 'ts-type-forge';

// embed-sample-code-ignore-above

const countryCode = 'JP' as FixedLengthString<2>;

const atMost5: MaxLengthString<5> = countryCode; // OK (2 <= 5)
const nonEmpty: MinLengthString<1> = countryCode; // OK (2 >= 1)
// const threeChars: FixedLengthString<3> = countryCode; // Error!

// embed-sample-code-ignore-below
export { atMost5, nonEmpty };
