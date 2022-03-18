import type { RectSize } from '../types';
import { getImageSizeFromImageElement } from './get-image-size-from-img-element';

export const getImageSizeFromUrl = (url: string): Promise<RectSize> =>
  new Promise((resolve, reject) => {
    const mut_img = new Image();
    mut_img.onload = () => {
      resolve(getImageSizeFromImageElement(mut_img));
    };
    mut_img.onerror = reject;
    mut_img.src = url;
  });
