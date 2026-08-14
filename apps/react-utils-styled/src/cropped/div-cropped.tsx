import styled from '@emotion/styled';
import * as React from 'react';
import { memoNamed } from 'react-utils';
import { Num, isPositiveFiniteNumber } from 'ts-data-forge';
import { type Rect } from '../utils/index.mjs';

// `Readonly`, not `DeepReadonly`: a deeply-readonly `ReactNode` is no longer
// a `ReactNode`, and React is the one consuming these.
type Props = Readonly<{
  children: React.ReactNode;
  cropRectRelative: Rect;
}>;

/**
 * 画像の切り抜きを「拡大＆はみ出た部分を隠す」で実装している．
 *
 * ```txt
 *     0
 *   0 +----------------------+
 *     |    l                 |
 *     |  t +-----+           |
 *     |    |     | h         | 1
 *     |    +-----+           |
 *     |       w              |
 *     |                      |
 *     +----------------------+
 *                1
 *
 *                ↓
 *
 *
 *     L
 *   T +----------------------+
 *     |    0                 |
 *     |  0 +-----+           |
 *     |    |     | 1         | H
 *     |    +-----+           |
 *     |       1              |
 *     |                      |
 *     +----------------------+
 *                W
 *
 * H = 1 / h
 * W = 1 / w
 * T + H * t = 0  =>  T = -H * t
 * L + W * l = 0  =>  L = -W * l
 * ```
 */

export const DivCropped = memoNamed<Props>(
  'DivCropped',
  ({ children, cropRectRelative: r }: Props) => {
    const zoomedImgStyle = React.useMemo(() => {
      if (isPositiveFiniteNumber(r.width) && isPositiveFiniteNumber(r.height)) {
        const W = Num.div(1, r.width);

        const H = Num.div(1, r.height);

        const L = -W * r.left;

        const T = -H * r.top;

        return {
          width: `${W * 100}%`,
          height: `${H * 100}%`,
          top: `${T * 100}%`,
          left: `${L * 100}%`,
        };
      }

      return {
        width: '100%',
        height: '100%',
        top: `${r.top * 100}%`,
        left: `${r.left * 100}%`,
      };
    }, [r]);

    return (
      <RelativeWrapper>
        <AbsoluteWrapper style={zoomedImgStyle}>{children}</AbsoluteWrapper>
      </RelativeWrapper>
    );
  },
);

const RelativeWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const AbsoluteWrapper = styled.div`
  position: absolute;
`;
