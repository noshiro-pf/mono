import type { RectSize } from '../types';

export const getImageSizeFromImageElement = (
  // eslint-disable-next-line noshiro-custom/prefer-readonly-parameter-types
  imgElement: HTMLImageElement
): RectSize => ({
  height: imgElement.naturalHeight,
  width: imgElement.naturalWidth,
});
