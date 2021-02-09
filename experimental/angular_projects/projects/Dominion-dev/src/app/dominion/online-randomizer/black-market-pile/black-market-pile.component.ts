import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material';

import { Observable } from 'rxjs';

import { ConfirmDialogComponent } from '../../../mylib/confirm-dialog.component';

import { utils } from '../../../mylib/utilities';
import { FireDatabaseService } from '../../../database/database.service';
import { MyRandomizerGroupService } from '../my-randomizer-group.service';

import { CardProperty        } from '../../types/card-property';
import { BlackMarketPileCard } from '../../types/black-market-pile-card';
import { BlackMarketPhase as BMPhase, BlackMarketPhase } from '../types/black-market-phase.enum';
import { startWith, map } from 'rxjs/operators';


@Component({
  selector: 'app-black-market-pile',
  templateUrl: './black-market-pile.component.html',
  styleUrls: ['./black-market-pile.component.css']
})
export class BlackMarketPileComponent implements OnInit {

  PHASE = BMPhase;  // used in the template

  private faceUp = false;
  @Input() longSideLength = 180;

  cardPropertyList$ = this.database.cardPropertyList$;

    // TODO: RxJS -> RN
  // BlackMarketPileShuffled$: Observable<BlackMarketPileCard[]>
  //   = this.myRandomizerGroup.BlackMarketPileShuffled$;

  // currentPhase$: Observable<BlackMarketPhase>
  //   = this.myRandomizerGroup.BlackMarketPhase$.pipe( startWith( BMPhase.init ) );

  // putOnTheBottomDone$: Observable<boolean>
  //   = this.BlackMarketPileShuffled$.pipe( map(
  //       pile => {
  //         const numberOfFaceDownCards = pile.filter( e => !e.faceUp ).length;
  //         const firstIndexOfFaceUpCard = pile.findIndex( e => e.faceUp );
  //         return numberOfFaceDownCards === firstIndexOfFaceUpCard;
  //       }) );


  private promiseResolver: { [key: string]: any } = {};


  constructor(
    public dialog: MatDialog,
    private database: FireDatabaseService,
    private myRandomizerGroup: MyRandomizerGroupService
  ) {
  }

  ngOnInit() {
  }


  /* 闇市場のデッキの上から3枚のカードを公開する。あなたは公開したカードのうち1枚を即座に購入してもよい。購入しなかったカードは、好きな順番で闇市場のデッキの下に置く。
   * 「騎士」を使用する場合は、ランダマイザーカードではなく、「騎士」10枚のうちどれか1枚を入れる。
   * ※「闇市場」の効果による購入でカード1枚を獲得したときに、リアクションとして「交易人」を手札から公開した場合、そのカード1枚は獲得されず、闇市場デッキの一番上に戻す。
   */

  onClick( operation: string, value: number, isButton: boolean ) {
    if ( !isButton ) return;
    switch ( operation ) {  // check operation string
      case 'buy' :
      case 'putOnTheBottom' :
        this.promiseResolver[operation]( value );
        break;
      default :
        console.error( `'promiseResolver' does not have operation '${operation}'.` );
        break;
    }
  }


  async revealTop3Cards(
    cardPropertyList: CardProperty[],
    BlackMarketPileShuffled: BlackMarketPileCard[]
  ) {
    { // 上から3枚をめくる
      this.myRandomizerGroup.setBlackMarketPhase( BMPhase.init );
      BlackMarketPileShuffled.forEach( (e, i) => e.faceUp = (i < 3) );
      this.myRandomizerGroup.setBMPileShuffled( BlackMarketPileShuffled );
    }
    { // 3枚のうち1枚を購入するか，1枚も購入しない
      this.myRandomizerGroup.setBlackMarketPhase( BMPhase.buy );

      while (true) {
        const clickedElementValue
          = await new Promise<number>( resolve => (this.promiseResolver as any)['buy'] = resolve );

        if ( clickedElementValue === -1 ) break;  // don't buy

        if ( 0 <= clickedElementValue && clickedElementValue < 3 ) {  // buy a card
          const cardIndex = BlackMarketPileShuffled[ clickedElementValue ].cardIndex;
          const dialogRef = this.dialog.open( ConfirmDialogComponent );
          dialogRef.componentInstance.message = `「${cardPropertyList[cardIndex].nameJp}」を購入しますか？`;
          const yn = await dialogRef.afterClosed().toPromise();
          if ( yn === 'yes' ) {
            utils.array.removeAt( BlackMarketPileShuffled, clickedElementValue );
            this.myRandomizerGroup.setBMPileShuffled( BlackMarketPileShuffled );
            break;
          }
        }
      }
    }

    { // 残りは好きな順に闇市場デッキの下に置く
      this.myRandomizerGroup.setBlackMarketPhase( BMPhase.putOnTheBottom );

      while (true) {
        const clickedElementValue
          = await new Promise<number>( resolve =>
              this.promiseResolver['putOnTheBottom'] = resolve );
        if ( clickedElementValue === -1 ) break;

        const selectedElement = utils.array.removeAt( BlackMarketPileShuffled, clickedElementValue );
        if ( !!selectedElement ) BlackMarketPileShuffled.push( selectedElement );
        this.myRandomizerGroup.setBMPileShuffled( BlackMarketPileShuffled );
      }
    }

    // 確認
    BlackMarketPileShuffled.forEach( e => e.faceUp = false );  // reset
    this.myRandomizerGroup.setBMPileShuffled( BlackMarketPileShuffled );

    this.myRandomizerGroup.setBlackMarketPhase( BMPhase.init );
  }
}
