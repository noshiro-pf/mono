import { CardProperty } from '../types/card-property';

export const toListIndex = ( cardPropertyList: CardProperty[], cardId: string ) =>
  cardPropertyList.findIndex( e => e.cardId === cardId );
