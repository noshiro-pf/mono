@gentype
let clamp: (float, float, float) => float = (min, max, target) =>
  Js.Math.max_float(min, Js.Math.min_float(max, target))

let val = 2.5->clamp(0.0, 2.0)
