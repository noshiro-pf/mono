import type { RectSize } from '../types';

export const getImageSizeFromImageElement = (
  imgElement: HTMLImageElement
): RectSize => ({
  height: imgElement.naturalHeight,
  width: imgElement.naturalWidth,
});
