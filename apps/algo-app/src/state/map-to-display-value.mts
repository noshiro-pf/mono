import { Arr, match } from 'ts-data-forge';
import type { FixedLengthTuple, StrictPick } from 'ts-type-forge';
import {
  dictionary,
  directions,
  outlineColorDef,
} from '../constants/index.mjs';
import {
  cardEq,
  decrementPlayerIndex,
  getShuffledPlayers,
  incrementPlayerIndex,
  sortCards,
} from '../functions/index.mjs';
import type {
  Card,
  CardWithDisplayValue,
  CardWithVisibility,
  DisplayValues,
  GameState,
  NWES,
  PlayerIndex,
  PlayerWithId,
  RoomState,
  ShuffleDef,
  VisibilityFromMe,
} from '../types/index.mjs';

export const mapToDisplayValue = ({
  roomState,
  gameState,
  shuffleDef,
  players,
  myPlayerIndex,
  onCardClick,
}: Readonly<{
  roomState: RoomState;
  gameState: GameState;
  shuffleDef: ShuffleDef;
  /** In the order they joined; `shuffleDef` seats them. */
  players: readonly PlayerWithId[];
  myPlayerIndex: PlayerIndex;
  onCardClick: (card: Card, playerDirectionFromMe: NWES) => void;
}>): DisplayValues =>
  ({
    playerCards: {
      S: mapPlayers6CardsToDisplayValue({
        direction: 'S',
        roomState,
        player6Cards: gameState.playerCards[myPlayerIndex],
        gameState,
        myPlayerIndex,
        onCardClick,
      }),
      W: mapPlayers6CardsToDisplayValue({
        direction: 'W',
        roomState,
        player6Cards:
          gameState.playerCards[incrementPlayerIndex(myPlayerIndex, 1)],
        gameState,
        myPlayerIndex,
        onCardClick,
      }),
      N: mapPlayers6CardsToDisplayValue({
        direction: 'N',
        roomState,
        player6Cards:
          gameState.playerCards[incrementPlayerIndex(myPlayerIndex, 2)],
        gameState,
        myPlayerIndex,
        onCardClick,
      }),
      E: mapPlayers6CardsToDisplayValue({
        direction: 'E',
        roomState,
        player6Cards:
          gameState.playerCards[incrementPlayerIndex(myPlayerIndex, 3)],
        gameState,
        myPlayerIndex,
        onCardClick,
      }),
    },

    playerNames: playerNamesOf(players, shuffleDef, myPlayerIndex),

    cardsAreHidden: roomState === 'not-started',

    gameMessage: match(roomState, {
      'not-started': dictionary.gameMessage.startGame,
      // TODO: which team won
      finished: dictionary.gameMessage.gameEnded.youWin,
      playing: match(gameState.phase, {
        ph010_selectMyCardToToss: dictionary.gameMessage.selectYourCardToToss,
        ph020_firstAnswer: dictionary.gameMessage.selectYourCardAndAttack,
        ph030_continuousAnswer: dictionary.gameMessage.selectYourCardToAttack,
      }),
    }),
    // Every branch of the original `match` was the same expression with the
    // matched value substituted, so it collapses to one call. `match` also
    // requires string cases now, and `currentPlayerIndex` is numeric.
    turnPlayer:
      directions[
        decrementPlayerIndex(gameState.currentPlayerIndex, myPlayerIndex)
      ],

    roomState,

    startGameButtonState:
      roomState !== 'not-started'
        ? 'hidden'
        : Arr.isFixedLengthArray(4, players)
          ? 'shown'
          : 'disabled',

    endTurnButtonDisabled:
      gameState.phase !== 'ph030_continuousAnswer' || gameState.readonly,
  }) as const;

const playerNamesOf = (
  players: readonly PlayerWithId[],
  shuffleDef: ShuffleDef,
  myPlayerIndex: PlayerIndex,
): DisplayValues['playerNames'] => {
  const seated = getShuffledPlayers(players, shuffleDef);

  return {
    S: seated[myPlayerIndex]?.name,
    W: seated[incrementPlayerIndex(myPlayerIndex, 1)]?.name,
    N: seated[incrementPlayerIndex(myPlayerIndex, 2)]?.name,
    E: seated[incrementPlayerIndex(myPlayerIndex, 3)]?.name,
  } as const;
};

const mapPlayers6CardsToDisplayValue = ({
  direction,
  player6Cards,
  roomState,
  gameState,
  myPlayerIndex,
  onCardClick,
}: Readonly<{
  direction: NWES;
  player6Cards: FixedLengthTuple<6, CardWithVisibility>;
  roomState: RoomState;
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
  // Written as `Arr.map(sortCards(…), …)` rather than `pipe().map(Arr.map(…))`:
  // `fix:lint` rewrites the latter into `Arr.map`'s curried overload, which
  // cannot infer the element type from the callback alone and leaves every
  // parameter `unknown`.
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

    // No card is played before the game starts or after it ends.
    const isClickable: boolean =
      roomState === 'playing' &&
      !gameState.readonly &&
      myPlayerIndex === gameState.currentPlayerIndex &&
      match(direction, {
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
