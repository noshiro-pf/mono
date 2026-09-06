import { Arr, match } from 'ts-data-forge';
import { type FixedLengthTuple, type StrictPick } from 'ts-type-forge';
import {
  dictionary,
  directions,
  outlineColorDef,
} from '../constants/index.mjs';
import {
  cardEq,
  decrementPlayerIndex,
  incrementPlayerIndex,
  sortCards,
} from '../functions/index.mjs';
import {
  type Card,
  type CardWithDisplayValue,
  type CardWithVisibility,
  type DisplayValues,
  type GameState,
  type NWES,
  type PlayerIndex,
  type VisibilityFromMe,
} from '../types/index.mjs';

const mapPlayers6CardsToDisplayValue = ({
  direction,
  player6Cards,
  gameState,
  myPlayerIndex,
  onCardClick,
}: Readonly<{
  direction: NWES;
  player6Cards: FixedLengthTuple<6, CardWithVisibility>;
  gameState: StrictPick<
    GameState,
    | 'cardChosenToAttack'
    | 'cardChosenToBeAttacked'
    | 'cardChosenToToss'
    | 'currentPlayerIndex'
    | 'phase'
    | 'readonly'
  >;
  myPlayerIndex: PlayerIndex;
  onCardClick: (card: Card, playerDirectionFromMe: NWES) => void;
}>): FixedLengthTuple<6, CardWithDisplayValue> =>
  // Written as `Arr.map(sortCards(…), …)` rather than
  // `pipe().map(Arr.map(…))`: `lint:fix` rewrites the latter into `Arr.map`'s
  // curried overload, which cannot infer the element type from the callback
  // alone and leaves every parameter `unknown`.
  Arr.map(sortCards(player6Cards), (c) => {
    const isAns = cardEq(gameState.cardChosenToBeAttacked, c);

    const isAtk = cardEq(gameState.cardChosenToAttack, c);

    const isToss = cardEq(gameState.cardChosenToToss, c);

    const visibilityFromMe: VisibilityFromMe = match(c.visibleTo, {
      self: 'faceDown',
      pair: match(direction, {
        S: 'faceDownButVisibleToMe',
        W: 'faceDownButVisibleToCounter',
        N: 'faceDownButVisibleToMe',
        E: 'faceDownButVisibleToCounter',
      } as const),
      everyone: 'faceUp',
    } as const);

    const isClickable: boolean =
      gameState.readonly || myPlayerIndex !== gameState.currentPlayerIndex
        ? false
        : match(direction, {
            // me
            S:
              visibilityFromMe !== 'faceUp' &&
              match(gameState.phase, {
                ph010_selectMyCardToToss: true,
                ph020_firstAnswer: true,
                ph030_continuousAnswer: false,
              }),
            W:
              visibilityFromMe !== 'faceUp' &&
              match(gameState.phase, {
                ph010_selectMyCardToToss: false,
                ph020_firstAnswer: true,
                ph030_continuousAnswer: true,
              }),
            N: false,
            E:
              visibilityFromMe !== 'faceUp' &&
              match(gameState.phase, {
                ph010_selectMyCardToToss: false,
                ph020_firstAnswer: true,
                ph030_continuousAnswer: true,
              }),
          } as const);

    return {
      ...c,
      visibilityFromMe,
      isClickable,
      float: isAtk || isToss ? 'always' : 'never',
      showOutline: match(direction, {
        S: isAtk || isToss ? 'always' : isClickable ? 'onHover' : 'never',
        W: isAns ? 'always' : isClickable ? 'onHover' : 'never',
        N: 'never',
        E: isAns ? 'always' : isClickable ? 'onHover' : 'never',
      } as const),
      outlineColor:
        isAns || isAtk || isToss ? outlineColorDef.red : outlineColorDef.green,
      onClick: !isClickable
        ? () => undefined
        : () => {
            onCardClick(c, direction);
          },
    } as const;
  });

export const mapToDisplayValue = ({
  gameState,
  myPlayerIndex,
  onCardClick,
}: Readonly<{
  gameState: GameState;
  myPlayerIndex: PlayerIndex;
  onCardClick: (card: Card, playerDirectionFromMe: NWES) => void;
}>): DisplayValues =>
  ({
    playerCards: {
      S: mapPlayers6CardsToDisplayValue({
        direction: 'S',
        player6Cards: gameState.playerCards[myPlayerIndex],
        gameState,
        myPlayerIndex,
        onCardClick,
      }),
      W: mapPlayers6CardsToDisplayValue({
        direction: 'W',
        player6Cards:
          gameState.playerCards[incrementPlayerIndex(myPlayerIndex, 1)],
        gameState,
        myPlayerIndex,
        onCardClick,
      }),
      N: mapPlayers6CardsToDisplayValue({
        direction: 'N',
        player6Cards:
          gameState.playerCards[incrementPlayerIndex(myPlayerIndex, 2)],
        gameState,
        myPlayerIndex,
        onCardClick,
      }),
      E: mapPlayers6CardsToDisplayValue({
        direction: 'E',
        player6Cards:
          gameState.playerCards[incrementPlayerIndex(myPlayerIndex, 3)],
        gameState,
        myPlayerIndex,
        onCardClick,
      }),
    },

    gameMessage: match(gameState.phase, {
      ph010_selectMyCardToToss: dictionary.gameMessage.selectYourCardToToss,
      ph020_firstAnswer: dictionary.gameMessage.selectYourCardAndAttack,
      ph030_continuousAnswer: dictionary.gameMessage.selectYourCardToAttack,
    }),
    // Every branch of the original `match` was the same expression with the
    // matched value substituted, so it collapses to one call. `match` also
    // requires string cases now, and `currentPlayerIndex` is numeric.
    turnPlayer:
      directions[
        decrementPlayerIndex(gameState.currentPlayerIndex, myPlayerIndex)
      ],

    endTurnButtonDisabled:
      gameState.phase !== 'ph030_continuousAnswer' || gameState.readonly,
  }) as const;
