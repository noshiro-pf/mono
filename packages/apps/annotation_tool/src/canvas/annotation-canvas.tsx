import { memoNamed } from '@noshiro/react-utils';
import type { Hue, RectSize } from '@noshiro/ts-utils-additional';
import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import styled from 'styled-components';
import { SampleImage } from '../assets';
import { CanvasMain } from './canvas-main';
import { bgCheckerboardImg } from './img';
import type { AnnotationCanvasStyle } from './types';
import { defaultIdMaker } from './types';

type Props = Readonly<{
  canvasStyles: AnnotationCanvasStyle;
  canvasSize: RectSize;
  selectedHue: Hue;
}>;

export const AnnotationCanvas = memoNamed<Props>(
  'AnnotationCanvas',
  (props: Props) => {
    const idMaker = defaultIdMaker;

    const rootStyle = useMemo<CSSProperties>(
      () => ({
        width: `${props.canvasSize.width}px`,
        height: `${props.canvasSize.height}px`,
      }),
      [props.canvasSize]
    );

    const imgWrapperStyle = useMemo<CSSProperties>(
      () => ({
        height: '100%',
        padding: `${props.canvasStyles.background.minPaddingPx}px`,
      }),
      [props.canvasStyles.background.minPaddingPx]
    );

    return (
      <Root style={rootStyle}>
        <RelativeWrapper>
          <AbsoluteWrapper>
            <div style={imgWrapperStyle}>
              <Img src={SampleImage} />
            </div>
          </AbsoluteWrapper>
          <AbsoluteWrapper>
            <CanvasMain
              canvasSize={props.canvasSize}
              canvasStyles={props.canvasStyles}
              idMaker={idMaker}
              selectedHue={props.selectedHue}
            />
          </AbsoluteWrapper>
        </RelativeWrapper>
      </Root>
    );
  }
);

const Root = styled.div`
  background-image: url(${bgCheckerboardImg});
`;

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
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
`;
