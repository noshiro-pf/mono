import styled from '@emotion/styled';
import { memoNamed } from '@noshiro/react-utils';
import { useResizeObserver } from '@noshiro/resize-observer-react-hooks';
import { useMemo } from 'react';

const Root = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

type Props = DeepReadonly<{
  children: React.ReactNode;
  maxWidthPerHeight?: number;
  minWidthPerHeight?: number;
}>;

export const AspectRatioLimiter = memoNamed<Props>(
  'AspectRatioLimiter',
  ({ children, maxWidthPerHeight, minWidthPerHeight }: Props) => {
    const [wrapperSize, ref] = useResizeObserver<HTMLDivElement>();

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

    const wrapperStyle = useMemo<React.CSSProperties>(
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
