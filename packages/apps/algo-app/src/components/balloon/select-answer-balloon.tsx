import { type RectSize } from '@noshiro/ts-utils-additional';
import { dictionary, outlineColorDef } from '../../constants';
import { type SelectAnswerBalloonProps } from '../../types';
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
    const rootStyle = useMemo<preact.JSX.CSSProperties>(
      () =>
        calcBalloonPosition({
          anchorCardRect,
          arrowDirection,
          balloonSize,
          marginBetweenCardAndBalloon,
        }),
      [anchorCardRect, arrowDirection],
    );

    const Balloon = useMemo(
      () =>
        match(arrowDirection, {
          S: BalloonWithDownArrow,
          E: BalloonWithRightArrow,
          N: BalloonWithUpArrow,
          W: BalloonWithLeftArrow,
        }),
      [arrowDirection],
    );

    const cards = useMemo(
      () =>
        Arr.seq(12).map(
          (n) =>
            ({
              key: n,
              number: n,
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
                onSelectedNumberChange(n);
              },
            }) as const,
        ),
      [cardColor, onSelectedNumberChange, selectedNumber],
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
            <Button onClick={onCancelClick}>{dictionary.cancel}</Button>
            <Button
              disabled={submitButtonIsDisabled || selectedNumber === undefined}
              onClick={submitAnswer}
            >
              {dictionary.submitAnswer}
            </Button>
          </Buttons>
        </BalloonContent>
      </Balloon>
    );
  },
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
