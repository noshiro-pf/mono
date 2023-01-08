import { FieldValue } from 'firebase/firestore';
import type { Card } from './card-type';
import { isCard } from './card-type';

export type GameStateAction = Readonly<
  // eslint-disable-next-line @typescript-eslint/sort-type-union-intersection-members
  | { timestamp: FieldValue; type: 'selectMyCard'; card: Card }
  | { timestamp: FieldValue; type: 'cancelToss' }
  | { timestamp: FieldValue; type: 'submitToss' }
  | { timestamp: FieldValue; type: 'selectOpponentCard'; card: Card }
  | { timestamp: FieldValue; type: 'selectAnswer'; answer: Card }
  | { timestamp: FieldValue; type: 'cancelAnswer' }
  | { timestamp: FieldValue; type: 'submitAnswer' }
  | { timestamp: FieldValue; type: 'showJudgeOnDecidedAnswer' }
  | { timestamp: FieldValue; type: 'hideDecidedAnswerBalloon' }
  | { timestamp: FieldValue; type: 'goToNextTurn' }
>;

const actionTypes = [
  'selectMyCard',
  'cancelToss',
  'submitToss',
  'selectOpponentCard',
  'selectAnswer',
  'cancelAnswer',
  'submitAnswer',
  'showJudgeOnDecidedAnswer',
  'hideDecidedAnswerBalloon',
  'goToNextTurn',
] as const;

assertType<TypeEq<typeof actionTypes[number], GameStateAction['type']>>();

const isActionType = (data: unknown): data is GameStateAction['type'] =>
  Arr.includes(actionTypes, data);

const isFieldValue = (data: unknown): data is FieldValue =>
  data instanceof FieldValue;

export const assertIsGameStateAction: (
  data: unknown
) => asserts data is GameStateAction = (data) => {
  if (!isRecord(data)) {
    throw new Error('data is not a Record');
  }
  if (
    !(
      Obj.hasKeyValue(data, 'type', isActionType) &&
      Obj.hasKeyValue(data, 'timestamp', isFieldValue)
    )
  ) {
    throw new Error('hasKeyValue failed');
  }

  assertType<
    TypeExtends<typeof data, Pick<GameStateAction, 'timestamp' | 'type'>>
  >();
  assertType<
    TypeExtends<Pick<GameStateAction, 'timestamp' | 'type'>, typeof data>
  >();

  switch (data.type) {
    case 'selectMyCard':
    case 'selectOpponentCard':
      if (!Obj.hasKeyValue(data, 'card', isCard)) {
        throw new Error('hasKeyValue failed');
      }
      break;

    case 'selectAnswer':
      if (!Obj.hasKeyValue(data, 'answer', isCard)) {
        throw new Error('hasKeyValue failed');
      }
      break;

    case 'cancelToss':
    case 'submitToss':
    case 'cancelAnswer':
    case 'submitAnswer':
    case 'showJudgeOnDecidedAnswer':
    case 'hideDecidedAnswerBalloon':
    case 'goToNextTurn':
      break;
  }
};

assertType<TypeExtends<GameStateAction, Readonly<{ type: string }>>>();
