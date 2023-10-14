import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { utils } from '../../../../../mylib/utilities';
import { DCard } from '../../../types/dcard';
import { PlayerCards } from '../../../types/player-cards';
import { GameConfigService } from '../../services/game-config.service';
import { GameStateService } from '../../services/game-state-services/game-state.service';
import { MyGameRoomService } from '../../services/my-game-room.service';

@Component({
  selector: 'app-turn-player-area',
  templateUrl: './turn-player-area.component.html',
  styleUrls: ['./turn-player-area.component.css'],
})
export class TurnPlayerAreaComponent implements OnInit {
  @Output() cardClicked = new EventEmitter<DCard>();

  // TODO: RxJS -> RN
  width$ = this.config.cardSizeRatio$; // .pipe( map( ratio => ratio * 50 ) );
  // myIndex$ = this.gameRoomService.myIndex$;

  private turnPlayerCards$: Observable<PlayerCards> =
    this.gameStateService.turnPlayerCards$;

  turnPlayerCards = {
    Aside$: this.turnPlayerCards$.pipe(map((e) => e.Aside)),
    Deck$: this.turnPlayerCards$.pipe(map((e) => e.Deck)),
    HandCards$: this.turnPlayerCards$.pipe(map((e) => e.HandCards)),
    Open$: this.turnPlayerCards$.pipe(map((e) => e.Open)),
    PlayArea$: this.turnPlayerCards$.pipe(map((e) => e.PlayArea)),
    DiscardPileReveresed$: this.turnPlayerCards$.pipe(
      map((e) => utils.array.getReversed(e.DiscardPile)),
    ),
  };

  turnPlayersName$ = this.gameStateService.turnPlayersName$;

  constructor(
    private gameStateService: GameStateService,
    private gameRoomService: MyGameRoomService,
    private config: GameConfigService,
  ) {}

  ngOnInit() {}

  onClick(dcard: DCard) {
    this.cardClicked.emit(dcard);
  }
}
