import { defaultRectSize, type RectSize } from './rect-size.mjs';

export type Rect = Readonly<{
  top: number;
  left: number;
}> &
  RectSize;

export const defaultRect = {
  top: 0,
  left: 0,
  width: defaultRectSize.width,
  height: defaultRectSize.height,
} as const satisfies Rect;

export const rectSizeToRect = (rectSize: RectSize): Rect => ({
  width: rectSize.width,
  height: rectSize.height,
  top: defaultRect.top,
  left: defaultRect.left,
});

export const bottom = (r: Rect): number => r.top + r.height;
export const right = (r: Rect): number => r.left + r.width;
