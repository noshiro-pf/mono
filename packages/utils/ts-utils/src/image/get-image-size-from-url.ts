import type { RectSize } from '../types';
import { getImageSizeFromImageElement } from './get-image-size-from-img-element';

export const getImageSizeFromUrl = (url: string): Promise<RectSize> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve(getImageSizeFromImageElement(img));
    };
    img.onerror = reject;
    img.src = url;
  });
