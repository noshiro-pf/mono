import { Num } from '@noshiro/ts-utils';
import type { Rect, RectSize } from '../../types';

/**
 * @description 縦横比を維持して表示するための位置計算
 *
 * @example innerが横長な場合
 *
 *                outer
 *      +--------------------------+  ----+
 *      |                          |      | = padNS
 *      +--------------------------+  ----+
 *      |                          |
 *      |                          |
 *      |          inner           |
 *      |                          |
 *      |                          |
 *      +--------------------------+  ----+
 *      |                          |      | = padNS
 *      +--------------------------+  ----+
 *
 */

export const toInnerRectSizeKeepingAspectRatio = (
  outerRectSize: RectSize,
  aspectRatio: number
): RectSize => {
  if (aspectRatio <= 0 || !Num.isFinite(aspectRatio)) {
    return outerRectSize;
  }

  const { height: oh, width: ow } = outerRectSize;

  if (ow < aspectRatio * oh) {
    // ow / oh < aspectRatio
    // outerがinnerより縦長のとき
    const padNSx2 = oh - ow / aspectRatio;

    return {
      width: ow,
      height: oh - padNSx2,
    };
  } else {
    // outerがinnerより横長のとき
    const padWEx2 = ow - oh * aspectRatio;

    return {
      width: ow - padWEx2,
      height: oh,
    };
  }
};

export const toInnerRectKeepingAspectRatio = (
  outerRect: Rect,
  aspectRatio: number
): Rect => {
  const {
    height: outerH,
    width: outerW,
    top: outerT,
    left: outerL,
  } = outerRect;

  const { height: innerH, width: innerW } = toInnerRectSizeKeepingAspectRatio(
    { width: outerW, height: outerH },
    aspectRatio
  );

  return {
    top: outerT + (outerH - innerH) / 2,
    left: outerL + (outerW - innerW) / 2,
    width: innerW,
    height: innerH,
  };
};
