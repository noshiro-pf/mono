import { Timestamp, type FieldValue } from 'firebase/firestore';
import { expectType, tp } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { StrictOmit } from 'ts-type-forge';
import { cardColorTypeDef } from './card-color.mjs';
import { cardNumberTypeDef } from './card-number.mjs';
import { cardTypeDef, type CardWithVisibility } from './card-type.mjs';
import {
  firestoreTimestampTypeDef,
  type FirestoreTimestamp,
} from './firestore-timestamp-type.mjs';
import type { GameState } from './game-state.mjs';

const cardWithVisibilityTypeDef = t.record({
  color: cardColorTypeDef,
  number: cardNumberTypeDef,
  visibleTo: t.enumType(['self', 'everyone', 'pair'], { defaultValue: 'self' }),
});

const sixCardsTypeDef = t.tuple(
  tp(
    cardWithVisibilityTypeDef,
    cardWithVisibilityTypeDef,
    cardWithVisibilityTypeDef,
    cardWithVisibilityTypeDef,
    cardWithVisibilityTypeDef,
    cardWithVisibilityTypeDef,
  ),
);

// Firestore cannot store an array of arrays, so the four hands are written as
// an object, as `RoomRemote['playerCards']` is.
const playerCardsRemoteTypeDef = t.record({
  p0: sixCardsTypeDef,
  p1: sixCardsTypeDef,
  p2: sixCardsTypeDef,
  p3: sixCardsTypeDef,
});

export type PlayerCardsRemote = t.TypeOf<typeof playerCardsRemoteTypeDef>;

expectType<PlayerCardsRemote['p0'][number], CardWithVisibility>('=');

export const toPlayerCardsRemote = (
  playerCards: GameState['playerCards'],
): PlayerCardsRemote =>
  ({
    p0: playerCards[0],
    p1: playerCards[1],
    p2: playerCards[2],
    p3: playerCards[3],
  }) as const;

export const fromPlayerCardsRemote = (
  remote: PlayerCardsRemote,
): GameState['playerCards'] => tp(remote.p0, remote.p1, remote.p2, remote.p3);

const gameStateActionTypeDef = t.union(
  [
    t.record({
      timestamp: firestoreTimestampTypeDef,
      type: t.literal('initializePlayerCards'),
      cards: playerCardsRemoteTypeDef,
    }),
    t.record({
      timestamp: firestoreTimestampTypeDef,
      type: t.literal('selectMyCard'),
      card: cardTypeDef,
    }),
    t.record({
      timestamp: firestoreTimestampTypeDef,
      type: t.literal('cancelToss'),
    }),
    t.record({
      timestamp: firestoreTimestampTypeDef,
      type: t.literal('submitToss'),
    }),
    t.record({
      timestamp: firestoreTimestampTypeDef,
      type: t.literal('selectOpponentCard'),
      card: cardTypeDef,
    }),
    t.record({
      timestamp: firestoreTimestampTypeDef,
      type: t.literal('selectAnswer'),
      answer: cardTypeDef,
    }),
    t.record({
      timestamp: firestoreTimestampTypeDef,
      type: t.literal('cancelAnswer'),
    }),
    t.record({
      timestamp: firestoreTimestampTypeDef,
      type: t.literal('submitAnswer'),
    }),
    t.record({
      timestamp: firestoreTimestampTypeDef,
      type: t.literal('showJudgeOnDecidedAnswer'),
    }),
    t.record({
      timestamp: firestoreTimestampTypeDef,
      type: t.literal('hideDecidedAnswerBalloon'),
    }),
    t.record({
      timestamp: firestoreTimestampTypeDef,
      type: t.literal('goToNextTurn'),
    }),
  ],
  {
    typeName: 'GameStateAction',
    defaultType: t.record({
      timestamp: firestoreTimestampTypeDef,
      type: t.literal('selectMyCard'),
      card: cardTypeDef,
    }),
  },
);

/**
 * An action, written or read back: its `timestamp` is any of the shapes
 * `FirestoreTimestamp` names.
 */
export type GameStateAction = t.TypeOf<typeof gameStateActionTypeDef>;

/**
 * An action as it is written: its `timestamp` is `serverTimestamp()`, which
 * Firestore fills in, so that the order the actions are read back in is the
 * server's.
 */
export type GameStateActionToWrite = WithTimestamp<GameStateAction, FieldValue>;

/**
 * An action as `d.data()` reads it back: its `timestamp` is a `Timestamp` once
 * the write is committed, or `null` while the server timestamp is pending.
 */
export type GameStateActionFromDb = WithTimestamp<
  GameStateAction,
  Timestamp | null
>;

export const assertIsGameStateAction: (
  a: unknown,
) => asserts a is GameStateAction = gameStateActionTypeDef.assertIs;

export const assertIsGameStateActionFromDb: (
  a: unknown,
) => asserts a is GameStateActionFromDb = (a) => {
  assertIsGameStateAction(a);

  if (a.timestamp !== null && !(a.timestamp instanceof Timestamp)) {
    // What is left is a `FieldValue`, which is only ever written.
    throw new TypeError(
      'An action read back has a FieldValue timestamp, not a Timestamp or null.',
    );
  }
};

expectType<GameStateAction, Readonly<{ type: string }>>('<=');

expectType<GameStateAction['timestamp'], FirestoreTimestamp>('=');

expectType<GameStateActionToWrite['timestamp'], FieldValue>('=');

expectType<GameStateActionToWrite['type'], GameStateAction['type']>('=');

expectType<GameStateActionToWrite, GameStateAction>('<=');

expectType<GameStateActionFromDb['timestamp'], Timestamp | null>('=');

expectType<GameStateActionFromDb, GameStateAction>('<=');

expectType<
  GameStateAction['type'],
  | 'cancelAnswer'
  | 'cancelToss'
  | 'goToNextTurn'
  | 'hideDecidedAnswerBalloon'
  | 'initializePlayerCards'
  | 'selectAnswer'
  | 'selectMyCard'
  | 'selectOpponentCard'
  | 'showJudgeOnDecidedAnswer'
  | 'submitAnswer'
  | 'submitToss'
>('=');

/** Each member of the union `A`, with its `timestamp` narrowed to `T`. */
type WithTimestamp<
  A extends Readonly<{ timestamp: unknown }>,
  T,
> = A extends unknown
  ? Readonly<StrictOmit<A, 'timestamp'> & { timestamp: T }>
  : never;
