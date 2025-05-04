[**Documentation**](../README.md)

---

[Documentation](../README.md) / constants/int-enum

# constants/int-enum

## Type Aliases

### DateEnum

> **DateEnum** = `Exclude`\<[`Index`](../type-level-integer/index-type.md#index)\<`32`\>, `0`\>

Defined in: [constants/int-enum.d.mts:53](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L53)

Represents the day of the month.
A union of integer literals from `1` to `31`.

---

### DayOfWeekIndex

> **DayOfWeekIndex** = [`Index`](../type-level-integer/index-type.md#index)\<`7`\>

Defined in: [constants/int-enum.d.mts:59](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L59)

Represents the zero-based index for the day of the week.
A union of integer literals from `0` (typically Sunday) to `6` (typically Saturday).

---

### DayOfWeekName

> **DayOfWeekName** = `"Sun"` \| `"Mon"` \| `"Tue"` \| `"Wed"` \| `"Thr"` \| `"Fri"` \| `"Sat"`

Defined in: [constants/int-enum.d.mts:65](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L65)

Represents the names of the days of the week.
A union of string literals: `'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thr' | 'Fri' | 'Sat'`.

---

### HoursEnum

> **HoursEnum** = [`Index`](../type-level-integer/index-type.md#index)\<`24`\>

Defined in: [constants/int-enum.d.mts:71](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L71)

Represents the hours in a day (24-hour format).
A union of integer literals from `0` to `23`.

---

### Int10

> **Int10** = `Readonly`\<[`Index`](../type-level-integer/index-type.md#index)\<`512`\> \| [`NegativeIndex`](../type-level-integer/index-type.md#negativeindex)\<`512`\>\>

Defined in: [constants/int-enum.d.mts:35](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L35)

Represents a signed 10-bit integer.
A union of integer literals from `-512` to `511`.

---

### Int8

> **Int8** = `Readonly`\<[`Index`](../type-level-integer/index-type.md#index)\<`128`\> \| [`NegativeIndex`](../type-level-integer/index-type.md#negativeindex)\<`128`\>\>

Defined in: [constants/int-enum.d.mts:23](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L23)

Represents a signed 8-bit integer.
A union of integer literals from `-128` to `127`.

---

### Int9

> **Int9** = `Readonly`\<[`Index`](../type-level-integer/index-type.md#index)\<`256`\> \| [`NegativeIndex`](../type-level-integer/index-type.md#negativeindex)\<`256`\>\>

Defined in: [constants/int-enum.d.mts:29](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L29)

Represents a signed 9-bit integer.
A union of integer literals from `-256` to `255`.

---

### MillisecondsEnum

> **MillisecondsEnum** = [`Index`](../type-level-integer/index-type.md#index)\<`1000`\>

Defined in: [constants/int-enum.d.mts:89](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L89)

Represents the milliseconds in a second.
A union of integer literals from `0` to `999`.

---

### MinutesEnum

> **MinutesEnum** = [`Sexagesimal`](#sexagesimal)

Defined in: [constants/int-enum.d.mts:77](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L77)

Represents the minutes in an hour.
A union of integer literals from `0` to `59`.

---

### MonthEnum

> **MonthEnum** = `Exclude`\<[`Index`](../type-level-integer/index-type.md#index)\<`13`\>, `0`\>

Defined in: [constants/int-enum.d.mts:41](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L41)

Represents the months of the year, 1-based.
A union of integer literals from `1` to `12`.

---

### MonthIndexEnum

> **MonthIndexEnum** = [`Index`](../type-level-integer/index-type.md#index)\<`12`\>

Defined in: [constants/int-enum.d.mts:47](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L47)

Represents the zero-based index for months of the year.
A union of integer literals from `0` (January) to `11` (December).

---

### Percent

> **Percent** = [`Index`](../type-level-integer/index-type.md#index)\<`101`\>

Defined in: [constants/int-enum.d.mts:101](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L101)

Represents a percentage value.
A union of integer literals from `0` to `100`.

---

### SecondsEnum

> **SecondsEnum** = [`Sexagesimal`](#sexagesimal)

Defined in: [constants/int-enum.d.mts:83](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L83)

Represents the seconds in a minute.
A union of integer literals from `0` to `59`.

---

### Sexagesimal

> **Sexagesimal** = [`Index`](../type-level-integer/index-type.md#index)\<`60`\>

Defined in: [constants/int-enum.d.mts:95](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L95)

Represents a value in the sexagesimal system (base 60), commonly used for minutes and seconds.
A union of integer literals from `0` to `59`.

---

### Uint10

> **Uint10** = [`Index`](../type-level-integer/index-type.md#index)\<`1024`\>

Defined in: [constants/int-enum.d.mts:17](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L17)

Represents an unsigned 10-bit integer.
A union of integer literals from `0` to `1023`.

---

### Uint8

> **Uint8** = [`Index`](../type-level-integer/index-type.md#index)\<`256`\>

Defined in: [constants/int-enum.d.mts:5](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L5)

Represents an unsigned 8-bit integer.
A union of integer literals from `0` to `255`.

---

### Uint9

> **Uint9** = [`Index`](../type-level-integer/index-type.md#index)\<`512`\>

Defined in: [constants/int-enum.d.mts:11](https://github.com/noshiro-pf/ts-type-forge/blob/main/src/constants/int-enum.d.mts#L11)

Represents an unsigned 9-bit integer.
A union of integer literals from `0` to `511`.
