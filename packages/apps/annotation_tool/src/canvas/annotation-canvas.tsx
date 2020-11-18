import { memoNamed } from '@mono/react-utils';
import { Hue, RectSize } from '@mono/ts-utils';
import React, { CSSProperties, useMemo } from 'react';
import styled from 'styled-components';
import SampleImage from '../assets/sample_image.jpg';
import { CanvasMain } from './canvas-main';
import { bgCheckerboardImg } from './img/checkerboard';
import { AnnotationCanvasStyle } from './types/annotation-canvas-style';
import { defaultIdMaker } from './types/id-type';

interface Props {
  canvasStyles: AnnotationCanvasStyle;
  canvasSize: RectSize;
  selectedHue: Hue;
}

export const AnnotataionCanvas = memoNamed<Props>(
  'AnnotataionCanvas',
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
              idMaker={idMaker}
              canvasStyles={props.canvasStyles}
              canvasSize={props.canvasSize}
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
