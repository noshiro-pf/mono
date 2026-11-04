/**
 * The scripted game a development build plays with `?test`: a fixed deal, then
 * each player's turn, one action every `autoPlaySpeedRate` seconds.
 */

import { serverTimestamp } from 'firebase/firestore';
import {
  map,
  merge,
  scan,
  skip,
  take,
  type Observable as SynstateObservable,
} from 'synstate';
import { Arr, Num, SafeUint, asSafeUint } from 'ts-data-forge';
import type { NonEmptyTuple, SafeUintWithSmallInt } from 'ts-type-forge';
import { time } from '../constants/index.mjs';
import type { GameState, GameStateActionToWrite } from '../types/index.mjs';

export const autoPlayPlayerCards: GameState['playerCards'] = [
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

const autoPlaySpeedRate = 0.5;

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
  // Not `satisfies NonEmptyArray<…>`: that type carries a brand only a guard
  // can establish, and a `const` tuple literal is already statically non-empty.
] as const;

const autoPlayMargin = asSafeUint(1 + (time.showJudge + time.hideJudge) / 1000);

export const autoPlay = (
  counter: Counter,
): SynstateObservable<GameStateActionToWrite> =>
  merge([
    actionsToAutoPlayStream(counter, actionsToAutoPlay[0], 0),
    actionsToAutoPlayStream(
      counter,
      actionsToAutoPlay[1],
      SafeUint.add(autoPlayMargin, Arr.length(actionsToAutoPlay[0])),
    ),
    actionsToAutoPlayStream(
      counter,
      actionsToAutoPlay[2],
      asSafeUint(
        autoPlayMargin +
          actionsToAutoPlay[0].length +
          autoPlayMargin +
          actionsToAutoPlay[1].length,
      ),
    ),
    actionsToAutoPlayStream(
      counter,
      actionsToAutoPlay[3],
      asSafeUint(
        autoPlayMargin +
          actionsToAutoPlay[0].length +
          autoPlayMargin +
          actionsToAutoPlay[1].length +
          autoPlayMargin +
          actionsToAutoPlay[2].length,
      ),
    ),
  ] as const);

const actionsToAutoPlayStream = (
  counter: Counter,
  // The structural non-empty tuple rather than `NonEmptyArray`, which carries a
  // brand a `const` tuple literal cannot have. Both give `actions[0]` without
  // `| undefined`, which is all this needs.
  actions: NonEmptyTuple<GameStateActionToWrite>,
  numSkip: SafeUintWithSmallInt,
): SynstateObservable<GameStateActionToWrite> => {
  // Counting emissions with `scan` emits `actions[i]` on the i-th tick.
  // `skip` shifts the timer's own value, so the count has to be kept separately
  // rather than read off the tick.
  const ticks = counter(autoPlaySpeedRate * 1000);

  return (Num.isPositive(numSkip) ? ticks.pipe(skip(numSkip)) : ticks)
    .pipe(take(Arr.length(actions)))
    .pipe(scan((i: number) => i + 1, -1))
    .pipe(map((i) => actions[i] ?? actions[0]));
};

/** Counts up from 0 every `ms`. */
type Counter = (ms: number) => SynstateObservable<number>;
