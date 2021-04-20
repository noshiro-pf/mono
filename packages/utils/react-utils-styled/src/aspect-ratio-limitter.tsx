import { useResizeObserver } from '@noshiro/react-resize-observer-hooks';
import { memoNamed } from '@noshiro/react-utils';
import { CSSProperties, ReactNode, useMemo } from 'react';
import styled from 'styled-components';

const Root = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

type Props = Readonly<{
  children: ReactNode;
  maxWidthPerHeight?: number;
  minWidthPerHeight?: number;
}>;

export const AspectRatioLimitter = memoNamed<Props>(
  'AspectRatioLimitter',
  ({ children, maxWidthPerHeight, minWidthPerHeight }: Props) => {
    const [wrapperSize, ref] = useResizeObserver();

    const padding = useMemo(() => {
      const { width, height } = wrapperSize;

      if (
        minWidthPerHeight !== undefined &&
        width < minWidthPerHeight * height
      ) {
        // 制約条件より縦長な場合 => 上下に余白を作る
        const pad = (height - width / minWidthPerHeight) / 2;
        return {
          top: pad,
          left: 0,
          right: 0,
          bottom: pad,
        };
      }
      if (
        maxWidthPerHeight !== undefined &&
        width / height > maxWidthPerHeight
      ) {
        // 制約条件より横長な場合 => 左右に余白を作る
        const pad = (width - height * maxWidthPerHeight) / 2;
        return {
          top: 0,
          left: pad,
          right: pad,
          bottom: 0,
        };
      }
      return {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      };
    }, [maxWidthPerHeight, minWidthPerHeight, wrapperSize]);

    const wrapperStyle = useMemo<CSSProperties>(
      () => ({
        paddingTop: `${padding.top}px`,
        paddingLeft: `${padding.left}px`,
        paddingRight: `${padding.right}px`,
        paddingBottom: `${padding.bottom}px`,
      }),
      [padding]
    );

    return (
      <Root ref={ref} style={wrapperStyle}>
        {children}
      </Root>
    );
  }
);
