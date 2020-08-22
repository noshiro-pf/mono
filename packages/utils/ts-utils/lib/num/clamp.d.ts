/**
 * @description 値を与えられた範囲内に収める．targetの値が不正な場合はminを返す．
 * @example
 *  clamp(0, 2)(2.3) // 2,
 *  clamp(0, 2)(-0.5) // 0,
 *  clamp(0, 2)(1.5) // 1.5
 */
export declare const clamp: (min: number, max: number) => (target: number) => number;
//# sourceMappingURL=clamp.d.ts.map