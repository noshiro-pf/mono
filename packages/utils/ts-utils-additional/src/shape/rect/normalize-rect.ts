import { type Rect } from '../../types';

/**
 * @description width/heightを非負の値になるように正規化を行う．
 * （リサイズの結果，widthやheightが負の値になったRectが生成されることがある）
 */
export const normalizeRect = (rect: Rect): Rect => {
  let mut_top = rect.top;
  let mut_left = rect.left;
  let mut_width = rect.width;
  let mut_height = rect.height;

  if (mut_width < 0) {
    mut_width *= -1;
    mut_left -= mut_width;
  }
  if (mut_height < 0) {
    mut_height *= -1;
    mut_top -= mut_height;
  }

  return { top: mut_top, left: mut_left, width: mut_width, height: mut_height };
};
