import { memoNamed } from '@noshiro/react-utils';
import { Rect } from '@noshiro/ts-utils';
import { ReactNode, useMemo } from 'react';
import styled from 'styled-components';

const RelativeWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const AbsoluteWrapper = styled.div`
  position: absolute;
`;

/**
 * @description
 * 画像の切り抜きを「拡大＆はみ出た部分を隠す」で実装している．
 *
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
 */

type Props = Readonly<{
  children: ReactNode;
  cropRectRelative: Rect;
}>;

export const DivCropped = memoNamed<Props>(
  'DivCropped',
  ({ children, cropRectRelative }: Props) => {
    const zoomedImgStyle = useMemo(() => {
      const { width, height, top, left } = cropRectRelative;
      const W = 1 / width;
      const H = 1 / height;
      const L = -W * left;
      const T = -H * top;
      return {
        width: `${W * 100}%`,
        height: `${H * 100}%`,
        top: `${T * 100}%`,
        left: `${L * 100}%`,
      };
    }, [cropRectRelative]);

    return (
      <RelativeWrapper>
        <AbsoluteWrapper style={zoomedImgStyle}>{children}</AbsoluteWrapper>
      </RelativeWrapper>
    );
  }
);
