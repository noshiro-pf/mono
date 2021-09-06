import { styled } from '@noshiro/goober';
import { memoNamed } from '@noshiro/preact-utils';
import type { RectSize, uint32 } from '@noshiro/ts-utils';
import { match, seq } from '@noshiro/ts-utils';
import { useMemo } from 'preact/hooks';
import type { JSXInternal } from 'preact/src/jsx';
import { outlineColorDef, text } from '../../constants';
import type { CardNumber, SelectAnswerBalloonProps } from '../../types';
import { Button } from '../bp';
import { CardComponent } from '../card';
import {
  createBalloonBody,
  createBalloonWithDownArrow,
  createBalloonWithLeftArrow,
  createBalloonWithRightArrow,
  createBalloonWithUpArrow,
} from './balloon-base';
import { calcBalloonPosition } from './calc-balloon-position';
import { smallestCardSize } from './small-card-size';

type Props = SelectAnswerBalloonProps;

const balloonPaddingPx = 5;
const cardMarginPx = 2;

const balloonSize: RectSize = {
  width: balloonPaddingPx * 2 + (smallestCardSize.width + 2 * cardMarginPx) * 6,
  height: 150,
};

const marginBetweenCardAndBalloon = 10;

export const SelectAnswerBalloon = memoNamed<Props>(
  'SelectAnswerBalloon',
  ({
    anchorCardRect,
    arrowDirection,
    cardColor,
    selectedNumber,
    onSelectedNumberChange,
    submitAnswer,
    onCancelClick,
    submitButtonIsDisabled,
  }) => {
    const rootStyle = useMemo<JSXInternal.CSSProperties>(
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

    const cards = useMemo(
      () =>
        seq(12 as uint32).map(
          (n) =>
            ({
              key: n,
              number: n as CardNumber,
              color: cardColor,
              visibilityFromMe: 'faceUp',
              size: smallestCardSize,
              isClickable: true,
              float: 'never',
              showOutline: selectedNumber === n ? 'always' : 'onHover',
              outlineColor:
                selectedNumber === n
                  ? outlineColorDef.red
                  : outlineColorDef.green,
              onClick: () => {
                onSelectedNumberChange(n as CardNumber);
              },
            } as const)
        ),
      [cardColor, onSelectedNumberChange, selectedNumber]
    );

    return (
      <Balloon style={rootStyle}>
        <BalloonContent>
          <CardsWrapper>
            {cards.map((c) => (
              <CardComponent
                key={c.key}
                color={c.color}
                float={c.float}
                isClickable={c.isClickable}
                number={c.number}
                outlineColor={c.outlineColor}
                showOutline={c.showOutline}
                size={c.size}
                visibilityFromMe={c.visibilityFromMe}
                onClick={c.onClick}
              />
            ))}
          </CardsWrapper>
          <Buttons>
            <Button onClick={onCancelClick}>{text.cancel}</Button>
            <Button
              disabled={submitButtonIsDisabled || selectedNumber === undefined}
              onClick={submitAnswer}
            >
              {text.submitAnswer}
            </Button>
          </Buttons>
        </BalloonContent>
      </Balloon>
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
  width: ${balloonSize.width}px;
  height: ${balloonSize.height}px;
  padding: ${balloonPaddingPx}px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const CardsWrapper = styled('div')`
  display: flex;
  flex-wrap: wrap;
  /* cards */
  & > * {
    margin: ${cardMarginPx}px;
  }
`;

const Buttons = styled('div')`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 5px;

  & > * {
    margin: ${cardMarginPx}px;
  }
`;
