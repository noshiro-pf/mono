import { type RectSize } from '../types/index.mjs';
import { getImageSizeFromImageElement } from './get-image-size-from-img-element.mjs';

export const getImageSizeFromUrl = (url: string): Promise<RectSize> =>
  new Promise((resolve, reject) => {
    const mut_img: Mutable<HTMLImageElement> = new Image();

    mut_img.addEventListener('load', () => {
      resolve(getImageSizeFromImageElement(mut_img));
    });
    mut_img.addEventListener('error', reject);
    mut_img.src = url;
  });
