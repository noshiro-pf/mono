import { map, type InitializedObservable } from 'synstate';
import { constant, For, view, type Bindable, type JSX } from 'synstate-dom';
import type { RectSize } from 'ts-utils-additional';
import { darkGray } from '../../constants/index.mjs';
import { cardToString } from '../../functions/index.mjs';
import type { Card } from '../../types/index.mjs';
import {
  CardComponent,
  faceUpCard,
  isSameCardDisplay,
} from '../card/index.mjs';
import * as styles from './my-cards.module.css';

type Props = Readonly<{
  cards: Bindable<readonly Card[]>;
  height: InitializedObservable<number>;
}>;

const paddingPx = 2;

export const MyCards = ({ cards, height }: Props): JSX.Element => {
  const cardSize: InitializedObservable<RectSize> = height.pipe(
    map((h) => {
      const cardHeight = h - 4 * paddingPx;

      return { width: (2 / 3) * cardHeight, height: cardHeight };
    }),
  );

  return (
    <div
      class={constant(styles.cards)}
      style={{
        height: view(height, (h) => `${h}px`),
        'background-color': constant(darkGray),
        '--my-cards-gap': constant(`${paddingPx}px`),
      }}
    >
      <For items={cards} key={cardToString}>
        {(card$) => (
          <CardComponent
            card={card$.pipe(
              map((card) => faceUpCard(card), { equals: isSameCardDisplay }),
            )}
            size={cardSize}
          />
        )}
      </For>
    </div>
  );
};
