import { styled } from '@noshiro/goober';
import { memoNamed } from '@noshiro/preact-utils';
import type { RectSize, uint32 } from '@noshiro/ts-utils';
import { match, seq } from '@noshiro/ts-utils';
import { createElement } from 'preact';
import { useMemo } from 'preact/hooks';
import type { JSXInternal } from 'preact/src/jsx';
import { outlineColorDef, text } from '../../constants';
import type { CardNumber, SelectAnswerBalloonProps } from '../../types';
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
      () => ({
        ...calcBalloonPosition({
          anchorCardRect,
          arrowDirection,
          balloonSize,
          marginBetweenCardAndBalloon,
        }),
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

    return (
      <Balloon style={rootStyle}>
        <BalloonContent>
          <CardsWrapper>
            {seq(12 as uint32).map((n) =>
              createElement(CardComponent, {
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
            )}
          </CardsWrapper>
          <Buttons>
            <button onClick={onCancelClick}>{text.cancel}</button>
            <button
              onClick={submitAnswer}
              disabled={submitButtonIsDisabled || selectedNumber === undefined}
            >
              {text.submitAnswer}
            </button>
          </Buttons>
        </BalloonContent>
      </Balloon>
    );
  }
);

const BalloonBody = createBalloonBody(balloonSize);
const BalloonWithDownArrow = createBalloonWithDownArrow(BalloonBody);
const BalloonWithUpArrow = createBalloonWithUpArrow(BalloonBody);
const BalloonWithLeftArrow = createBalloonWithLeftArrow(BalloonBody);
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
