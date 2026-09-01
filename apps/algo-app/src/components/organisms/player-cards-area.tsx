import { styled } from 'goober';
import { memoNamed } from 'preact-utils';
import { useMemo } from 'preact/hooks';
import { Arr } from 'ts-data-forge';
import { type FixedLengthTuple } from 'ts-type-forge';
import { type Rect, type RectSize } from 'ts-utils-additional';
import { zIndex } from '../../constants/index.mjs';
import { cardToString } from '../../functions/index.mjs';
import {
  type CardColor,
  type CardNumber,
  type CardWithDisplayValue,
} from '../../types/index.mjs';
import { CardComponent } from '../card/index.mjs';

type Props = Readonly<{
  areaSize: RectSize;
  cardSize: RectSize;
  rotate: 0 | 90 | 180 | 270;
  cards: FixedLengthTuple<6, CardWithDisplayValue>;
  paddingPx: number;
  windowSize: RectSize;
  cardPositionsDispatcher: (
    action: readonly [CardColor, CardNumber, Rect],
  ) => void;
}>;

export const PlayerCardsArea = memoNamed(
  'PlayerCardsArea',
  ({
    rotate,
    areaSize,
    cardSize,
    cards,
    paddingPx,
    windowSize,
    cardPositionsDispatcher,
  }: Props) => {
    const rotateStyle = useMemo<preact.CSSProperties>(() => {
      const common = {
        padding: `${paddingPx}px`,
        transform: `rotate(${rotate}deg)`,
        width: `${areaSize.width}px`,
        height: `${areaSize.height}px`,
        zIndex: zIndex.cards,
      };

      switch (rotate) {
        case 0:
        case 180:
          return {
            ...common,
            top: 0,
            left: 0,
          };
        case 90:
        case 270:
          return {
            ...common,
            top: `${(areaSize.width - areaSize.height) / 2}px`,
            left: `${-(areaSize.width - areaSize.height) / 2}px`,
          };
      }
    }, [rotate, paddingPx, areaSize]);

    const cardsWithConfig = useMemo<
      FixedLengthTuple<
        6,
        CardWithDisplayValue &
          Readonly<{
            key: string;
            onBoundingClientRectChange: (rect: Rect) => void;
          }>
      >
    >(
      // Not `pipe(cards).map(Arr.map(…))`: `lint:fix` rewrites that into
      // `Arr.map`'s curried overload, which cannot infer the element type.
      () =>
        Arr.map(cards, (c: CardWithDisplayValue) => ({
          ...c,
          key: cardToString(c),
          onBoundingClientRectChange: (rect: Rect) => {
            cardPositionsDispatcher([c.color, c.number, rect]);
          },
        })),
      [cards, cardPositionsDispatcher],
    );

    return (
      <Container>
        <RotateContainer style={rotateStyle}>
          {cardsWithConfig.map((c) => (
            <CardComponent
              key={c.key}
              color={c.color}
              float={c.float}
              isClickable={c.isClickable}
              number={c.number}
              outlineColor={c.outlineColor}
              showOutline={c.showOutline}
              size={cardSize}
              visibilityFromMe={c.visibilityFromMe}
              windowSize={windowSize}
              onBoundingClientRectChange={c.onBoundingClientRectChange}
              onClick={c.onClick}
            />
          ))}
        </RotateContainer>
      </Container>
    );
  },
);

const Container = styled('div')`
  max-width: 100%;
  max-height: 100%;
  position: relative;
`;

const RotateContainer = styled('div')`
  position: absolute;
  top: -50%;
  left: -50%;

  display: flex;
  justify-content: space-between;
`;
