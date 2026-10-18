/**
 * A rectangle, as `getBoundingClientRect` and `ResizeObserver` report one.
 */
export type Rect = Readonly<{
  top: number;
  left: number;
  height: number;
  width: number;
}>;
