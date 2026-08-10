## 目標

以下のようなコードの生成を簡単に行えるようにすること。

```ts
import {
    DateUtils,
    Num,
    RecordUtils,
    isNumber,
    isRecord,
    pipe,
} from '@noshiro/ts-utils';

export type YearMonthDate = Readonly<{
    year: YearEnum;
    month: MonthEnum;
    date: DateEnum;
}>;

export const yearMonthDateDefaultValue = {
    year: pipe(DateUtils.today()).chain(DateUtils.getLocaleYear).value,
    month: pipe(DateUtils.today()).chain(DateUtils.getLocaleMonth).value,
    date: pipe(DateUtils.today()).chain(DateUtils.getLocaleDate).value,
} as const satisfies YearMonthDate;

export const isYearEnum = (a: unknown): a is YearEnum =>
    isNumber(a) && Number.isInteger(a) && a > 0;

export const isMonthEnum = (a: unknown): a is MonthEnum =>
    isNumber(a) && Number.isInteger(a) && Num.isInRange(1, 12)(a);

export const isDateEnum = (a: unknown): a is DateEnum =>
    isNumber(a) && Number.isInteger(a) && Num.isInRange(1, 31)(a);

export const isYearMonthDate = (a: unknown): a is YearMonthDate =>
    isRecord(a) &&
    RecordUtils.hasKeyValue(a, 'year', isYearEnum) &&
    RecordUtils.hasKeyValue(a, 'month', isMonthEnum) &&
    RecordUtils.hasKeyValue(a, 'date', isDateEnum);

const d = yearMonthDateDefaultValue;

export const fillYearMonthDate = (a?: unknown): YearMonthDate =>
    a === undefined || !isRecord(a)
        ? d
        : {
              year: RecordUtils.hasKeyValue(a, 'year', isYearEnum)
                  ? a.year
                  : d.year,
              month: RecordUtils.hasKeyValue(a, 'month', isMonthEnum)
                  ? a.month
                  : d.month,
              date: RecordUtils.hasKeyValue(a, 'date', isDateEnum)
                  ? a.date
                  : d.date,
          };
```

-   型作成時に必要なもの
    -   デフォルト値（プリミティヴの場合）
    -   （レコード型の場合）プロパティの io-ts 型定義
-   出力
    -   デフォルト値
    -   型（`typeof ***` のような形で ts 値から型の世界に戻す）
    -   `isA` 関数
    -   `fillA` 関数

```ts
const YearEnum = t.positiveNumber;
const MonthEnum = t.union([1,2,3,4,5,6,7,8,9,10,11,12]);

const YearMonthDate = t.type({
    year: YearEnum;
    month: MonthEnum;
    date: DateEnum;
});

type YearMonthDate = t.TypeOf<typeof YearMonthDate>
```
