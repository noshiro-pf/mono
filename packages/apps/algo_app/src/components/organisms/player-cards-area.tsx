import { styled } from '@noshiro/goober';
import { memoNamed } from '@noshiro/preact-utils';
import type { ReadonlyArrayOfLength, Rect, RectSize } from '@noshiro/ts-utils';
import { map, pipe } from '@noshiro/ts-utils';
import { useMemo } from 'preact/hooks';
import type { JSXInternal } from 'preact/src/jsx';
import { zIndex } from '../../constants';
import type { CardColor, CardNumber, CardWithDisplayValue } from '../../types';
import { CardComponent } from '../card';

type Props = Readonly<{
  areaSize: RectSize;
  cardSize: RectSize;
  rotate: 0 | 90 | 180 | 270;
  cards: ReadonlyArrayOfLength<6, CardWithDisplayValue>;
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
    const rotateStyle = useMemo<JSXInternal.CSSProperties>(() => {
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
      ReadonlyArrayOfLength<
        6,
        CardWithDisplayValue & {
          readonly onBoundingClientRectChange: (rect: Rect) => void;
        }
      >
    >(
      () =>
        pipe(cards).chain(
          map((c: CardWithDisplayValue) => ({
            ...c,
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
          {cardsWithConfig.map((c, index) => (
            <CardComponent
              key={index}
              number={c.number}
              color={c.color}
              size={cardSize}
              visibilityFromMe={c.visibilityFromMe}
              isClickable={c.isClickable}
              float={c.float}
              showOutline={c.showOutline}
              outlineColor={c.outlineColor}
              onClick={c.onClick}
              windowSize={windowSize}
              onBoundingClientRectChange={c.onBoundingClientRectChange}
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
