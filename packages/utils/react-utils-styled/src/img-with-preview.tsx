import { memoNamed, useBoolState } from '@noshiro/react-utils';
import { useMemo, type CSSProperties } from 'react';
import styled from 'styled-components';

const RelativeWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const AbsoluteWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;
// const transitionSec = 0.1

const Img = styled.img`
  width: 100%;
  height: 100%;
  display: block;
  /* object-fit: contain; */
`;

// transition: transform ${transitionSec}s, opacity ${transitionSec}s;

const SmallImgWrapper = styled.div`
  background-color: white;
`;

const SmallImg = styled(Img)`
  filter: blur(2vw);
`;

type Props = Readonly<{
  previewImgSrc: string;
  fullImgSrc: string;
  alt?: string;
}>;

export const ImgWithPreview = memoNamed<Props>(
  'ImgWithPreview',
  ({ previewImgSrc, fullImgSrc, alt = '' }: Props) => {
    const {
      state: loaded,
      setTrue: onLoad,
      setFalse: onLoadStart,
    } = useBoolState(false);

    const imgStyle = useMemo<CSSProperties>(
      () => ({ opacity: loaded ? 1 : 0 }),
      [loaded]
    );

    return (
      <RelativeWrapper>
        <AbsoluteWrapper>
          <Img
            alt={alt}
            src={fullImgSrc}
            style={imgStyle}
            onLoad={onLoad}
            onLoadStart={onLoadStart}
          />
        </AbsoluteWrapper>
        <AbsoluteWrapper>
          {!loaded ? (
            <SmallImgWrapper>
              <SmallImg alt={alt} src={previewImgSrc} />
            </SmallImgWrapper>
          ) : undefined}
        </AbsoluteWrapper>
      </RelativeWrapper>
    );
  }
);
