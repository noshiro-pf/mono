## 目標

以下のようなコードの生成を簡単に行えるようにすること。

```ts
import {
    IDate,
    IRecord,
    isNumber,
    isRecord,
    Num,
    pipe,
} from '@noshiro/ts-utils';

export type YearMonthDate = Readonly<{
    year: YearEnum;
    month: MonthEnum;
    date: DateEnum;
}>;

export const yearMonthDateDefaultValue: YearMonthDate = {
    year: pipe(IDate.today()).chain(IDate.getLocaleYear).value,
    month: pipe(IDate.today()).chain(IDate.getLocaleMonth).value,
    date: pipe(IDate.today()).chain(IDate.getLocaleDate).value,
} as const;

export const isYearEnum = (a: unknown): a is YearEnum =>
    isNumber(a) && Num.isInt(a) && a > 0;

export const isMonthEnum = (a: unknown): a is MonthEnum =>
    isNumber(a) && Num.isInt(a) && Num.isInRange(1, 12)(a);

export const isDateEnum = (a: unknown): a is DateEnum =>
    isNumber(a) && Num.isInt(a) && Num.isInRange(1, 31)(a);

export const isYearMonthDate = (a: unknown): a is YearMonthDate =>
    isRecord(a) &&
    IRecord.hasKeyValue(a, 'year', isYearEnum) &&
    IRecord.hasKeyValue(a, 'month', isMonthEnum) &&
    IRecord.hasKeyValue(a, 'date', isDateEnum);

const d = yearMonthDateDefaultValue;

export const fillYearMonthDate = (a?: unknown): YearMonthDate =>
    a === undefined || !isRecord(a)
        ? d
        : {
              year: IRecord.hasKeyValue(a, 'year', isYearEnum)
                  ? a.year
                  : d.year,
              month: IRecord.hasKeyValue(a, 'month', isMonthEnum)
                  ? a.month
                  : d.month,
              date: IRecord.hasKeyValue(a, 'date', isDateEnum)
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
