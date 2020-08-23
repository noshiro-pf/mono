import { defaultRectSize, RectSize } from './rect-size';

export type Rect = RectSize &
  Readonly<{
    top: number;
    left: number;
  }>;

export const defaultRect: Rect = {
  top: 0,
  left: 0,
  width: defaultRectSize.width,
  height: defaultRectSize.height,
} as const;

export const rectSizeToRect = (rectsize: RectSize): Rect => ({
  width: rectsize.width,
  height: rectsize.height,
  top: defaultRect.top,
  left: defaultRect.left,
});

export const bottom = (r: Rect): number => r.top + r.height;
export const right = (r: Rect): number => r.left + r.width;
