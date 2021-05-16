import type { TypeEq } from '@noshiro/ts-utils';
import { assertType } from '@noshiro/ts-utils';
import type { PhaseInTurn } from './phase-in-turn';

export type PhaseReducerAction =
  | 'ac000_startTurn'
  | 'ac010_decideMyCardToToss'
  | 'ac030_submitFirstAnswerAndFail'
  | 'ac040_submitFirstAnswerAndSuccess'
  | 'ac050_finishTurn'
  | 'ac060_submitSecondAnswerAndFail'
  | 'ac070_submitSecondAnswerAndSuccess';

export type PhaseReducerArgs =
  | ['ph000_startOfTheTurn', 'ac000_startTurn']
  | ['ph010_selectMyCardToToss', 'ac010_decideMyCardToToss']
  | ['ph030_firstAnswer', 'ac030_submitFirstAnswerAndFail']
  | ['ph030_firstAnswer', 'ac040_submitFirstAnswerAndSuccess']
  | ['ph040_continuousAnswer', 'ac050_finishTurn']
  | ['ph040_continuousAnswer', 'ac060_submitSecondAnswerAndFail']
  | ['ph040_continuousAnswer', 'ac070_submitSecondAnswerAndSuccess']
  | ['ph990_endOfTheTurn', 'ac000_startTurn'];

assertType<TypeEq<PhaseReducerArgs[0], PhaseInTurn>>();
assertType<TypeEq<PhaseReducerArgs[1], PhaseReducerAction>>();
