export type Phase =
  | ''
  | 'StartOfTurn'
  | 'Action'
  | '<Action>'
  | 'BuyPlay'
  | '<BuyPlay>'
  | 'BuyCard'
  | 'Night'
  | '<Night>'
  | 'CleanUp'
  | 'EndOfTurn'
  | 'GameIsOver';
