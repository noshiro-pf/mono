import { type Rect } from '../../types';

export const isValidRect = (rect: Rect): boolean =>
  rect.width > 0 && rect.height > 0;
