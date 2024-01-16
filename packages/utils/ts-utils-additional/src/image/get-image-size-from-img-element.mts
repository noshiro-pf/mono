import { type RectSize } from '../types/index.mjs';

export const getImageSizeFromImageElement = (
  imgElement: HTMLImageElement,
): RectSize => ({
  height: imgElement.naturalHeight,
  width: imgElement.naturalWidth,
});
