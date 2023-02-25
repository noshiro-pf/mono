import styled from '@emotion/styled';
import { CircularProgress } from '@mui/material';
import { memoNamed, useBoolState } from '@noshiro/react-utils';
import { useMemo } from 'react';

type Props = Readonly<{
  src: string;
  alt?: string;
}>;

export const ImgWithLoadingCircle = memoNamed<Props>(
  'ImgWithLoadingCircle',
  ({ src, alt = '' }: Props) => {
    const {
      state: loaded,
      setTrue: onLoad,
      setFalse: onLoadStart,
    } = useBoolState(false);

    const imgStyle = useMemo<React.CSSProperties>(
      // dummy comment
      () => ({ opacity: loaded ? 1 : 0 }),
      [loaded]
    );

    const loadingStyle = useMemo<React.CSSProperties>(
      () => ({ opacity: loaded ? 0 : 1 }),
      [loaded]
    );

    return (
      <RelativeWrapper>
        <AbsoluteWrapper>
          <Img
            alt={alt}
            src={src}
            style={imgStyle}
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
