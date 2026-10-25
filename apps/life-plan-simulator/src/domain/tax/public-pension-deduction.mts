/**
 * 公的年金等控除額（公的年金等に係る雑所得以外の所得が 1,000 万円以下の場合）。
 * @param pension 公的年金等の収入金額（円 / 年）
 * @param isAge65OrOver 受給者が 65 歳以上か
 */
export const publicPensionDeduction = (
  pension: number,
  isAge65OrOver: boolean,
): number => {
  const minimum = isAge65OrOver ? 1_100_000 : 600_000;

  const flatUpTo = isAge65OrOver ? 3_300_000 : 1_300_000;

  return pension < minimum
    ? Math.max(0, pension)
    : pension <= flatUpTo
      ? minimum
      : pension <= 4_100_000
        ? pension * 0.25 + 275_000
        : pension <= 7_700_000
          ? pension * 0.15 + 685_000
          : pension * 0.05 + 1_455_000;
};
