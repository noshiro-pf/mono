import { type RectSize } from '@noshiro/ts-utils-additional';
import { outlineColorDef, text } from '../../constants';
import { type ConfirmTossBalloonProps } from '../../types';
import { Button } from '../bp';
import { CardComponent } from '../card';
import { createBalloonBody, createBalloonWithDownArrow } from './balloon-base';
import { calcBalloonPosition } from './calc-balloon-position';
import { smallCardSize, smallestCardSize } from './small-card-size';

type Props = ConfirmTossBalloonProps;

const balloonPaddingPx = 5;
const cardMarginPx = 2;

const balloonSize: RectSize = {
  width: balloonPaddingPx * 2 + 120 + smallCardSize.width,
  height: 100,
};

const marginBetweenCardAndBalloon = 10;

export const ConfirmTossBalloon = memoNamed<Props>(
  'ConfirmTossBalloon',
  ({ card, anchorCardRect, submit, cancel }) => {
    const rootStyle = useMemo<CSSProperties>(
      () =>
        calcBalloonPosition({
          anchorCardRect,
          arrowDirection: 'S',
          balloonSize,
          marginBetweenCardAndBalloon,
        }),
      [anchorCardRect]
    );

    const cardWithStyle = useMemo(
      () =>
        ({
          number: card.number,
          color: card.color,
          visibilityFromMe: 'faceUp',
          size: smallestCardSize,
          isClickable: true,
          float: 'never',
          showOutline: 'never',
          outlineColor: outlineColorDef.green,
        } as const),
      [card]
    );

    return (
      <BalloonWithDownArrowTranslated style={rootStyle}>
        <BalloonContent>
          <CardAndMessage>
            <CardWrapper>
              <CardComponent
                color={cardWithStyle.color}
                float={cardWithStyle.float}
                isClickable={cardWithStyle.isClickable}
                number={cardWithStyle.number}
                outlineColor={cardWithStyle.outlineColor}
                showOutline={cardWithStyle.showOutline}
                size={cardWithStyle.size}
                visibilityFromMe={cardWithStyle.visibilityFromMe}
              />
            </CardWrapper>
            <Message>
              <div>{text.submitTossMessage[0]}</div>
              <div>{text.submitTossMessage[1]}</div>
            </Message>
          </CardAndMessage>
          <Buttons>
            <div>
              <Button onClick={cancel}>{text.cancel}</Button>
            </div>
            <div>
              <Button onClick={submit}>{text.submitToss}</Button>
            </div>
          </Buttons>
        </BalloonContent>
      </BalloonWithDownArrowTranslated>
    );
  }
);

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
const BalloonBody = createBalloonBody(balloonSize);
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
const BalloonWithDownArrow = createBalloonWithDownArrow(BalloonBody);
const BalloonWithDownArrowTranslated = styled(BalloonWithDownArrow)`
  transform: translateY(-20px);
`;

const BalloonContent = styled('div')`
  width: ${balloonSize.width}px;
  height: ${balloonSize.height}px;
  padding: ${balloonPaddingPx}px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
`;

const CardAndMessage = styled('div')`
  display: flex;
  justify-content: space-around;
`;

const Message = styled('div')`
  color: white;
  margin-left: 10px;
  margin-right: 10px;
`;

const CardWrapper = styled('div')`
  display: flex;
  flex-wrap: wrap;
  margin: ${cardMarginPx}px;
`;

const Buttons = styled('div')`
  display: flex;
  justify-content: center;
  margin-bottom: 5px;

  & > * {
    margin: ${cardMarginPx}px;
  }
`;
