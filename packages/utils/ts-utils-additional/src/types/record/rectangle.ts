import { defaultRectSize, type RectSize } from './rect-size';

export type Rect = Readonly<{
  top: number;
  left: number;
}> &
  RectSize;

export const defaultRect: Rect = {
  top: 0,
  left: 0,
  width: defaultRectSize.width,
  height: defaultRectSize.height,
} as const;

export const rectSizeToRect = (rectSize: RectSize): Rect => ({
  width: rectSize.width,
  height: rectSize.height,
  top: defaultRect.top,
  left: defaultRect.left,
});

export const bottom = (r: Rect): number => r.top + r.height;
export const right = (r: Rect): number => r.left + r.width;
