import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';

import { utils } from '../../../../../mylib/utilities';
import { MyGameRoomService } from '../../services/my-game-room.service';
import { GameStateService  } from '../../services/game-state-services/game-state.service';
import { GameConfigService } from '../../services/game-config.service';
import { DCard } from '../../../types/dcard';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-shared-area',
  templateUrl: './shared-area.component.html',
  styleUrls: ['./shared-area.component.css'],
})
export class SharedAreaComponent implements OnInit {

  @Input() showCardProperty$!: Observable<boolean>;
  @Input() gainCardState$!: Observable<boolean>;
  @Output() cardClicked = new EventEmitter<DCard>();

  // TODO: RxJS -> RN
  width$           = this.config.cardSizeRatio$; // .pipe( map( ratio => ratio *  70 ) );
  trashPileWidth$  = this.config.cardSizeRatio$; // .pipe( map( ratio => ratio * 100 ) );
  trashPileHeight$ = this.config.cardSizeRatio$; // .pipe( map( ratio => ratio * 160 ) );

  // myIndex$ = this.gameRoomService.myIndex$;

  // Prosperity$           = this.gameRoomService.Prosperity$;
  // usePotion$            = this.gameRoomService.usePotion$;
  private BasicCards$   = this.gameStateService.BasicCards$;
  private KingdomCards$ = this.gameStateService.KingdomCards$;
  trashPile$            = this.gameStateService.trashPile$;

  BasicCards = {
    Potion$   : this.BasicCards$.pipe( map( e => e.Potion   ) ),
    Copper$   : this.BasicCards$.pipe( map( e => e.Copper   ) ),
    Silver$   : this.BasicCards$.pipe( map( e => e.Silver   ) ),
    Gold$     : this.BasicCards$.pipe( map( e => e.Gold     ) ),
    Platinum$ : this.BasicCards$.pipe( map( e => e.Platinum ) ),
    Estate$   : this.BasicCards$.pipe( map( e => e.Estate   ) ),
    Duchy$    : this.BasicCards$.pipe( map( e => e.Duchy    ) ),
    Province$ : this.BasicCards$.pipe( map( e => e.Province ) ),
    Colony$   : this.BasicCards$.pipe( map( e => e.Colony   ) ),
    Curse$    : this.BasicCards$.pipe( map( e => e.Curse    ) ),
  };

  KingdomCards = utils.number.seq0(10).map( i => this.KingdomCards$.pipe( map( e => e[i] ) ) );


  constructor(
    private gameRoomService: MyGameRoomService,
    private gameStateService: GameStateService,
    private config: GameConfigService,
  ) {
  }

  ngOnInit() {
  }

  onClick( dcard: DCard ) {
    this.cardClicked.emit( dcard );
  }
}
