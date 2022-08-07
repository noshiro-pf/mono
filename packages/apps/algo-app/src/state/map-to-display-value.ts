import { dictionary, directions, outlineColorDef } from '../constants';
import {
  cardEq,
  decrementPlayerIndex,
  getShuffledPlayers,
  incrementPlayerIndex,
  sortCards,
} from '../functions';
import {
  type Card,
  type CardWithDisplayValue,
  type CardWithVisibility,
  type DisplayValues,
  type GameState,
  type NWES,
  type PlayerIndex,
  type PlayerWithId,
  type RoomRemote,
  type ShuffleDef,
  type VisibilityFromMe,
} from '../types';

const mapPlayers6CardsToDisplayValue = ({
  direction,
  player6Cards,
  roomState,
  gameState,
  myPlayerIndex,
  onCardClick,
}: Readonly<{
  direction: NWES;
  player6Cards: ArrayOfLength<6, CardWithVisibility>;
  roomState: RoomRemote['state'];
  gameState: Pick<
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
}>): ArrayOfLength<6, CardWithDisplayValue> =>
  pipe(player6Cards)
    .chain(sortCards)
    .chain((list) =>
      Tpl.map(list, (c) => {
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

        const isClickable: boolean = gameState.readonly
          ? false
          : myPlayerIndex !== gameState.currentPlayerIndex
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
          disabled: roomState === 'not-started',
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
            isAns || isAtk || isToss
              ? outlineColorDef.red
              : outlineColorDef.green,
          onClick: !isClickable
            ? noop
            : () => {
                onCardClick(c, direction);
              },
        } as const;
      }),
    ).value;

export const mapToDisplayValue = ({
  roomState,
  gameState,
  shuffleDef,
  players,
  myPlayerIndex,
  onCardClick,
}: Readonly<{
  roomState: RoomRemote['state'];
  gameState: GameState;
  shuffleDef: ShuffleDef;
  players: readonly PlayerWithId[];
  myPlayerIndex: PlayerIndex;
  onCardClick: (card: Card, playerDirectionFromMe: NWES) => void;
}>): DisplayValues => ({
  playerCards: {
    S: mapPlayers6CardsToDisplayValue({
      direction: 'S',
      player6Cards: gameState.playerCards[myPlayerIndex],
      roomState,
      gameState,
      myPlayerIndex,
      onCardClick,
    }),
    W: mapPlayers6CardsToDisplayValue({
      direction: 'W',
      player6Cards:
        gameState.playerCards[incrementPlayerIndex(myPlayerIndex, 1)],
      roomState,
      gameState,
      myPlayerIndex,
      onCardClick,
    }),
    N: mapPlayers6CardsToDisplayValue({
      direction: 'N',
      player6Cards:
        gameState.playerCards[incrementPlayerIndex(myPlayerIndex, 2)],
      roomState,
      gameState,
      myPlayerIndex,
      onCardClick,
    }),
    E: mapPlayers6CardsToDisplayValue({
      direction: 'E',
      player6Cards:
        gameState.playerCards[incrementPlayerIndex(myPlayerIndex, 3)],
      roomState,
      gameState,
      myPlayerIndex,
      onCardClick,
    }),
  },

  playerNames: pipe(players)
    .chain((ps) => getShuffledPlayers(ps, shuffleDef))
    .chain((ps) => ({
      S: ps[myPlayerIndex]?.name,
      W: ps[incrementPlayerIndex(myPlayerIndex, 1)]?.name,
      N: ps[incrementPlayerIndex(myPlayerIndex, 2)]?.name,
      E: ps[incrementPlayerIndex(myPlayerIndex, 3)]?.name,
    })).value,

  cardsAreHidden: roomState === 'not-started',

  gameMessage: match(roomState, {
    'not-started': dictionary.gameMessage.startGame,
    finished: dictionary.gameMessage.gameEnded.youWin, // TODO
    playing: match(gameState.phase, {
      ph010_selectMyCardToToss: dictionary.gameMessage.selectYourCardToToss,
      ph020_firstAnswer: dictionary.gameMessage.selectYourCardAndAttack,
      ph030_continuousAnswer: dictionary.gameMessage.selectYourCardToAttack,
    }),
  }),
  turnPlayer: match(gameState.currentPlayerIndex, {
    0: directions[decrementPlayerIndex(0, myPlayerIndex)],
    1: directions[decrementPlayerIndex(1, myPlayerIndex)],
    2: directions[decrementPlayerIndex(2, myPlayerIndex)],
    3: directions[decrementPlayerIndex(3, myPlayerIndex)],
  }),

  roomState,

  startGameButtonState:
    roomState !== 'not-started'
      ? 'hidden'
      : players.length === 4 // ready
        ? 'shown'
        : 'disabled',

  endTurnButtonDisabled:
    gameState.phase !== 'ph030_continuousAnswer' || gameState.readonly,
});
