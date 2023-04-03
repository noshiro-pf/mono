import { type SafeUint } from './branded-types';
import { type Index, type NegativeIndex } from './index-type';
import { type StrictExclude } from './utils';

export type YearEnum = SafeUint;

/** `1 | 2 | ... | 12 */
export type MonthEnum = StrictExclude<Index<13>, 0>;

/** `1 | 2 | ... | 31 */
export type DateEnum = StrictExclude<Index<32>, 0>;

/** `0 | 1 | ... | 6 */
export type DayOfWeekIndex = Index<7>;

export type DayOfWeekName =
  // eslint-disable-next-line @typescript-eslint/sort-type-constituents
  'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thr' | 'Fri' | 'Sat';

/** `0 | 1 | ... | 23 */
export type HoursEnum = Index<24>;

/** `0 | 1 | ... | 59 */
export type MinutesEnum = Index<60>;

/** `0 | 1 | ... | 59 */
export type SecondsEnum = Index<60>;

/** `0 | 1 | ... | 999 */
export type MillisecondsEnum = Index<1000>;

/** `0 | 1 | ... | 100 */
export type Percent = Index<101>;

/** `0 | 1 | ... | 59 */
export type Sexagesimal = Index<60>;

/** `0 | 1 | ... | 255` */
export type Uint8 = Index<256>;

/** `0 | 1 | ... | 511` */
export type Uint9 = Index<512>;

/** `0 | 1 | ... | 1023` */
export type Uint10 = Index<1024>;

/** `-256 | -255 | ... | -1 | 0 | 1 | ... | 254 | 255` */
export type Int8 = Readonly<NegativeIndex<257> | Uint8>;

/** `-512 | -511 | ... | -1 | 0 | 1 | ... | 510 | 511` */
export type Int9 = Readonly<NegativeIndex<514> | Uint9>;

/** `-1024 | -1023 | ... | -1 | 0 | 1 | ... | 1022 | 1023` */
export type Int10 = Readonly<NegativeIndex<1025> | Uint10>;

// prettier-ignore
export type LowerAlphabet = (
  | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g'
  | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n'
  | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u'
  | 'v' | 'w' | 'x' | 'y' | 'z'
);

// prettier-ignore
export type UpperAlphabet = (
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
  | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N'
  | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U'
  | 'V' | 'W' | 'X' | 'Y' | 'Z'
);

export type Alphabet = LowerAlphabet | UpperAlphabet;
