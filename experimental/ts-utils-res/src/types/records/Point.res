module Point = {
  type point = {
    x: float,
    y: float,
  }

  @gentype
  let defaultValue: point = {x: 0.0, y: 0.0}
}

@gentype
type point = Point.point
