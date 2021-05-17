import type { RectSize } from '@noshiro/ts-utils';
import { defaultCardSize } from '../constants/default-card-size';

export const fillCardSize = (size: Partial<RectSize>): RectSize =>
  size === undefined
    ? defaultCardSize
    : size.width !== undefined && size.height !== undefined
    ? { width: size.width, height: size.height }
    : size.height !== undefined
    ? { width: (145 / 225) * size.height, height: size.height }
    : size.width !== undefined
    ? { width: size.width, height: (225 / 145) * size.width }
    : defaultCardSize;
