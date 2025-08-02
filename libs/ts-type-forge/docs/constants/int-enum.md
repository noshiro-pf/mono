[**ts-type-forge**](../README.md)

---

[ts-type-forge](../README.md) / constants/int-enum

# constants/int-enum

## Type Aliases

### Uint8

> **Uint8** = [`Index`](../type-level-integer/index-type.md#index)\<`256`\>

Defined in: [src/constants/int-enum.d.mts:18](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L18)

Represents an unsigned 8-bit integer.
A union of integer literals from `0` to `255` (2^8 - 1).

Useful for representing byte values, color channel values (RGB),
or any data that fits within 8 bits of unsigned integer range.

#### Example

```ts
type RedChannel = Uint8; // 0-255 for RGB red component
type ByteValue = Uint8; // Single byte representation

const isValidUint8 = (value: number): value is Uint8 => {
    return Number.isInteger(value) && value >= 0 && value <= 255;
};
```

---

### Uint9

> **Uint9** = [`Index`](../type-level-integer/index-type.md#index)\<`512`\>

Defined in: [src/constants/int-enum.d.mts:36](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L36)

Represents an unsigned 9-bit integer.
A union of integer literals from `0` to `511` (2^9 - 1).

Less commonly used than 8-bit or 16-bit integers, but useful for
specific protocols or data formats that require 9-bit precision.

#### Example

```ts
type NineBitValue = Uint9;

const validate9Bit = (value: number): value is Uint9 => {
    return Number.isInteger(value) && value >= 0 && value <= 511;
};
```

---

### Uint10

> **Uint10** = [`Index`](../type-level-integer/index-type.md#index)\<`1024`\>

Defined in: [src/constants/int-enum.d.mts:55](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L55)

Represents an unsigned 10-bit integer.
A union of integer literals from `0` to `1023` (2^10 - 1).

Commonly used in video processing and high-precision color representations
where 10-bit depth provides better color accuracy than 8-bit.

#### Example

```ts
type TenBitColor = Uint10; // 10-bit color depth
type PortNumber = Uint10; // Some port ranges

const isValid10Bit = (value: number): value is Uint10 => {
    return Number.isInteger(value) && value >= 0 && value <= 1023;
};
```

---

### Int8

> **Int8** = `Readonly`\<[`Index`](../type-level-integer/index-type.md#index)\<`128`\> \| [`NegativeIndex`](../type-level-integer/index-type.md#negativeindex)\<`128`\>\>

Defined in: [src/constants/int-enum.d.mts:61](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L61)

Represents a signed 8-bit integer.
A union of integer literals from `-128` to `127`.

---

### Int9

> **Int9** = `Readonly`\<[`Index`](../type-level-integer/index-type.md#index)\<`256`\> \| [`NegativeIndex`](../type-level-integer/index-type.md#negativeindex)\<`256`\>\>

Defined in: [src/constants/int-enum.d.mts:67](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L67)

Represents a signed 9-bit integer.
A union of integer literals from `-256` to `255`.

---

### Int10

> **Int10** = `Readonly`\<[`Index`](../type-level-integer/index-type.md#index)\<`512`\> \| [`NegativeIndex`](../type-level-integer/index-type.md#negativeindex)\<`512`\>\>

Defined in: [src/constants/int-enum.d.mts:73](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L73)

Represents a signed 10-bit integer.
A union of integer literals from `-512` to `511`.

---

### MonthEnum

> **MonthEnum** = `Exclude`\<[`Index`](../type-level-integer/index-type.md#index)\<`13`\>, `0`\>

Defined in: [src/constants/int-enum.d.mts:95](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L95)

Represents the months of the year using 1-based indexing.
A union of integer literals from `1` (January) to `12` (December).

This follows the common human-readable convention where January = 1,
unlike JavaScript's Date object which uses 0-based month indexing.

#### Example

```ts
const getMonthName = (month: MonthEnum): string => {
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return names[month - 1]; // Convert to 0-based for array access
};

type January = 1 satisfies MonthEnum;
type December = 12 satisfies MonthEnum;
// type Invalid = 13; // Error: not assignable to MonthEnum
```

---

### MonthIndexEnum

> **MonthIndexEnum** = [`Index`](../type-level-integer/index-type.md#index)\<`12`\>

Defined in: [src/constants/int-enum.d.mts:117](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L117)

Represents the zero-based index for months of the year.
A union of integer literals from `0` (January) to `11` (December).

This matches JavaScript's Date object month indexing where January = 0.
Useful for direct interaction with Date constructors and methods.

#### Example

```ts
const createDate = (year: number, month: MonthIndexEnum, day: number) => {
    return new Date(year, month, day); // month is 0-based in Date constructor
};

const januaryDate = createDate(2024, 0, 1); // January 1, 2024
const decemberDate = createDate(2024, 11, 31); // December 31, 2024

// Convert from 1-based to 0-based
const toMonthIndex = (month: MonthEnum): MonthIndexEnum =>
    (month - 1) as MonthIndexEnum;
```

---

### DateEnum

> **DateEnum** = `Exclude`\<[`Index`](../type-level-integer/index-type.md#index)\<`32`\>, `0`\>

Defined in: [src/constants/int-enum.d.mts:123](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L123)

Represents the day of the month.
A union of integer literals from `1` to `31`.

---

### DayOfWeekIndex

> **DayOfWeekIndex** = [`Index`](../type-level-integer/index-type.md#index)\<`7`\>

Defined in: [src/constants/int-enum.d.mts:129](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L129)

Represents the zero-based index for the day of the week.
A union of integer literals from `0` (typically Sunday) to `6` (typically Saturday).

---

### DayOfWeekName

> **DayOfWeekName** = `"Sun"` \| `"Mon"` \| `"Tue"` \| `"Wed"` \| `"Thr"` \| `"Fri"` \| `"Sat"`

Defined in: [src/constants/int-enum.d.mts:135](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L135)

Represents the names of the days of the week.
A union of string literals: `'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thr' | 'Fri' | 'Sat'`.

---

### HoursEnum

> **HoursEnum** = [`Index`](../type-level-integer/index-type.md#index)\<`24`\>

Defined in: [src/constants/int-enum.d.mts:164](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L164)

Represents the hours in a day using 24-hour format.
A union of integer literals from `0` (midnight) to `23` (11 PM).

Uses the international standard 24-hour time format where:

- `0` represents midnight (00:00)
- `12` represents noon (12:00)
- `23` represents 11 PM (23:00)

#### Example

```ts
const formatHour = (hour: HoursEnum): string => {
  return hour.toString().padStart(2, '0');
};

const is12HourFormat = (hour: HoursEnum): string => {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
};

type Midnight = 0 satisfies HoursEnum;
type Noon = 12 satisfies HoursEnum;
type ElevenPM = 23 satisfies HoursEnum;
```

---

### MinutesEnum

> **MinutesEnum** = [`Sexagesimal`](#sexagesimal)

Defined in: [src/constants/int-enum.d.mts:170](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L170)

Represents the minutes in an hour.
A union of integer literals from `0` to `59`.

---

### SecondsEnum

> **SecondsEnum** = [`Sexagesimal`](#sexagesimal)

Defined in: [src/constants/int-enum.d.mts:176](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L176)

Represents the seconds in a minute.
A union of integer literals from `0` to `59`.

---

### MillisecondsEnum

> **MillisecondsEnum** = [`Index`](../type-level-integer/index-type.md#index)\<`1000`\>

Defined in: [src/constants/int-enum.d.mts:182](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L182)

Represents the milliseconds in a second.
A union of integer literals from `0` to `999`.

---

### Sexagesimal

> **Sexagesimal** = [`Index`](../type-level-integer/index-type.md#index)\<`60`\>

Defined in: [src/constants/int-enum.d.mts:188](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L188)

Represents a value in the sexagesimal system (base 60), commonly used for minutes and seconds.
A union of integer literals from `0` to `59`.

---

### Percent

> **Percent** = [`Index`](../type-level-integer/index-type.md#index)\<`101`\>

Defined in: [src/constants/int-enum.d.mts:217](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L217)

Represents a percentage value as an integer.
A union of integer literals from `0` to `100`.

Useful for representing progress, completion rates, or any value
that can be expressed as a whole number percentage.

#### Example

```ts
const calculateProgress = (completed: number, total: number): Percent => {
  const percentage = Math.round((completed / total) * 100);
  return Math.min(100, Math.max(0, percentage)) as Percent;
};

const formatPercent = (value: Percent): string => `${value}%`;

type FullProgress = 100 satisfies Percent;
type HalfProgress = 50 satisfies Percent;
type NoProgress = 0 satisfies Percent;

// Usage in progress bars, loading indicators, etc.
interface ProgressBarProps {
  progress: Percent;
  showLabel?: boolean;
}
```
