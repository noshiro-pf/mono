import type { Rect } from '../../types';

/**
 * @description width/heightを非負の値になるように正規化を行う．
 * （リサイズの結果，widthやheightが負の値になったRectが生成されることがある）
 */
export const normalizeRect = (rect: Rect): Rect => {
  let { top: top_, left, width, height } = rect;

  if (width < 0) {
    width *= -1;
    left -= width;
  }
  if (height < 0) {
    height *= -1;
    top_ -= height;
  }

  return { top: top_, left, width, height };
};
