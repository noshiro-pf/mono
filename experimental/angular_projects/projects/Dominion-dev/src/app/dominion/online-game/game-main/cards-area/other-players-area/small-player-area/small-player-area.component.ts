import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { utils } from '../../../../../../mylib/utilities';
import { DCard } from '../../../../types/dcard';
import { PlayerData } from '../../../../types/players-data';
import { GameConfigService } from '../../../services/game-config.service';
import { GameStateService } from '../../../services/game-state-services/game-state.service';
import { MyGameRoomService } from '../../../services/my-game-room.service';

@Component({
  selector: 'app-small-player-area',
  templateUrl: './small-player-area.component.html',
  styleUrls: ['./small-player-area.component.css'],
})
export class SmallPlayerAreaComponent implements OnInit {
  @Output() cardClicked = new EventEmitter<DCard>();

  // TODO: RxJS -> RN
  width$ = this.config.cardSizeRatio$; // .pipe( map( ratio => ratio * 40 ) );
  // myIndex$ = this.gameRoomService.myIndex$;
  turnPlayerIndex$ = this.gameStateService.turnPlayerIndex$;

  @Input() playerName!: string;
  @Input() playerIndex!: number;
  @Input() thinkingState: boolean = false;

  playerCards: any;
  VPtoken$!: Observable<number>;
  vcoin$!: Observable<number>;
  debt$!: Observable<number>;

  constructor(
    private gameStateService: GameStateService,
    private gameRoomService: MyGameRoomService,
    private config: GameConfigService,
  ) {}

  ngOnInit() {
    const playerCards$ = this.gameStateService.allPlayersCards$.pipe(
      filter((e) => e.length > this.playerIndex),
      map((e) => e[this.playerIndex]),
    );

    this.playerCards = {
      Aside$: playerCards$.pipe(map((e) => e.Aside)),
      Deck$: playerCards$.pipe(map((e) => e.Deck)),
      HandCards$: playerCards$.pipe(map((e) => e.HandCards)),
      Open$: playerCards$.pipe(map((e) => e.Open)),
      PlayArea$: playerCards$.pipe(map((e) => e.PlayArea)),
      DiscardPileReveresed$: playerCards$.pipe(
        map((e) => utils.array.getReversed(e.DiscardPile)),
      ),
    };

    const playerData$: Observable<PlayerData> =
      this.gameStateService.allPlayersData$.pipe(
        map((e) => e[this.playerIndex]),
      );

    this.VPtoken$ = playerData$.pipe(map((e) => e.VPtoken));
    this.vcoin$ = playerData$.pipe(map((e) => e.vcoin));
    this.debt$ = playerData$.pipe(map((e) => e.debt));
  }

  onClick(dcard: DCard) {
    this.cardClicked.emit(dcard);
  }
}
