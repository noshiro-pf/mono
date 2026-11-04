import { Arr } from 'ts-data-forge';
import { cardEq } from '../../functions/index.mjs';
import type { Card, GameState, VisibleTo } from '../../types/index.mjs';

/** Turns every card that is `target` so that `visibleTo` sees it. */
export const setVisibility = (
  state: GameState,
  target: Card | undefined,
  visibleTo: VisibleTo,
): GameState => ({
  ...state,
  // The inner `Arr.map` is not curried: its curried overload cannot infer the
  // element type from the callback alone and leaves every parameter `unknown`.
  // eslint-disable-next-line ts-restrictions/prefer-curried-call
  playerCards: Arr.map(state.playerCards, (cards) =>
    Arr.map(cards, (c) => (cardEq(c, target) ? { ...c, visibleTo } : c)),
  ),
});
