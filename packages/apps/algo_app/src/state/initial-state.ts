import type { GameState } from './game-state';

export const initialGameState: GameState = {
  playerCards: [
    [
      { color: 'black', number: 0, visibleTo: 'self' },
      { color: 'black', number: 1, visibleTo: 'self' },
      { color: 'white', number: 2, visibleTo: 'self' },
      { color: 'black', number: 4, visibleTo: 'pair' },
      { color: 'black', number: 5, visibleTo: 'self' },
      { color: 'white', number: 9, visibleTo: 'self' },
    ],
    [
      { color: 'white', number: 5, visibleTo: 'everyone' },
      { color: 'black', number: 6, visibleTo: 'self' },
      { color: 'white', number: 7, visibleTo: 'self' },
      { color: 'black', number: 9, visibleTo: 'pair' },
      { color: 'black', number: 10, visibleTo: 'self' },
      { color: 'white', number: 10, visibleTo: 'everyone' },
    ],
    [
      { color: 'white', number: 0, visibleTo: 'self' },
      { color: 'white', number: 1, visibleTo: 'self' },
      { color: 'black', number: 2, visibleTo: 'self' },
      { color: 'white', number: 4, visibleTo: 'pair' },
      { color: 'black', number: 8, visibleTo: 'self' },
      { color: 'white', number: 11, visibleTo: 'self' },
    ],
    [
      { color: 'black', number: 3, visibleTo: 'everyone' },
      { color: 'white', number: 3, visibleTo: 'self' },
      { color: 'white', number: 6, visibleTo: 'pair' },
      { color: 'black', number: 7, visibleTo: 'self' },
      { color: 'white', number: 8, visibleTo: 'self' },
      { color: 'black', number: 11, visibleTo: 'everyone' },
    ],
  ],

  // attack and answer
  cardChosenToAttack: undefined,
  cardChosenToBeAttacked: undefined,
  answerSelected: undefined,
  selectAnswerBalloonIsOpen: false,
  decidedAnswerBalloonIsOpen: false,
  judgeOnDecidedAnswerIsOpen: false,
  judgeResult: undefined,

  // turn and phase
  currentPlayerIndex: 1,
  phase: 'ph030_firstAnswer',
};
