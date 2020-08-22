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
export declare const toInnerRectSizeKeepingAspectRatio: (outerRectSize: RectSize, aspectRatio: number) => RectSize;
export declare const toInnerRectKeepingAspectRatio: (outerRect: Rect, aspectRatio: number) => Rect;
//# sourceMappingURL=to-inner-rect-keeping-aspect-ratio.d.ts.map