import { styled } from 'goober';
import { memoNamed } from 'preact-utils';
import { useMemo } from 'preact/hooks';
import { type FixedLengthTuple } from 'ts-type-forge';
import { type RectSize } from 'ts-utils-additional';
import { darkGray } from '../../constants/index.mjs';
import { cardToString } from '../../functions/index.mjs';
import { type Card } from '../../types/index.mjs';
import { CardComponent } from '../card/index.mjs';

type Props = Readonly<{
  cards: FixedLengthTuple<6, Card>;
  height: number;
}>;

const paddingPx = 2;

export const MyCards = memoNamed<Props>('MyCards', ({ cards, height }) => {
  const wrapperStyle = useMemo<preact.CSSProperties>(
    () => ({
      height: `${height}px`,
    }),
    [height],
  );

  const cardHeight = useMemo<number>(() => height - 4 * paddingPx, [height]);

  const cardSize = useMemo<RectSize>(
    () => ({ width: (2 / 3) * cardHeight, height: cardHeight }),
    [cardHeight],
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
