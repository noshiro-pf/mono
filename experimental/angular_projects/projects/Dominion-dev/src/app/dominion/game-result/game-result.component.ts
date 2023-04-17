import { Component, OnInit } from '@angular/core';
import { RN, combine, manual, merge } from 'rnjs';
import { FireDatabaseService } from '../../database/database.service';
import { utils } from '../../mylib/utilities';
import { GameResult } from '../types/game-result';

@Component({
  selector: 'app-game-result',
  templateUrl: './game-result.component.html',
  styleUrls: ['./game-result.component.css'],
})
export class GameResultComponent implements OnInit {
  /* user input */
  private readonly t = 300;
  private dateBeginChangeSource = manual<number>(Date.now());
  private dateBeginChange$ = this.dateBeginChangeSource.debounce(this.t);

  private dateEndChangeSource = manual<number>(Date.now());
  private dateEndChange$ = this.dateEndChangeSource.debounce(this.t);

  private latestResultClickSource = manual<void>(null);
  private latestResultClick$ = this.latestResultClickSource.debounce(this.t);

  private resetAllClickSource = manual<void>(null);
  private resetAllClick$ = this.resetAllClickSource.debounce(this.t);

  private nofPlayersCheckSource = manual<{
    checked: boolean;
    nofPlayers: number;
  }>({ checked: false, nofPlayers: 4 });
  private nofPlayersCheck$ = this.nofPlayersCheckSource.debounce(this.t);

  /* data */

  gameResultList$ = this.database.gameResultList$;
  gameResultListFiltered$: RN<GameResult[]>;

  /* values */
  timestampBegin$: RN<number>;
  timestampEnd$: RN<number>;
  dateBegin$: RN<Date>;
  dateEnd$: RN<Date>;
  nofPlayersOptions$: RN<{ nofPlayers: number; checked: boolean }[]>;

  constructor(private database: FireDatabaseService) {
    const firstDateInGRList$: RN<number> = this.gameResultList$
      .filter([], (GRList) => !!GRList && GRList.length > 0)
      .map((GRList) =>
        utils.date.toMidnightTimestamp(utils.array.front(GRList).date)
      )
      .skipUnchanged();

    const latestDateInGRList$: RN<number> = this.gameResultList$
      .filter([], (GRList) => !!GRList && GRList.length > 0)
      .map((GRList) =>
        utils.date.toMidnightTimestamp(utils.array.back(GRList).date)
      )
      .skipUnchanged();

    this.timestampBegin$ = merge(
      firstDateInGRList$, // initialize
      combine(firstDateInGRList$, this.resetAllClick$).map(
        ([firstDate]) => firstDate
      ),
      combine(latestDateInGRList$, this.latestResultClick$).map(
        ([latestDate]) => latestDate
      ),
      this.dateBeginChange$
    );

    this.timestampEnd$ = merge(
      latestDateInGRList$, // initialize
      combine(
        latestDateInGRList$,
        this.resetAllClick$,
        this.latestResultClick$
      ).map(([latestDate]) => latestDate),
      this.dateEndChange$
    );

    this.dateBegin$ = this.timestampBegin$.map((e) => new Date(e));
    this.dateEnd$ = this.timestampEnd$.map((e) => new Date(e));

    const nofPlayersAll$: RN<number[]> = this.gameResultList$
      .map((list) =>
        Array.from(
          list.reduce((acc, v) => acc.add(v.players.length), new Set())
        ).sort((a, b) => a - b)
      )
      .withInitialValue([2, 3, 4, 5, 6]);

    const nofPlayersCheckedValues$: RN<Set<number>> =
      // = of( new Set([2, 3, 4]) );
      merge(
        nofPlayersAll$,
        this.nofPlayersCheck$,
        combine(nofPlayersAll$, this.resetAllClick$).map(
          ([nofPlayersAll]) => nofPlayersAll
        )
      )
        .scan(
          new Set<number>(),
          (
            acc: Set<number>,
            v: number[] | { nofPlayers: number; checked: boolean }
          ): Set<number> => {
            if (Array.isArray(v)) {
              v.forEach((e) => acc.add(e));
            } else {
              if (v.checked) acc.add(v.nofPlayers);
              else acc.delete(v.nofPlayers);
            }
            return acc;
          }
        )
        .withInitialValue(new Set());

    this.nofPlayersOptions$ = combine(
      nofPlayersAll$,
      nofPlayersCheckedValues$
    ).map(([list, checkedValues]) =>
      list.map((e) => ({ nofPlayers: e, checked: checkedValues.has(e) }))
    );

    this.gameResultListFiltered$ = combine(
      this.gameResultList$,
      this.timestampBegin$,
      this.timestampEnd$,
      nofPlayersCheckedValues$
    ).map(([gameResultList, dateBegin, dateEnd, nofPlayersChecked]) =>
      gameResultList.filter((gr) => {
        const mDate = utils.date.toMidnightTimestamp(gr.date);
        return (
          mDate >= dateBegin &&
          mDate <= dateEnd &&
          nofPlayersChecked.has(gr.players.length)
        );
      })
    );
  }

  ngOnInit() {}

  changeDateBegin(date: Date) {
    this.dateBeginChangeSource.emit(date.getTime());
  }

  changeDateEnd(date: Date) {
    this.dateEndChangeSource.emit(date.getTime());
  }

  latestResultClicked() {
    this.latestResultClickSource.emit();
  }

  resetAllClicked() {
    this.resetAllClickSource.emit();
  }

  nofPlayersOnCheck(checked: boolean, nofPlayers: number) {
    this.nofPlayersCheckSource.emit({
      checked: checked,
      nofPlayers: nofPlayers,
    });
  }
}
