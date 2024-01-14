import { bottom, right, type Rect } from '../../types/index.mjs';

/**
 * @description innerRectがouterRectに含まれているかどうか
 */
export const rectIsInRect = (innerRect: Rect, outerRect: Rect): boolean =>
  outerRect.top <= innerRect.top &&
  outerRect.left <= innerRect.left &&
  right(innerRect) <= right(outerRect) &&
  bottom(innerRect) <= bottom(outerRect);
