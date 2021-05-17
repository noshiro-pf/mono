import type { ReadonlyArrayOfLength } from '@noshiro/ts-utils';
import { map, match, pipe } from '@noshiro/ts-utils';
import { directions, outlineColorDef, text } from '../constants';
import {
  cardEq,
  decrementPlayerIndex,
  incrementPlayerIndex,
  sortCards,
} from '../functions';
import type {
  Card,
  CardWithDisplayValue,
  CardWithVisibility,
  Direction,
  DisplayValues,
  PlayerIndex,
  VisibilityFromMe,
} from '../types';
import type { GameState } from './game-state';

const mapPlayers6CardsToDisplayValue = ({
  direction,
  player6Cards,
  gameState,
  onCardClick,
}: Readonly<{
  direction: Direction;
  player6Cards: ReadonlyArrayOfLength<6, CardWithVisibility>;
  gameState: GameState;
  onCardClick: (card: Card, playerDirectionFromMe: Direction) => void;
}>): ReadonlyArrayOfLength<6, CardWithDisplayValue> =>
  pipe(player6Cards)
    .chain(sortCards)
    .chain(
      map<CardWithVisibility, CardWithDisplayValue>((c) => {
        const isAns = cardEq(gameState.cardChosenToBeAttacked, c);
        const isAtk = cardEq(gameState.cardChosenToAttack, c);

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

        const isClickable: boolean = match(direction, {
          S:
            visibilityFromMe !== 'faceUp' &&
            match(gameState.phase, {
              ph000_startOfTheTurn: false,
              ph010_selectMyCardToToss: true,
              ph030_firstAnswer: true,
              ph040_continuousAnswer: false,
              ph990_endOfTheTurn: false,
            }),
          W:
            visibilityFromMe !== 'faceUp' &&
            match(gameState.phase, {
              ph000_startOfTheTurn: false,
              ph010_selectMyCardToToss: false,
              ph030_firstAnswer: true,
              ph040_continuousAnswer: true,
              ph990_endOfTheTurn: false,
            }),
          N: false,
          E:
            visibilityFromMe !== 'faceUp' &&
            match(gameState.phase, {
              ph000_startOfTheTurn: false,
              ph010_selectMyCardToToss: false,
              ph030_firstAnswer: true,
              ph040_continuousAnswer: true,
              ph990_endOfTheTurn: false,
            }),
        });

        return {
          ...c,
          visibilityFromMe,
          isClickable,
          float: match(direction, {
            S: isAtk ? 'always' : 'never',
            W: 'never',
            N: 'never',
            E: 'never',
          } as const),
          showOutline: match(direction, {
            S: isAtk ? 'always' : isClickable ? 'onHover' : 'never',
            W: isAns ? 'always' : isClickable ? 'onHover' : 'never',
            N: 'never',
            E: isAns ? 'always' : isClickable ? 'onHover' : 'never',
          } as const),
          outlineColor:
            isAns || isAtk ? outlineColorDef.red : outlineColorDef.green,
          showBalloon: isAns,
          onClick: () => {
            onCardClick(c, direction);
          },
        };
      })
    ).value;

export const mapToDisplayValue = ({
  gameState,
  myPlayerIndex,
  onCardClick,
}: Readonly<{
  gameState: GameState;
  myPlayerIndex: PlayerIndex;
  onCardClick: (card: Card, playerDirectionFromMe: Direction) => void;
}>): DisplayValues =>
  ({
    playerCards: {
      S: mapPlayers6CardsToDisplayValue({
        direction: 'S',
        player6Cards: gameState.playerCards[myPlayerIndex],
        gameState,
        onCardClick,
      }),
      W: mapPlayers6CardsToDisplayValue({
        direction: 'W',
        player6Cards:
          gameState.playerCards[incrementPlayerIndex(myPlayerIndex, 1)],
        gameState,
        onCardClick,
      }),
      N: mapPlayers6CardsToDisplayValue({
        direction: 'N',
        player6Cards:
          gameState.playerCards[incrementPlayerIndex(myPlayerIndex, 2)],
        gameState,
        onCardClick,
      }),
      E: mapPlayers6CardsToDisplayValue({
        direction: 'E',
        player6Cards:
          gameState.playerCards[incrementPlayerIndex(myPlayerIndex, 3)],
        gameState,
        onCardClick,
      }),
    },

    gameMessage: text.gameMessage.selectYourCardToAttack,
    turnPlayer: match(gameState.currentPlayerIndex, {
      0: directions[decrementPlayerIndex(0, myPlayerIndex)],
      1: directions[decrementPlayerIndex(1, myPlayerIndex)],
      2: directions[decrementPlayerIndex(2, myPlayerIndex)],
      3: directions[decrementPlayerIndex(3, myPlayerIndex)],
    }),
  } as const);
