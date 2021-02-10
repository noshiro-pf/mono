import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Observable, of } from 'rxjs';

import { CardPropertyDialogComponent } from '../../../../../sub-components/card-property-dialog/card-property-dialog.component';
import { DCard } from '../../../../types/dcard';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-cards-area',
  templateUrl: './cards-area.component.html',
  styleUrls: ['./cards-area.component.css']
})
export class CardsAreaComponent implements OnInit {

  @Input() displayStyle!: 'lineUp'|'pile';
  @Input() showCardProperty:   boolean = false;
  @Input() showArraySize:      boolean = false;
  @Input() hideNonButtonCards: boolean = false;

  @Input() myIndex$!:    Observable<number>;
  @Input() DCardArray$!: Observable<DCard[]>;
  @Input() cardWidth$!:  Observable<number>;

  @Output() cardClicked = new EventEmitter<DCard>();

  DCardArrayForView$!: Observable<DCard[]>;

  // pile
  DCard$!: Observable<DCard>;

  // lineUp
  @Input() defaultArrayLength: number = 1;
  @Input() padding!: number;
  boxMinWidth$!: Observable<number>;


  constructor(
    private dialog: MatDialog
  ) { }


  ngOnInit() {
    if ( this.displayStyle === 'lineUp' ) {
      this.DCardArrayForView$ = this.DCardArray$;
      this.showArraySize = false;
      this.boxMinWidth$
        = this.cardWidth$.pipe( map( width =>
            (width + this.padding) * this.defaultArrayLength ) );
    } else {
      this.DCardArrayForView$ = this.DCardArray$.pipe( map( ar => ar.slice( 0, 1 ) ) );
      this.boxMinWidth$ = this.cardWidth$;
    }
  }

  onClicked( dcard: DCard ) {
    this.cardClicked.emit( dcard );
  }


  openCardPropertyDialog( dcard: DCard ) {
    const dialogRef = this.dialog.open( CardPropertyDialogComponent );
    // TODO: RxJS -> RN
    // dialogRef.componentInstance.indiceInCardList$
    //   = of( [dcard.cardProperty.indexInList] );
  }
}
