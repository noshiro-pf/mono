import { type RectSize } from '../../types/index.mjs';

export const isValidRectSize = (rectSize: RectSize): boolean =>
  rectSize.height > 0 && rectSize.width > 0;
