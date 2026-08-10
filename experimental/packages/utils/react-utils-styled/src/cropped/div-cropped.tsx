import styled from '@emotion/styled';
import { memoNamed } from '@noshiro/react-utils';
import { Num, isPositiveFiniteNumber } from '@noshiro/ts-utils';
import { type Rect } from '@noshiro/ts-utils-additional';
import { useMemo } from 'react';

type Props = DeepReadonly<{
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
    const zoomedImgStyle = useMemo(() => {
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
      } else {
        const L = r.left;
        const T = r.top;

        return {
          width: '100%',
          height: '100%',
          top: `${T * 100}%`,
          left: `${L * 100}%`,
        };
      }
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
