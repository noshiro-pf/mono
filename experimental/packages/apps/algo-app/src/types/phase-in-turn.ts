import * as t from '@noshiro/io-ts';

export const phaseInTurnTypeDef = t.enumType(
  ['ph010_selectMyCardToToss', 'ph020_firstAnswer', 'ph030_continuousAnswer'],
  {
    defaultValue: 'ph010_selectMyCardToToss',
    typeName: 'PhaseInTurn',
  },
);

export type PhaseInTurn = t.TypeOf<typeof phaseInTurnTypeDef>;
