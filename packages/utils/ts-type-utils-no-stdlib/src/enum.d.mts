/** `0 | 1 | ... | 100` */
type Percent = Index<101>;

/** `0 | 1 | ... | 59` */
type Sexagesimal = Index<60>;

/** `0 | 1 | ... | 255` */
type Uint8 = Index<256>;

/** `0 | 1 | ... | 511` */
type Uint9 = Index<512>;

/** `0 | 1 | ... | 1023` */
type Uint10 = Index<1024>;

/** `-128 | -127 | ... | -1 | 0 | 1 | ... | 126 | 127` */
type Int8 = Readonly<Index<128> | NegativeIndex<128>>;

/** `-256 | -255 | ... | -1 | 0 | 1 | ... | 254 | 255` */
type Int9 = Readonly<Index<256> | NegativeIndex<256>>;

/** `-512 | -511 | ... | -1 | 0 | 1 | ... | 510 | 511` */
type Int10 = Readonly<Index<512> | NegativeIndex<512>>;

/** `SafeUint` */
type YearEnum = SafeUint;

/** `1 | 2 | ... | 12` */
type MonthEnum = Exclude<Index<13>, 0>;

/** `0 | 1 | ... | 11` */
type MonthIndexEnum = Index<12>;

/** `1 | 2 | ... | 31` */
type DateEnum = Exclude<Index<32>, 0>;

/** `0 | 1 | ... | 6` */
type DayOfWeekIndex = Index<7>;

/** `'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thr' | 'Fri' | 'Sat'` */
type DayOfWeekName =
  // eslint-disable-next-line @typescript-eslint/sort-type-constituents
  'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thr' | 'Fri' | 'Sat';

/** `0 | 1 | ... | 23` */
type HoursEnum = Index<24>;

/** `0 | 1 | ... | 59` */
type MinutesEnum = Sexagesimal;

/** `0 | 1 | ... | 59` */
type SecondsEnum = Sexagesimal;

/** `0 | 1 | ... | 999` */
type MillisecondsEnum = Index<1000>;

// prettier-ignore
/** ` 'a' | 'b' | 'c'  | ... | 'z'` */
type LowerAlphabet = (
  | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g'
  | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n'
  | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u'
  | 'v' | 'w' | 'x' | 'y' | 'z'
);

/** `'A' | 'B' | 'C' | ... | 'Z'` */
type UpperAlphabet = Uppercase<LowerAlphabet>;

/** ` 'A' | ... | 'Z' | 'a' | ... | 'z'` */
type Alphabet = LowerAlphabet | UpperAlphabet;
