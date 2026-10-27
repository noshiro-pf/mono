/**
 * `<input type="number">` の値を数値にする。
 * 空欄や数値として読めない値は 0 として扱う。
 */
import { Num, Result } from 'ts-data-forge';
import type { UintRangeInclusive } from 'ts-type-forge';

export const parseNumberInput = (value: string): number => {
  const n = Result.unwrapOkOr(Num.safeParseFloat(value.trim()), Number.NaN);

  return Number.isFinite(n) ? n : 0;
};

/** 円単位に四捨五入して桁区切りを付ける。 */
export const formatYen = (amount: number): string =>
  `${yenFormat.format(Math.round(amount))} 円` as const;

const yenFormat = new Intl.NumberFormat('ja-JP');

/** 円単位に四捨五入して桁区切りを付ける（単位なし、表のセル用）。 */
export const formatAmount = (amount: number): string =>
  yenFormat.format(Math.round(amount));

/** 割合を % で表示する。`fractionDigits` は `toFixed` が受ける 0〜100。 */
export const formatPercent = (
  ratio: number,
  fractionDigits: UintRangeInclusive<0, 100> = 2,
): string => `${(ratio * 100).toFixed(fractionDigits)}%` as const;

/**
 * 数値を入力欄に出す文字列にする。`0.0007 * 100` のような浮動小数の誤差は
 * 12 桁で丸める。
 */
export const numberToInput = (value: number): string =>
  Result.unwrapOkOr(
    Num.safeParseFloat(value.toPrecision(12)),
    Number.NaN,
  ).toString();
