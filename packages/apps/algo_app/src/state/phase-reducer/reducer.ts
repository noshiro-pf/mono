import type { TypeEq } from '@noshiro/ts-utils';
import { assertType, match } from '@noshiro/ts-utils';
import type { PhaseReducerArgs } from './action';
import type { PhaseInTurn } from './phase-in-turn';

export const phaseReducer = (stateAndAction: PhaseReducerArgs): PhaseInTurn => {
  switch (stateAndAction[0]) {
    case 'ph000_startOfTheTurn':
      assertType<TypeEq<typeof stateAndAction[1], 'ac000_startTurn'>>();
      return 'ph010_selectMyCardToToss';
    case 'ph010_selectMyCardToToss':
      assertType<
        TypeEq<typeof stateAndAction[1], 'ac010_decideMyCardToToss'>
      >();
      return 'ph030_firstAnswer';

    case 'ph030_firstAnswer':
      assertType<
        TypeEq<
          typeof stateAndAction[1],
          'ac030_submitFirstAnswerAndFail' | 'ac040_submitFirstAnswerAndSuccess'
        >
      >();
      return match(stateAndAction[1], {
        ac030_submitFirstAnswerAndFail: 'ph990_endOfTheTurn',
        ac040_submitFirstAnswerAndSuccess: 'ph040_continuousAnswer',
      });

    case 'ph040_continuousAnswer':
      assertType<
        TypeEq<
          typeof stateAndAction[1],
          | 'ac050_finishTurn'
          | 'ac060_submitSecondAnswerAndFail'
          | 'ac070_submitSecondAnswerAndSuccess'
        >
      >();
      return match(stateAndAction[1], {
        ac050_finishTurn: 'ph990_endOfTheTurn',
        ac060_submitSecondAnswerAndFail: 'ph990_endOfTheTurn',
        ac070_submitSecondAnswerAndSuccess: 'ph040_continuousAnswer',
      });

    case 'ph990_endOfTheTurn':
      assertType<TypeEq<typeof stateAndAction[1], 'ac000_startTurn'>>();
      return 'ph000_startOfTheTurn';
  }
};
