export type PhaseInTurn =
  | 'ph000_startOfTheTurn'
  | 'ph010_selectMyCardToToss'
  | 'ph030_firstAnswer'
  | 'ph040_continuousAnswer'
  | 'ph990_endOfTheTurn';
