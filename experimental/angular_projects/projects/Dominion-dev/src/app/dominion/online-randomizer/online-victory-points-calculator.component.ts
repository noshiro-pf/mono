import { Component, OnInit } from '@angular/core';
import { RN, combine } from 'rnjs';
import { UserService } from '../../database/user.service';
import { NumberOfVictoryCards } from '../types/number-of-victory-cards';
import { MyRandomizerGroupService } from './my-randomizer-group.service';
import { PlayerResult } from './types/player-result';

@Component({
  selector: 'app-online-victory-points-calculator',
  template: `
    <ng-container *ngIf="uid$ | async as uid">
      <div class="body-with-padding">
        <app-victory-points-calculator
          *ngIf="!!uid"
          [selectedCards]="selectedCards$ | async"
          [resetVPCalculator]="resetVPCalculator$ | async"
          [numberOfVictoryCards]="numberOfVictoryCards$ | async"
          (numberOfVictoryCardsChange)="
            numberOfVictoryCardsOnChange($event, uid)
          "
          (VPtotalChange)="VPtotalOnChange($event, uid)"
        >
        </app-victory-points-calculator>
      </div>
    </ng-container>
  `,
  styles: [],
})
export class OnlineVictoryPointsCalculatorComponent implements OnInit {
  selectedCards$ = this.myRandomizerGroup.selectedCards$; // 存在するもののみ表示
  resetVPCalculator$ = this.myRandomizerGroup.resetVPCalculator$;
  uid$: RN<string> = this.user.uid$;
  numberOfVictoryCards$ = combine(
    this.myRandomizerGroup.newGameResult.players$,
    this.uid$.filter('', (uid) => !!uid),
  ).map(
    ([players, uid]) =>
      (players.find((e) => e.uid === uid) || new PlayerResult())
        .numberOfVictoryCards,
  );

  constructor(
    private user: UserService,
    private myRandomizerGroup: MyRandomizerGroupService,
  ) {}

  ngOnInit() {}

  VPtotalOnChange(VPtotal: number, uid: string) {
    if (!uid) return;
    this.myRandomizerGroup.setNGRPlayerVP(uid, VPtotal);
  }

  numberOfVictoryCardsOnChange(
    numberOfVictoryCards: NumberOfVictoryCards,
    uid: string,
  ) {
    if (!uid) return;
    this.myRandomizerGroup.setNGRPlayerNumberOfVictoryCards(
      uid,
      numberOfVictoryCards,
    );
  }
}
