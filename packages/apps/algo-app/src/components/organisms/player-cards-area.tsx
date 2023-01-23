import type { Rect, RectSize } from '@noshiro/ts-utils-additional';
import { zIndex } from '../../constants';
import { cardToString } from '../../functions';
import type { CardColor, CardNumber, CardWithDisplayValue } from '../../types';
import { CardComponent } from '../card';

type Props = Readonly<{
  areaSize: RectSize;
  cardSize: RectSize;
  rotate: 0 | 90 | 180 | 270;
  cards: ArrayOfLength<6, CardWithDisplayValue>;
  paddingPx: number;
  windowSize: RectSize;
  cardPositionsDispatcher: (
    action: readonly [CardColor, CardNumber, Rect]
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
    const rotateStyle = useMemo<CSSProperties>(() => {
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
      ArrayOfLength<
        6,
        CardWithDisplayValue &
          Readonly<{
            key: string;
            onBoundingClientRectChange: (rect: Rect) => void;
          }>
      >
    >(
      () =>
        pipe(cards).chain((list) =>
          Arr.map(list, (c: CardWithDisplayValue) => ({
            ...c,
            key: cardToString(c),
            onBoundingClientRectChange: (rect: Rect) => {
              cardPositionsDispatcher([c.color, c.number, rect]);
            },
          }))
        ).value,
      [cards, cardPositionsDispatcher]
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
  }
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
