import { type RectSize } from 'ts-utils-additional';
import { defaultCardSize } from '../constants/index.mjs';

export const fillCardSize = (size: Partial<RectSize> | undefined): RectSize =>
  size === undefined
    ? defaultCardSize
    : size.width !== undefined && size.height !== undefined
      ? ({ width: size.width, height: size.height } as const)
      : size.height !== undefined
        ? ({ width: (145 / 225) * size.height, height: size.height } as const)
        : size.width !== undefined
          ? ({ width: size.width, height: (225 / 145) * size.width } as const)
          : defaultCardSize;
