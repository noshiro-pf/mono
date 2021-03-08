import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GameStateService } from '../../../services/game-state-services/game-state.service';

@Component({
  selector: 'app-turn-info',
  templateUrl: './turn-info.component.html',
  styleUrls: ['./turn-info.component.css'],
})
export class TurnInfoComponent implements OnInit {
  action$: Observable<number> = this.gameStateService.action$;
  buy$: Observable<number> = this.gameStateService.buy$;
  coin$: Observable<number> = this.gameStateService.coin$;
  potion$: Observable<number> = this.gameStateService.potion$;

  phaseCharacter$: Observable<string> = this.gameStateService.phase$.pipe(
    map((phase) => {
      switch (phase) {
        case '':
          return '';
        case 'StartOfTurn':
          return '';
        case 'Action':
          return 'A';
        case '<Action>':
          return '〈A〉';
        case 'BuyPlay':
          return 'B';
        case '<BuyPlay>':
          return '〈B〉';
        case 'BuyCard':
          return 'B*';
        case 'Night':
          return 'N';
        case '<Night>':
          return '〈N〉';
        case 'CleanUp':
          return 'C';
        case 'EndOfTurn':
          return '';
        case 'GameIsOver':
          return '';
        default:
          throw new Error(`unknown phase name '${phase}'`);
      }
    })
  );

  potionRepeater$ = this.potion$.pipe(
    map((potion) => Array.from(new Array(potion)))
  );

  constructor(private gameStateService: GameStateService) {}

  ngOnInit() {}
}
