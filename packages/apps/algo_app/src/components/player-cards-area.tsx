import { styled } from '@noshiro/goober';
import { memoNamed } from '@noshiro/preact-utils';
import type { RectSize } from '@noshiro/ts-utils';
import { useMemo } from 'preact/hooks';
import type { JSXInternal } from 'preact/src/jsx';
import type { Player6Cards } from '../types/player-6-card';
import { Card as CardComponent } from './cards/card';

type Props = Readonly<{
  areaSize: RectSize;
  cardSize: RectSize;
  rotate: 0 | 90 | 180 | 270;
  cards: Player6Cards;
  paddingPx: number;
}>;

export const PlayerCardsArea = memoNamed(
  'PlayerCardsArea',
  ({ rotate, areaSize, cardSize, cards, paddingPx }: Props) => {
    const rotateStyle = useMemo<JSXInternal.CSSProperties>(() => {
      const common = {
        padding: `${paddingPx}px`,
        transform: `rotate(${rotate}deg)`,
        width: `${areaSize.width}px`,
        height: `${areaSize.height}px`,
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

    return (
      <Container>
        <RotateContainer style={rotateStyle}>
          {cards.map((c, index) => (
            <CardComponent
              key={index}
              faceUp={c.faceUp}
              number={c.number}
              color={c.color}
              size={cardSize}
              visibleToMe={c.visibleToPair}
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
