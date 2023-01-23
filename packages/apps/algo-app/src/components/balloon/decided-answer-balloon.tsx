import type { RectSize } from '@noshiro/ts-utils-additional';
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
    const positionStyle = useMemo<CSSProperties>(
      () =>
        calcBalloonPosition({
          anchorCardRect,
          arrowDirection,
          balloonSize,
          marginBetweenCardAndBalloon,
        }),
      [anchorCardRect, arrowDirection]
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const Balloon = useMemo(
      () =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        match(arrowDirection, {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          S: BalloonWithDownArrow,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          E: BalloonWithRightArrow,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          N: BalloonWithUpArrow,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
            <CardComponent
              color={card.color}
              float={'never'}
              isClickable={false}
              number={card.number}
              showOutline={'never'}
              size={smallCardSize}
              visibilityFromMe={'faceUp'}
            />
          </BalloonContent>
        </Balloon>

        <SymbolSvg
          fill='none'
          height={symbolSize}
          style={oStyle}
          viewBox='0 0 100 100'
          width={symbolSize}
          xmlns='http://www.w3.org/2000/svg'
        >
          <circle cx='50' cy='50' r='45.5' stroke='#FF0000' strokeWidth='9' />
        </SymbolSvg>

        <SymbolSvg
          fill='none'
          height={symbolSize}
          style={xStyle}
          viewBox='0 0 104 104'
          width={symbolSize}
          xmlns='http://www.w3.org/2000/svg'
        >
          <rect
            fill='#FF0000'
            height='9'
            transform='rotate(-45 0 96.8735)'
            width='137'
            y='96.8735'
          />
          <rect
            fill='#FF0000'
            height='9'
            transform='rotate(-135 96.9924 103.356)'
            width='137'
            x='96.9924'
            y='103.356'
          />
        </SymbolSvg>
      </Wrapper>
    );
  }
);

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
const BalloonBody = createBalloonBody(balloonSize);
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
const BalloonWithDownArrow = createBalloonWithDownArrow(BalloonBody);
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
const BalloonWithUpArrow = createBalloonWithUpArrow(BalloonBody);
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
const BalloonWithLeftArrow = createBalloonWithLeftArrow(BalloonBody);
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
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
