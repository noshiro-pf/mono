import { expectType } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { cardTypeDef } from './card-type.mjs';
import { firestoreTimestampTypeDef } from './firestore-timestamp-type.mjs';

const gameStateActionTypeDef = t.union(
  [
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

export type GameStateAction = t.TypeOf<typeof gameStateActionTypeDef>;

export const assertIsGameStateAction: (
  a: unknown,
) => asserts a is GameStateAction = gameStateActionTypeDef.assertIs;

expectType<GameStateAction, Readonly<{ type: string }>>('<=');

expectType<
  GameStateAction['type'],
  | 'cancelAnswer'
  | 'cancelToss'
  | 'goToNextTurn'
  | 'hideDecidedAnswerBalloon'
  | 'selectAnswer'
  | 'selectMyCard'
  | 'selectOpponentCard'
  | 'showJudgeOnDecidedAnswer'
  | 'submitAnswer'
  | 'submitToss'
>('=');
