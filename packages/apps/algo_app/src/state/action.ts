/* eslint-disable @typescript-eslint/sort-type-union-intersection-members */
import type { TypeExtends } from '@noshiro/ts-utils';
import { assertType } from '@noshiro/ts-utils';
import type { Card } from '../types';

export type GameStateAction = Readonly<
  | { type: 'selectAttackCard'; card: Card }
  | { type: 'selectCardToAnswer'; card: Card }
  | { type: 'selectAnswer'; answer: Card }
  | { type: 'cancelAnswer' }
  | { type: 'submitAnswer' }
  | { type: 'showJudgeOnDecidedAnswer' }
  | { type: 'hideDecidedAnswerBalloon' }
  | { type: 'goToNextTurn' }
>;

assertType<TypeExtends<GameStateAction, Readonly<{ type: string }>>>();
