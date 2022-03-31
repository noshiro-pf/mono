module Rect = {
  type rect = {
    height: float,
    width: float,
    top: float,
    left: float,
  }

  @gentype
  let defaultValue: rect = {height: 0.0, width: 0.0, top: 0.0, left: 0.0}

  @gentype
  let top = (r: rect): float => r.top

  @gentype
  let bottom = (r: rect): float => r.top +. r.height

  @gentype
  let left = (r: rect): float => r.left

  @gentype
  let right = (r: rect): float => r.left +. r.width

  @gentype
  let width = (r: rect): float => r.width

  @gentype
  let height = (r: rect): float => r.height
}

@gentype
type rect = Rect.rect
