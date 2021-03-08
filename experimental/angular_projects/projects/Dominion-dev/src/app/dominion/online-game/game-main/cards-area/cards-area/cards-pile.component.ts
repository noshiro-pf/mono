import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { DCard } from '../../../types/dcard';

@Component({
  selector: 'app-cards-pile',
  template: `
    <app-cards-area
      displayStyle="pile"
      [showArraySize]="showArraySize"
      [showCardProperty]="showCardProperty"
      [hideNonButtonCards]="hideNonButtonCards"
      [myIndex$]="myIndex$"
      [DCardArray$]="DCardArray$"
      [cardWidth$]="width$"
      [defaultArrayLength]="1"
      [padding]="0"
      (cardClicked)="onClicked($event)"
    >
    </app-cards-area>
  `,
  styles: [],
})
export class CardsPileComponent implements OnInit {
  @Input() showArraySize: boolean = true;
  @Input() showCardProperty: boolean = false;
  @Input() hideNonButtonCards: boolean = false;

  @Input() myIndex$!: Observable<number>;
  @Input() DCardArray$!: Observable<DCard[]>;
  @Input() width$!: Observable<number>;

  @Output() cardClicked = new EventEmitter<DCard>();

  constructor() {}

  ngOnInit() {}

  onClicked(topCard: DCard) {
    this.cardClicked.emit(topCard);
  }
}
