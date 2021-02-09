import { CardProperty } from '../../types/card-property';

export const pileSize = (
  cardPropertyList: CardProperty[],
  cardIndex: number,
  numberOfPlayer: number,
  DarkAges: boolean
): number => {
  switch ( cardPropertyList[cardIndex].cardId ) {
    case 'Copper'  : return 60;
    case 'Silver'  : return 40;
    case 'Gold'    : return 30;
    case 'Platinum': return 12;
    case 'Potion'  : return 16;
    case 'Curse'   : return ( numberOfPlayer - 1 ) * 10;
    default : break;
  }
  if ( cardPropertyList[cardIndex].cardId === 'Estate' ) {
    if ( DarkAges ) return ( numberOfPlayer > 2 ? 12 : 8 );
    return numberOfPlayer * 3 + ( numberOfPlayer > 2 ? 12 : 8 );
  }
  if ( cardPropertyList[cardIndex].cardTypes.includes('Victory') ) {
    return ( numberOfPlayer > 2 ? 12 : 8 );
  }
  if ( cardPropertyList[cardIndex].cardTypes.includes('Prize') ) return 1;
  return 10; /* KingdomCard default */
};
