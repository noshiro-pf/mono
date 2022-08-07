import * as t from '@noshiro/io-ts';
import { cardTypeDef } from './card-type';
import { firestoreTimestampTypeDef } from './firestore-timestamp-type';
import { playerCardsTypeDef } from './game-state';

const gameStateActionTypeDef = t.union(
  [
    t.record({
      timestamp: firestoreTimestampTypeDef,
      type: t.stringLiteral('initializePlayerCards'),
      cards: playerCardsTypeDef,
    }),
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
  {
    defaultType: t.record({
      timestamp: firestoreTimestampTypeDef,
      type: t.stringLiteral('initializePlayerCards'),
      cards: playerCardsTypeDef,
    }),
  },
);

export type GameStateAction = t.TypeOf<typeof gameStateActionTypeDef>;

const gameStateActionArrayTypeDef = t.array(gameStateActionTypeDef);

export const validateGameStateActionArray =
  gameStateActionArrayTypeDef.validate;

export const keyForOrderingGameActions = 'timestamp';

expectType<typeof keyForOrderingGameActions, keyof GameStateAction>('<=');

expectType<GameStateAction, Readonly<{ type: string }>>('<=');

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
