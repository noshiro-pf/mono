import { CircularProgress } from '@material-ui/core';
import { memoNamed, useBooleanState } from '@noshiro/react-utils';
import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import styled from 'styled-components';

const RelativeWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const AbsoluteWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const Img = styled.img`
  width: 100%;
  height: 100%;
  display: block;
  /* object-fit: contain; */
`;

const LoadingWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

type Props = Readonly<{
  src: string;
  alt?: string;
}>;

export const ImgWithLoadingCircle = memoNamed<Props>(
  'ImgWithLoadingCircle',
  ({ src, alt = '' }: Props) => {
    const [loaded, onLoad, onLoadStart] = useBooleanState(false);

    const imgStyle = useMemo<CSSProperties>(
      // dummy comment
      () => ({ opacity: loaded ? 1 : 0 }),
      [loaded]
    );

    const loadingStyle = useMemo<CSSProperties>(
      () => ({ opacity: loaded ? 0 : 1 }),
      [loaded]
    );

    return (
      <RelativeWrapper>
        <AbsoluteWrapper>
          <Img
            style={imgStyle}
            src={src}
            alt={alt}
            onLoad={onLoad}
            onLoadStart={onLoadStart}
          />
        </AbsoluteWrapper>
        <AbsoluteWrapper>
          {!loaded ? (
            <LoadingWrapper style={loadingStyle}>
              <CircularProgress />
            </LoadingWrapper>
          ) : undefined}
        </AbsoluteWrapper>
      </RelativeWrapper>
    );
  }
);
