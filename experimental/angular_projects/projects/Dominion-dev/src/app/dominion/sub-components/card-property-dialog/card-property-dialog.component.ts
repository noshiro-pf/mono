import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

import { RN, combine, manual, merge } from 'rnjs';

import { CardProperty } from '../../types/card-property';
import { FireDatabaseService } from '../../../database/database.service';
import { utils } from '../../../mylib/utilities';
import { cardPropertyToStr } from '../../functions/transform-card-property';


@Component({
  selector: 'app-card-property-dialog',
  templateUrl: './card-property-dialog.component.html',
  styleUrls: [
    '../../../mylib/data-table/data-table.component.css',
    './card-property-dialog.component.css'
  ]
})
export class CardPropertyDialogComponent implements OnInit {

  private indiceInCardList$ = manual<number[]>([]);
  set indiceInCardList( value: number[] ) {
    if ( !value ) return;
    this.indiceInCardList$.emit( value );
  }

  // option（Dialogを開いたまま次のカード情報を見る）
  private showingIndexInput$ = manual<number>(1);
  set showingIndexInit( value: number ) { // input (option)
    if ( value === undefined ) return;
    this.showingIndexInput$.emit( value );
  }

  private showingIndexIncrementSource = manual<void>( null );
  private showingIndexDecrementSource = manual<void>( null );


  showingIndex$!: RN<number>;


  private cardPropertyList$ = this.database.cardPropertyList$;

  card$!: RN<CardProperty>;
  cardForView$!: RN<object>;

  items = [
    { memberName: 'nameJp'       , name: '和名' },
    { memberName: 'nameJpYomi'   , name: '読み' },
    { memberName: 'nameEng'      , name: '英名' },
    { memberName: 'expansionName', name: 'セット' },
    { memberName: 'cost_coin'    , name: 'コスト（コイン）' },
    { memberName: 'cost_potion'  , name: 'コスト（ポーション）' },
    { memberName: 'cost_debt'    , name: 'コスト（借金）' },
    { memberName: 'category'     , name: '種類' },
    { memberName: 'cardTypesStr' , name: '属性' },
    { memberName: 'VP'           , name: 'VP' },
    { memberName: 'drawCard'     , name: '+Draw Cards' },
    { memberName: 'action'       , name: '+Action' },
    { memberName: 'buy'          , name: '+Buy' },
    { memberName: 'coin'         , name: '+Coin' },
    { memberName: 'VPtoken'      , name: '+VP-token' },
    { memberName: 'implemented'  , name: 'オンラインゲーム実装状況' },
  ];


  constructor(
    public dialogRef: MatDialogRef<CardPropertyDialogComponent>,
    private database: FireDatabaseService,
  ) {
  }

  ngOnInit() {
    const showingIndexIncrement$: RN<string>
      = this.showingIndexIncrementSource.mapTo('increment');

    const showingIndexDecrement$: RN<string>
      = this.showingIndexDecrementSource.mapTo('decrement');


    const showingIndexIncrAcc$: RN<number>
      = merge(
          merge(
            showingIndexIncrement$,
            showingIndexDecrement$,
          ).scan( 0, (acc: number, value: 'increment'|'decrement') => {
            switch (value) {
              case 'increment': return acc + 1;
              case 'decrement': return acc - 1;
              default: throw new Error('value must be "increment" or "decrement"');
            }
          }),
          this.showingIndexInput$.mapTo(0),
        );

    this.showingIndex$
      = combine( this.showingIndexInput$, showingIndexIncrAcc$ )
        .map( ([input, acc]) => input + acc );

    this.card$ = combine(
          this.showingIndex$,
          this.indiceInCardList$,
          this.cardPropertyList$ )
        .map(
          ([showingIndex, indiceInCardList, cardPropertyList]) =>
            ( indiceInCardList.length === 0 ||
              !utils.array.isInArrayRange( showingIndex, indiceInCardList )
                ? new CardProperty()
                : cardPropertyList[ indiceInCardList[ showingIndex ] ] ) );

    this.cardForView$ = this.card$.map( cardPropertyToStr );
  }


  goToNextCard() {
    this.showingIndexIncrementSource.emit();
  }

  goToPreviousCard() {
    this.showingIndexDecrementSource.emit();
  }

  cardListLinkPath( linkId: number ) {
    return `http://suka.s5.xrea.com/dom/list.cgi?mode=show&id=${linkId}`;
  }

  /**
   * innerHeight, innerWidth : app window size
   * outerHeight, outerWidth : browser window size
   */
}
