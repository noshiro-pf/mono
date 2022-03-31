module Num = {
  @gentype
  let clamp: (float, float, float) => float = (min, max, target) =>
    /*
     * @description 値を与えられた範囲内に収める．targetの値が不正な場合はminを返す．
     * @example
     *  clamp(0, 2)(2.3) // 2,
     *  clamp(0, 2)(-0.5) // 0,
     *  clamp(0, 2)(1.5) // 1.5
     */
    if !Js.Float.isFinite(target) {
      min
    } else {
      Js.Math.max_float(min, Js.Math.min_float(max, target))
    }
}
