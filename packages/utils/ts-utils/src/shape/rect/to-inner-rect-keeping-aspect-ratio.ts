import { Rect, RectSize } from '../../types';

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
  if (aspectRatio <= 0 || !Number.isFinite(aspectRatio)) {
    return outerRectSize;
  }

  const { height: oh, width: ow } = outerRectSize;

  if (ow < aspectRatio * oh) {
    // ow / oh < aspectRatio
    // outerがinnerより縦長のとき
    const padNSx2 = oh - ow / aspectRatio;
    return {
      width: outerRectSize.width,
      height: outerRectSize.height - padNSx2,
    };
  } else {
    // outerがinnerより横長のとき
    const padWEx2 = ow - oh * aspectRatio;
    return {
      width: outerRectSize.width - padWEx2,
      height: outerRectSize.height,
    };
  }
};

export const toInnerRectKeepingAspectRatio = (
  outerRect: Rect,
  aspectRatio: number
): Rect => {
  const { height: outerHeight, width: outerWidth } = outerRect;
  const {
    height: innerHeight,
    width: innerWidth,
  } = toInnerRectSizeKeepingAspectRatio(
    { width: outerWidth, height: outerHeight },
    aspectRatio
  );
  return {
    top: outerRect.top + (outerHeight - innerHeight) / 2,
    left: outerRect.left + (outerWidth - innerWidth) / 2,
    width: innerWidth,
    height: innerHeight,
  };
};
