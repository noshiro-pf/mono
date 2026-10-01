// `erasableSyntaxOnly` is locked on (D-40), so the compiler rejects it too.
// @sumi-expect-error banned-syntax/no-enum
// @sumi-expect-error compiler/1294
export enum Direction {
  Up,
  Down,
}
