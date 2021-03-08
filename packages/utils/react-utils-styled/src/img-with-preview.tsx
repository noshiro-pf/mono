import { memoNamed, useBooleanState } from '@noshiro/react-utils';
import { CSSProperties, useMemo } from 'react';
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
    const [loaded, onLoad, onLoadStart] = useBooleanState(false);

    const imgStyle = useMemo<CSSProperties>(
      () => ({ opacity: loaded ? 1 : 0 }),
      [loaded]
    );

    return (
      <RelativeWrapper>
        <AbsoluteWrapper>
          <Img
            style={imgStyle}
            src={fullImgSrc}
            alt={alt}
            onLoad={onLoad}
            onLoadStart={onLoadStart}
          />
        </AbsoluteWrapper>
        <AbsoluteWrapper>
          {!loaded ? (
            <SmallImgWrapper>
              <SmallImg src={previewImgSrc} alt={alt} />
            </SmallImgWrapper>
          ) : undefined}
        </AbsoluteWrapper>
      </RelativeWrapper>
    );
  }
);
