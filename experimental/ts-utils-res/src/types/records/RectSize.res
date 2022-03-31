module RectSize = {
  @gentype
  type rectSize = {
    height: float,
    width: float,
  }

  @gentype
  let defaultValue: rectSize = {height: 0.0, width: 0.0}
}

@gentype
type rectSize = RectSize.rectSize
