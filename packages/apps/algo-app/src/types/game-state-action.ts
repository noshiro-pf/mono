import * as t from '@noshiro/io-ts';
import { cardTypeDef } from './card-type';
import { firestoreTimestampTypeDef } from './firestore-timestamp-type';

const gameStateActionTypeDef = t.union({
  typeName: 'GameStateAction',
  types: [
    t.record({
      timestamp: firestoreTimestampTypeDef,
      type: t.stringLiteral('selectMyCard'),
      card: cardTypeDef,
    }),
    t.record({
      timestamp: firestoreTimestampTypeDef,
      type: t.stringLiteral('cancelToss'),
    }),
    t.record({
      timestamp: firestoreTimestampTypeDef,
      type: t.stringLiteral('submitToss'),
    }),
    t.record({
      timestamp: firestoreTimestampTypeDef,
      type: t.stringLiteral('selectOpponentCard'),
      card: cardTypeDef,
    }),
    t.record({
      timestamp: firestoreTimestampTypeDef,
      type: t.stringLiteral('selectAnswer'),
      answer: cardTypeDef,
    }),
    t.record({
      timestamp: firestoreTimestampTypeDef,
      type: t.stringLiteral('cancelAnswer'),
    }),
    t.record({
      timestamp: firestoreTimestampTypeDef,
      type: t.stringLiteral('submitAnswer'),
    }),
    t.record({
      timestamp: firestoreTimestampTypeDef,
      type: t.stringLiteral('showJudgeOnDecidedAnswer'),
    }),
    t.record({
      timestamp: firestoreTimestampTypeDef,
      type: t.stringLiteral('hideDecidedAnswerBalloon'),
    }),
    t.record({
      timestamp: firestoreTimestampTypeDef,
      type: t.stringLiteral('goToNextTurn'),
    }),
  ],
  defaultType: t.record({
    timestamp: firestoreTimestampTypeDef,
    type: t.stringLiteral('selectMyCard'),
    card: cardTypeDef,
  }),
});

export type GameStateAction = t.TypeOf<typeof gameStateActionTypeDef>;

export const assertIsGameStateAction: (
  a: unknown
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
