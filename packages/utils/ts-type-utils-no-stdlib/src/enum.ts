import { type SafeUint } from './branded-types';
import { type Index, type NegativeIndex } from './index-type';

/** `SafeUint` */
export type YearEnum = SafeUint;

/** `1 | 2 | ... | 12` */
export type MonthEnum = Exclude<Index<13>, 0>;

/** `0 | 1 | ... | 11` */
export type MonthIndexEnum = Index<12>;

/** `1 | 2 | ... | 31` */
export type DateEnum = Exclude<Index<32>, 0>;

/** `0 | 1 | ... | 6` */
export type DayOfWeekIndex = Index<7>;

/** `'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thr' | 'Fri' | 'Sat'` */
export type DayOfWeekName =
  // eslint-disable-next-line @typescript-eslint/sort-type-constituents
  'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thr' | 'Fri' | 'Sat';

/** `0 | 1 | ... | 23` */
export type HoursEnum = Index<24>;

/** `0 | 1 | ... | 59` */
export type MinutesEnum = Index<60>;

/** `0 | 1 | ... | 59` */
export type SecondsEnum = Index<60>;

/** `0 | 1 | ... | 999` */
export type MillisecondsEnum = Index<1000>;

/** `0 | 1 | ... | 100` */
export type Percent = Index<101>;

/** `0 | 1 | ... | 59` */
export type Sexagesimal = Index<60>;

/** `0 | 1 | ... | 255` */
export type Uint8 = Index<256>;

/** `0 | 1 | ... | 511` */
export type Uint9 = Index<512>;

/** `0 | 1 | ... | 1023` */
export type Uint10 = Index<1024>;

/** `-128 | -127 | ... | -1 | 0 | 1 | ... | 126 | 127` */
export type Int8 = Readonly<Index<128> | NegativeIndex<129>>;

/** `-256 | -255 | ... | -1 | 0 | 1 | ... | 254 | 255` */
export type Int9 = Readonly<Index<256> | NegativeIndex<257>>;

/** `-512 | -511 | ... | -1 | 0 | 1 | ... | 510 | 511` */
export type Int10 = Readonly<Index<512> | NegativeIndex<513>>;

// prettier-ignore
/** ` 'a' | 'b' | 'c'  | ... | 'z'` */
export type LowerAlphabet = (
  | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g'
  | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n'
  | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u'
  | 'v' | 'w' | 'x' | 'y' | 'z'
);

// prettier-ignore
/** `'A' | 'B' | 'C' | ... | 'Z'` */
export type UpperAlphabet = (
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
  | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N'
  | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U'
  | 'V' | 'W' | 'X' | 'Y' | 'Z'
);

/** ` 'A' | ... | 'Z' | 'a' | ... | 'z'` */
export type Alphabet = LowerAlphabet | UpperAlphabet;
