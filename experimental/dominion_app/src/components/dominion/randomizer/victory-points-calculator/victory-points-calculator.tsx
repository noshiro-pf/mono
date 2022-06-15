import { memo } from 'react'
// import * as I from "immutable"
// import { TNumVictoryCards } from 'projects/dominion-dev/src/types/dominion/number-of-victory-cards';
// import { TDCardProperty } from 'projects/dominion-dev/src/types/dominion/dcard-property';
// import { TSelectedCards, SelectedCards } from 'projects/dominion-dev/src/types/dominion/selected-cards';
// import { useStateAsStream, useEffectFromProps } from 'projects/dominion-dev/src/mylib/react/RN-hooks';
// import { combine } from 'projects/dominion-dev/src/mylib/rnjs';
// import { dcardlist$ } from 'projects/dominion-dev/src/firebase-worker';

// prettier-ignore
export const VictoryPointsCalculator = memo(({
  playerName
}: Readonly<{
  playerName: string
}>) => {

  /* from props */
  // const [selectedCards$, setSelectedCards] = useStateAsStream(SelectedCards())
  // useEffectFromProps(selectedCardsInput, setSelectedCards)

  /* streams */

  // const VictoryCardsFiltered$ = useMemo(() =>
  //  combine(selectedCards$, dcardlist$)
  //     .map( ([selectedCards, dcardlist]) => {
  //       const selectedCardsAll = concatAllCards(selectedCards);
  //       const isInSupply = (cardId: string) =>
  //         selectedCardsAll.map( e => dcardlist.get([e].cardId ).includes( cardId );

  //       return VictoryCards.filter( e => { switch ( e.displayWhen ) {
  //         case 'always'             : return true;
  //         case 'isInSupply'         : return isInSupply( e.id );
  //         case 'Prosperity'         : return selectedCards.Prosperity;
  //         case 'DarkAges'           : return selectedCards.DarkAges;
  //         case 'KnightsIsInSupply'  : return isInSupply( 'Knights' );
  //         case 'CastlesIsInSupply'  : return isInSupply( 'Castles' );
  //         case 'ShepherdIsInSupply' : return isInSupply( 'Shepherd' );
  //         default                   : return true;
  //       } });
  //     });
  //     ,[])


  return (
    <div>{playerName}</div>
  )
})

VictoryPointsCalculator.displayName = 'VictoryPointsCalculator'
