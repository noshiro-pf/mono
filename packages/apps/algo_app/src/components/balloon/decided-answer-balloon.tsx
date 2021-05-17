import { styled } from '@noshiro/goober';
import { memoNamed } from '@noshiro/preact-utils';
import type { RectSize } from '@noshiro/ts-utils';
import { match } from '@noshiro/ts-utils';
import { createElement } from 'preact';
import { useMemo } from 'preact/hooks';
import type { JSXInternal } from 'preact/src/jsx';
import { zIndex } from '../../constants';
import type { DecidedAnswerBalloonProps } from '../../types';
import { CardComponent } from '../card';
import {
  createBalloonBody,
  createBalloonWithDownArrow,
  createBalloonWithLeftArrow,
  createBalloonWithRightArrow,
  createBalloonWithUpArrow,
} from './balloon-base';
import { calcBalloonPosition } from './calc-balloon-position';
import { smallCardSize } from './small-card-size';

type Props = DecidedAnswerBalloonProps;

const balloonPaddingPx = 5;

const balloonSize: RectSize = {
  width: balloonPaddingPx * 2 + smallCardSize.width,
  height: balloonPaddingPx * 2 + smallCardSize.height,
};

const symbolSize: number = smallCardSize.height;

const marginBetweenCardAndBalloon = 10;

export const DecidedAnswerBalloon = memoNamed<Props>(
  'DecidedAnswerBalloon',
  ({ anchorCardRect, arrowDirection, card, showSymbol }) => {
    const positionStyle = useMemo<JSXInternal.CSSProperties>(
      () =>
        calcBalloonPosition({
          anchorCardRect,
          arrowDirection,
          balloonSize,
          marginBetweenCardAndBalloon,
        }),
      [anchorCardRect, arrowDirection]
    );

    const Balloon = useMemo(
      () =>
        match(arrowDirection, {
          S: BalloonWithDownArrow,
          E: BalloonWithRightArrow,
          N: BalloonWithUpArrow,
          W: BalloonWithLeftArrow,
        }),
      [arrowDirection]
    );

    const oStyle = useMemo(
      () => ({ opacity: showSymbol === 'o' ? 1 : 0 }),
      [showSymbol]
    );

    const xStyle = useMemo(
      () => ({ opacity: showSymbol === 'x' ? 1 : 0 }),
      [showSymbol]
    );

    return (
      <Wrapper style={positionStyle}>
        <Balloon>
          <BalloonContent>
            {createElement(CardComponent, {
              number: card.number,
              color: card.color,
              visibilityFromMe: 'faceUp',
              size: smallCardSize,
              isClickable: false,
              float: 'never',
              showOutline: 'never',
              outlineColor: undefined,
              onClick: undefined,
            } as const)}
          </BalloonContent>
        </Balloon>

        <SymbolSvg
          width={symbolSize}
          height={symbolSize}
          style={oStyle}
          viewBox='0 0 100 100'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <circle cx='50' cy='50' r='45.5' stroke='#FF0000' stroke-width='9' />
        </SymbolSvg>

        <SymbolSvg
          width={symbolSize}
          height={symbolSize}
          style={xStyle}
          viewBox='0 0 104 104'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <rect
            y='96.8735'
            width='137'
            height='9'
            transform='rotate(-45 0 96.8735)'
            fill='#FF0000'
          />
          <rect
            x='96.9924'
            y='103.356'
            width='137'
            height='9'
            transform='rotate(-135 96.9924 103.356)'
            fill='#FF0000'
          />
        </SymbolSvg>
      </Wrapper>
    );
  }
);

const BalloonBody = createBalloonBody(balloonSize);
const BalloonWithDownArrow = createBalloonWithDownArrow(BalloonBody);
const BalloonWithUpArrow = createBalloonWithUpArrow(BalloonBody);
const BalloonWithLeftArrow = createBalloonWithLeftArrow(BalloonBody);
const BalloonWithRightArrow = createBalloonWithRightArrow(BalloonBody);

const BalloonContent = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: ${balloonPaddingPx}px;
`;

const Wrapper = styled('div')`
  position: absolute;
  width: ${balloonSize.width}px;
  height: ${balloonSize.height}px;
`;

const SymbolSvg = styled('svg')`
  position: absolute;
  z-index: ${zIndex.balloon};
  top: calc(${(balloonSize.height - symbolSize) / 2}px);
  left: calc(${(balloonSize.width - symbolSize) / 2}px);
  transition: opacity 0.3s ease;
`;
