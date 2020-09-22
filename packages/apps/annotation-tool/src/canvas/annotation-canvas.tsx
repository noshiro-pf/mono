import { memoNamed } from '@mono/react-utils';
import { Hue, RectSize } from '@mono/ts-utils';
import React, { CSSProperties, useMemo } from 'react';
import styled from 'styled-components';
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
              <Img
                src={
                  'https://previews.dropbox.com/p/thumb/AA7UzO-ey5gN9AD_6_DIfe0YbD9erwLRcsVw5j3xtdQj7QZ-BCNlpz9J3zbo8heuAy4LrwbsabKG0JruQXzkk1_uiyDUvj4pryHV8iNBlh4APY4eU3IgsxfJbBapMvwV7lfhSwqrc4AtjDCQJu-uLlHKaqu_i3xn9ScSdF682qz9ZIc5JB5rfPQj8N01GjHheioi6UBDV0Y1OFhD60rnrVyB2clez2dlt7dZvvIMga2zGZWV-Btjyk0a4Afh8rKnL5EuvBBGDi8lS5IZeZFYStQewZrEpaLZtpyQ9uhsngdU-wyKZeXQ--xAzFJe1ytwbfbQ_JELsD7xQix70lHRSvucYlpsaX8hKtk94CQ2B_uR0g/p.jpeg?fv_content=true&size_mode=5'
                }
              />
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
