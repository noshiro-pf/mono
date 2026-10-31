import { map, type InitializedObservable } from 'synstate';
import { constant, For, view, type Bindable, type JSX } from 'synstate-dom';
import type { Rect, RectSize } from 'ts-utils-additional';
import { cardToString } from '../../functions/index.mjs';
import type {
  CardColor,
  CardNumber,
  CardWithDisplayValue,
} from '../../types/index.mjs';
import {
  CardComponent,
  isSameCardDisplay,
  toCardDisplay,
} from '../card/index.mjs';
import * as styles from './player-cards-area.module.css';

type Props = Readonly<{
  areaSize: InitializedObservable<RectSize>;
  cardSize: InitializedObservable<RectSize>;
  rotate: 0 | 90 | 180 | 270;
  cards: Bindable<readonly CardWithDisplayValue[]>;
  paddingPx: number;
  /** When to measure the cards again: whatever may have moved them. */
  measureOn: InitializedObservable<unknown>;
  cardPositionsDispatcher: (
    action: readonly [CardColor, CardNumber, Rect],
  ) => void;
}>;

export const PlayerCardsArea = ({
  rotate,
  areaSize,
  cardSize,
  cards,
  paddingPx,
  measureOn,
  cardPositionsDispatcher,
}: Props): JSX.Element => {
  // A side area is laid out as a row and turned a quarter, about its centre;
  // this moves it back to where the grid cell is.
  const isSide = rotate === 90 || rotate === 270;

  return (
    <div class={constant(styles.area)}>
      <div
        class={constant(styles.rotate)}
        style={{
          padding: constant(`${paddingPx}px`),
          transform: constant(`rotate(${rotate}deg)`),
          width: view(areaSize, (s) => `${s.width}px`),
          height: view(areaSize, (s) => `${s.height}px`),
          top: isSide
            ? view(areaSize, (s) => `${(s.width - s.height) / 2}px`)
            : constant('0px'),
          left: isSide
            ? view(areaSize, (s) => `${-(s.width - s.height) / 2}px`)
            : constant('0px'),
        }}
      >
        <For items={cards} key={cardToString}>
          {(card$) => (
            <CardComponent
              card={card$.pipe(
                map(toCardDisplay, { equals: isSameCardDisplay }),
              )}
              rectReport={{
                measureOn,
                onBoundingClientRectChange: (rect) => {
                  const c = card$.getSnapshot().value;

                  cardPositionsDispatcher([c.color, c.number, rect]);
                },
              }}
              size={cardSize}
              onClick={() => {
                card$.getSnapshot().value.onClick();
              }}
            />
          )}
        </For>
      </div>
    </div>
  );
};
