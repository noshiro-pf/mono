import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';


import { utils } from '../../../../../mylib/utilities';
import { MyGameRoomService } from '../../services/my-game-room.service';
import { GameStateService } from '../../services/game-state-services/game-state.service';
import { GameConfigService } from '../../services/game-config.service';
import { DCard } from '../../../types/dcard';
import { PlayerCards } from '../../../types/player-cards';
import { map, distinctUntilChanged } from 'rxjs/operators';


@Component({
  selector: 'app-my-card-area',
  templateUrl: './my-card-area.component.html',
  styleUrls: ['./my-card-area.component.css']
})
export class MyCardAreaComponent implements OnInit {

  @Input() showCardProperty$!: Observable<boolean>;
  @Input() buttonizeVCoins: boolean = false;
  @Input() buttonizeDebts:  boolean = false;
  @Output() cardClicked = new EventEmitter<DCard>();
  @Output() vcoinClicked = new EventEmitter<void>();
  @Output() debtClicked = new EventEmitter<void>();

  // TODO: RxJS -> RN
  width$    = this.config.cardSizeRatio$; // .pipe( map( ratio => ratio * 70 ) );
  // myIndex$  = this.gameRoomService.myIndex$;
  isMyTurn$ = this.gameStateService.isMyTurn$;
  VPtoken$  = this.gameStateService.myData$.pipe(
                  map( e => e.VPtoken ),
                  distinctUntilChanged() );
  vcoin$    = this.gameStateService.myData$.pipe(
                  map( e => e.vcoin   ),
                  distinctUntilChanged() );
  debt$     = this.gameStateService.myData$.pipe(
                  map( e => e.debt    ),
                  distinctUntilChanged() );

  private myCards$: Observable<PlayerCards>
    = this.gameStateService.myCards$;

  myCards = {
    Aside$     : this.myCards$.pipe( map( e => e.Aside     ) ),
    Deck$      : this.myCards$.pipe( map( e => e.Deck      ) ),
    HandCards$ : this.myCards$.pipe( map( e => e.HandCards ) ),
    Open$      : this.myCards$.pipe( map( e => e.Open      ) ),
    PlayArea$  : this.myCards$.pipe( map( e => e.PlayArea  ) ),
    DiscardPileReveresed$ : this.myCards$.pipe( map( e => utils.array.getReversed( e.DiscardPile ) ) ),
  };



  constructor(
    private gameStateService: GameStateService,
    private gameRoomService: MyGameRoomService,
    private config: GameConfigService,
  ) {
  }

  ngOnInit() {
  }

  onClick( dcard: DCard ) {
    this.cardClicked.emit( dcard );
  }

  vcoinClick() {
    this.vcoinClicked.emit();
  }

  debtClick() {
    this.debtClicked.emit();
  }
}
