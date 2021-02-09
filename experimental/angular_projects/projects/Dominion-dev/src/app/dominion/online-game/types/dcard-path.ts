import { BasicCardsDirectory } from './basic-cards-directory';
import { PlayerCardDirectory } from './player-card-directory';

export type DCardPath =
  | number
  | PlayerCardDirectory
  | BasicCardsDirectory
  | 'allPlayersCards'
  | 'BasicCards'
  | 'KingdomCards'
  | 'trashPile'
  | 'BlackMarketPile';
