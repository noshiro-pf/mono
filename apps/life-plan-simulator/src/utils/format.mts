/**
 * `<input type="number">` の値を数値にする。
 * 空欄や数値として読めない値は 0 として扱う。
 */
import { Num, Result } from 'ts-data-forge';

export const parseNumberInput = (value: string): number => {
  const n = Result.unwrapOkOr(Num.safeParseFloat(value.trim()), Number.NaN);

  return Number.isFinite(n) ? n : 0;
};

/** 円単位に四捨五入して桁区切りを付ける。 */
export const formatYen = (amount: number): string =>
  `${yenFormat.format(Math.round(amount))} 円` as const;

const yenFormat = new Intl.NumberFormat('ja-JP');
