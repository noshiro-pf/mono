import { styled } from '@noshiro/goober';
import type { RectSize } from '@noshiro/ts-utils-additional';
import type { JSXInternal } from 'preact/src/jsx';
import { darkGray } from '../../constants';
import { cardToString } from '../../functions';
import type { Card } from '../../types';
import { CardComponent } from '../card';

type Props = Readonly<{
  cards: ArrayOfLength<6, Card>;
  height: number;
}>;

const paddingPx = 2;

export const MyCards = memoNamed<Props>('MyCards', ({ cards, height }) => {
  const wrapperStyle = useMemo<JSXInternal.CSSProperties>(
    () => ({
      height: `${height}px`,
    }),
    [height]
  );

  const cardHeight = useMemo<number>(() => height - 4 * paddingPx, [height]);

  const cardSize = useMemo<RectSize>(
    () => ({ width: (2 / 3) * cardHeight, height: cardHeight }),
    [cardHeight]
  );

  return (
    <Wrapper style={wrapperStyle}>
      {cards.map((card) => (
        <CardComponent
          key={cardToString(card)}
          color={card.color}
          number={card.number}
          size={cardSize}
        />
      ))}
    </Wrapper>
  );
});

const Wrapper = styled('div')`
  display: flex;
  background-color: ${darkGray};
  padding: ${paddingPx}px;

  & > * {
    margin: ${paddingPx}px;
  }
`;
