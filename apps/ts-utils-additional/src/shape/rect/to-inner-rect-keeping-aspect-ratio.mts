import { FiniteNumber, isFiniteNumber, Num } from 'ts-data-forge';
import { type Rect, type RectSize } from '../../types/index.mjs';

/**
 * 縦横比を維持して表示するための位置計算
 *
 * @example
 *   innerが横長な場合
 *
 *
 *   outer
 *   +--------------------------+  ----+
 *   |                          |      | = padNS
 *   +--------------------------+  ----+
 *   |                          |
 *   |                          |
 *   |          inner           |
 *   |                          |
 *   |                          |
 *   +--------------------------+  ----+
 *   |                          |      | = padNS
 *   +--------------------------+  ----+
 */

export const toInnerRectSizeKeepingAspectRatio = (
  outerRectSize: RectSize,
  aspectRatio: number,
): RectSize => {
  // `isFiniteNumber` first, then `Num.isPositive`: the two guards together
  // narrow to the branded `PositiveFiniteNumber` that `FiniteNumber.div` asks
  // for. `Number.isFinite` does not add the `Finite` brand.
  if (!isFiniteNumber(aspectRatio) || !Num.isPositive(aspectRatio)) {
    return outerRectSize;
  }

  const { height: oh, width: ow } = outerRectSize;

  // `isFiniteNumber` rather than `Number.isFinite`: only the former narrows to
  // the branded `FiniteNumber` that `FiniteNumber.div` asks for below.
  if (!isFiniteNumber(oh) || !isFiniteNumber(ow)) {
    return outerRectSize;
  }

  if (ow < aspectRatio * oh) {
    // ow / oh < aspectRatio
    // outerがinnerより縦長のとき
    const padNSx2 = oh - FiniteNumber.div(ow, aspectRatio);

    return {
      width: ow,
      height: oh - padNSx2,
    };
  }

  // outerがinnerより横長のとき
  const padWEx2 = ow - oh * aspectRatio;

  return {
    width: ow - padWEx2,
    height: oh,
  };
};

export const toInnerRectKeepingAspectRatio = (
  outerRect: Rect,
  aspectRatio: number,
): Rect => {
  const {
    height: outerH,
    width: outerW,
    top: outerT,
    left: outerL,
  } = outerRect;

  const { height: innerH, width: innerW } = toInnerRectSizeKeepingAspectRatio(
    { width: outerW, height: outerH },
    aspectRatio,
  );

  return {
    top: outerT + (outerH - innerH) / 2,
    left: outerL + (outerW - innerW) / 2,
    width: innerW,
    height: innerH,
  };
};
