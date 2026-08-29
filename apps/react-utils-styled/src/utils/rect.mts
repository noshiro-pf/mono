/**
 * A rectangle, as `getBoundingClientRect` and `ResizeObserver` report one.
 *
 * Ported from `@noshiro/ts-utils-additional`; `ts-data-forge` has no successor.
 */
export type Rect = Readonly<{
  top: number;
  left: number;
  height: number;
  width: number;
}>;
