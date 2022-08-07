import { type RectSize } from '@noshiro/ts-utils-additional';
import { darkGray } from '../../constants';
import { cardToString } from '../../functions';
import { type Card } from '../../types';
import { CardComponent } from '../card';

type Props = Readonly<{
  cards: ArrayOfLength<6, Card>;
  height: number;
  cardsAreHidden: boolean;
}>;

export const MyCards = memoNamed<Props>(
  'MyCards',
  ({ cards, height, cardsAreHidden }) => {
    const paddingPx = useMemo(() => Math.round(height / 30), [height]);

    const wrapperStyle = useMemo<preact.JSX.CSSProperties>(
      () => ({
        height: `${height}px`,
        padding: `${paddingPx}px`,
      }),
      [height, paddingPx],
    );

    const cardHeight = useMemo<number>(
      () => height - 4 * paddingPx,
      [height, paddingPx],
    );

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
            hidden={cardsAreHidden}
            number={card.number}
            size={cardSize}
          />
        ))}
      </Wrapper>
    );
  },
);

const Wrapper = styled('div')`
  display: flex;
  background-color: ${darkGray};

  & > * {
    margin: 1px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;
