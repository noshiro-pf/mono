/**
 * Represents an unsigned 8-bit integer.
 * A union of integer literals from `0` to `255`.
 */
type Uint8 = Index<256>;

/**
 * Represents an unsigned 9-bit integer.
 * A union of integer literals from `0` to `511`.
 */
type Uint9 = Index<512>;

/**
 * Represents an unsigned 10-bit integer.
 * A union of integer literals from `0` to `1023`.
 */
type Uint10 = Index<1024>;

/**
 * Represents a signed 8-bit integer.
 * A union of integer literals from `-128` to `127`.
 */
type Int8 = Readonly<Index<128> | NegativeIndex<128>>;

/**
 * Represents a signed 9-bit integer.
 * A union of integer literals from `-256` to `255`.
 */
type Int9 = Readonly<Index<256> | NegativeIndex<256>>;

/**
 * Represents a signed 10-bit integer.
 * A union of integer literals from `-512` to `511`.
 */
type Int10 = Readonly<Index<512> | NegativeIndex<512>>;

/**
 * Represents the months of the year, 1-based.
 * A union of integer literals from `1` to `12`.
 */
type MonthEnum = Exclude<Index<13>, 0>;

/**
 * Represents the zero-based index for months of the year.
 * A union of integer literals from `0` (January) to `11` (December).
 */
type MonthIndexEnum = Index<12>;

/**
 * Represents the day of the month.
 * A union of integer literals from `1` to `31`.
 */
type DateEnum = Exclude<Index<32>, 0>;

/**
 * Represents the zero-based index for the day of the week.
 * A union of integer literals from `0` (typically Sunday) to `6` (typically Saturday).
 */
type DayOfWeekIndex = Index<7>;

/**
 * Represents the names of the days of the week.
 * A union of string literals: `'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thr' | 'Fri' | 'Sat'`.
 */
type DayOfWeekName = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thr' | 'Fri' | 'Sat';

/**
 * Represents the hours in a day (24-hour format).
 * A union of integer literals from `0` to `23`.
 */
type HoursEnum = Index<24>;

/**
 * Represents the minutes in an hour.
 * A union of integer literals from `0` to `59`.
 */
type MinutesEnum = Sexagesimal;

/**
 * Represents the seconds in a minute.
 * A union of integer literals from `0` to `59`.
 */
type SecondsEnum = Sexagesimal;

/**
 * Represents the milliseconds in a second.
 * A union of integer literals from `0` to `999`.
 */
type MillisecondsEnum = Index<1000>;

/**
 * Represents a value in the sexagesimal system (base 60), commonly used for minutes and seconds.
 * A union of integer literals from `0` to `59`.
 */
type Sexagesimal = Index<60>;

/**
 * Represents a percentage value.
 * A union of integer literals from `0` to `100`.
 */
type Percent = Index<101>;
