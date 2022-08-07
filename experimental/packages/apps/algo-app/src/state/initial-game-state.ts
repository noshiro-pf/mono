import { type GameState } from '../types';

export const initialGameState: GameState = {
  playerCards: [
    [
      { color: 'black', number: 0, visibleTo: 'self' },
      { color: 'black', number: 1, visibleTo: 'self' },
      { color: 'black', number: 2, visibleTo: 'self' },
      { color: 'black', number: 3, visibleTo: 'self' },
      { color: 'black', number: 4, visibleTo: 'self' },
      { color: 'black', number: 5, visibleTo: 'self' },
    ],
    [
      { color: 'black', number: 6, visibleTo: 'self' },
      { color: 'black', number: 7, visibleTo: 'self' },
      { color: 'black', number: 8, visibleTo: 'self' },
      { color: 'black', number: 9, visibleTo: 'self' },
      { color: 'black', number: 10, visibleTo: 'self' },
      { color: 'black', number: 11, visibleTo: 'self' },
    ],
    [
      { color: 'white', number: 0, visibleTo: 'self' },
      { color: 'white', number: 1, visibleTo: 'self' },
      { color: 'white', number: 2, visibleTo: 'self' },
      { color: 'white', number: 3, visibleTo: 'self' },
      { color: 'white', number: 4, visibleTo: 'self' },
      { color: 'white', number: 5, visibleTo: 'self' },
    ],
    [
      { color: 'white', number: 6, visibleTo: 'self' },
      { color: 'white', number: 7, visibleTo: 'self' },
      { color: 'white', number: 8, visibleTo: 'self' },
      { color: 'white', number: 9, visibleTo: 'self' },
      { color: 'white', number: 10, visibleTo: 'self' },
      { color: 'white', number: 11, visibleTo: 'self' },
    ],
  ],

  // attack and answer
  cardChosenToToss: undefined,
  cardChosenToAttack: undefined,
  cardChosenToBeAttacked: undefined,
  answerSelected: undefined,
  confirmTossBalloonIsOpen: false,
  selectAnswerBalloonIsOpen: false,
  decidedAnswerBalloonIsOpen: false,
  judgeOnDecidedAnswerIsOpen: false,
  judgeResult: undefined,
  readonly: false,

  // turn and phase
  currentPlayerIndex: 1,
  phase: 'ph010_selectMyCardToToss',
};
