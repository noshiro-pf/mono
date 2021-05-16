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
  const { height: outerH, width: outerW } = outerRect;
  const { height: innerH, width: innerW } = toInnerRectSizeKeepingAspectRatio(
    { width: outerW, height: outerH },
    aspectRatio
  );
  return {
    top: outerRect.top + (outerH - innerH) / 2,
    left: outerRect.left + (outerW - innerW) / 2,
    width: innerW,
    height: innerH,
  };
};
