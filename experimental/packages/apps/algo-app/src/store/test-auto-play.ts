import { fromArray, interval, merge, take } from '@noshiro/syncflow';
import { serverTimestamp } from 'firebase/firestore';
import { time } from '../constants';
import { type GameState } from '../types';
import { gameStateDispatcher, onAnswerSubmit } from './action';

const autoPlaySpeedRate = 0.5;

const enableAutoPlay: boolean = (() => false)();

const initialPlayerCards: GameState['playerCards'] = [
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
];

const actionsToAutoPlay = [
  [
    {
      type: 'selectMyCard',
      timestamp: serverTimestamp(),
      card: { color: 'black', number: 6 },
    },
    {
      type: 'submitToss',
      timestamp: serverTimestamp(),
    },
    {
      type: 'selectMyCard',
      timestamp: serverTimestamp(),
      card: { color: 'white', number: 7 },
    },
    {
      type: 'selectOpponentCard',
      timestamp: serverTimestamp(),
      card: { color: 'black', number: 8 },
    },
    {
      type: 'selectAnswer',
      timestamp: serverTimestamp(),
      answer: { color: 'black', number: 9 },
    },
    {
      type: 'submitAnswer',
      timestamp: serverTimestamp(),
    },
  ],
  [
    {
      type: 'selectMyCard',
      timestamp: serverTimestamp(),
      card: { color: 'white', number: 1 },
    },
    {
      type: 'submitToss',
      timestamp: serverTimestamp(),
    },
    {
      type: 'selectMyCard',
      timestamp: serverTimestamp(),
      card: { color: 'black', number: 8 },
    },
    {
      type: 'selectOpponentCard',
      timestamp: serverTimestamp(),
      card: { color: 'black', number: 6 },
    },
    {
      type: 'selectAnswer',
      timestamp: serverTimestamp(),
      answer: { color: 'black', number: 7 },
    },
    {
      type: 'submitAnswer',
      timestamp: serverTimestamp(),
    },
  ],
  [
    {
      type: 'selectMyCard',
      timestamp: serverTimestamp(),
      card: { color: 'white', number: 8 },
    },
    {
      type: 'submitToss',
      timestamp: serverTimestamp(),
    },
    {
      type: 'selectMyCard',
      timestamp: serverTimestamp(),
      card: { color: 'white', number: 3 },
    },
    {
      type: 'selectOpponentCard',
      timestamp: serverTimestamp(),
      card: { color: 'white', number: 0 },
    },
    {
      type: 'selectAnswer',
      timestamp: serverTimestamp(),
      answer: { color: 'white', number: 1 },
    },
    {
      type: 'submitAnswer',
      timestamp: serverTimestamp(),
    },
  ],
  [
    {
      type: 'selectMyCard',
      timestamp: serverTimestamp(),
      card: { color: 'black', number: 5 },
    },
    {
      type: 'submitToss',
      timestamp: serverTimestamp(),
    },
    {
      type: 'selectMyCard',
      timestamp: serverTimestamp(),
      card: { color: 'black', number: 0 },
    },
    {
      type: 'selectOpponentCard',
      timestamp: serverTimestamp(),
      card: { color: 'black', number: 6 },
    },
    {
      type: 'selectAnswer',
      timestamp: serverTimestamp(),
      answer: { color: 'black', number: 7 },
    },
    {
      type: 'submitAnswer',
      timestamp: serverTimestamp(),
    },
  ],
] as const;

const autoPlayMargin = 1 + (time.showJudge + time.hideJudge) / 1000;

type NumSkip = NonZeroSafeIntWithSmallInt;

const isNumSkip = (n: number): n is NumSkip =>
  Number.isSafeInteger(n) && Num.isNonZero(n) && Num.isNonNegative(n);

const toNumSkip = (n: number): NumSkip => {
  if (!isNumSkip(n)) {
    throw new Error('invalid value for NumSkip');
  }
  return n;
};

const actionsToAutoPlayStream = <T>(
  actions: readonly T[],
  numSkip: NumSkip,
): Observable<T> =>
  zip([
    Num.isPositive(numSkip)
      ? interval(autoPlaySpeedRate * 1000)
          .chain(skip(numSkip))
          .chain(take(toPositiveSafeInt(Arr.length(actions))))
      : interval(autoPlaySpeedRate * 1000).chain(
          take(toPositiveSafeInt(Arr.length(actions))),
        ),
    fromArray(actions),
  ] as const).chain(map(([, action]) => action));

// eslint-disable-next-line deprecation/deprecation
const autoPlay$ = merge([
  actionsToAutoPlayStream(actionsToAutoPlay[0], 1),
  actionsToAutoPlayStream(
    actionsToAutoPlay[1],
    toNumSkip(autoPlayMargin + actionsToAutoPlay[0].length),
  ),
  actionsToAutoPlayStream(
    actionsToAutoPlay[2],
    toNumSkip(
      autoPlayMargin +
        actionsToAutoPlay[0].length +
        autoPlayMargin +
        actionsToAutoPlay[1].length,
    ),
  ),
  actionsToAutoPlayStream(
    actionsToAutoPlay[3],
    toNumSkip(
      autoPlayMargin +
        actionsToAutoPlay[0].length +
        autoPlayMargin +
        actionsToAutoPlay[1].length +
        autoPlayMargin +
        actionsToAutoPlay[2].length,
    ),
  ),
] as const).chain(take(enableAutoPlay ? toPositiveSafeInt(1000) : 1));

autoPlay$.subscribe((action) => {
  if (action.type === 'submitAnswer') {
    onAnswerSubmit();
  } else {
    gameStateDispatcher(action);
  }
});

export const startAutoPlay = (): void => {
  gameStateDispatcher({
    type: 'initializePlayerCards',
    cards: initialPlayerCards,
    timestamp: serverTimestamp(),
  });

  interval(1000)
    .chain(take(10))
    .subscribe(() => {
      gameStateDispatcher({
        type: 'goToNextTurn',
        timestamp: serverTimestamp(),
      });
    });
};
