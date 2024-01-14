import { type RectSize } from '../types/index.mjs';

export const getImageSizeFromImageElement = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  imgElement: HTMLImageElement,
): RectSize => ({
  height: imgElement.naturalHeight,
  width: imgElement.naturalWidth,
});
