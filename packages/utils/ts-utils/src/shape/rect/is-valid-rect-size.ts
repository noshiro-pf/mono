import { RectSize } from '../../types';

export const isValidRectSize = (rectSize: RectSize): boolean =>
  rectSize.height > 0 && rectSize.width > 0;
