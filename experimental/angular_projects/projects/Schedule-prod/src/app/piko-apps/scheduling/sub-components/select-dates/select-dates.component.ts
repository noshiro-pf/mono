import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';

import { SetTimeDialogComponent } from './set-time-dialog.component';
import { utils } from '../../../../mylib/utilities';


@Component({
  selector: 'app-select-dates',
  templateUrl: './select-dates.component.html',
  styleUrls: ['./select-dates.component.css']
})
export class SelectDatesComponent implements OnInit {

  defaultHour: number = 19;
  defaultMinutes: number = 0;

  @Input() set selectedDatetimesInit( value: number[] ) {
    this.selectedDatetimes = (value || []).slice(); // copy
  }

  @Output() selectedDatetimesChange = new EventEmitter<number[]>();


  selectedDatetimes: number[] = [];
  /** example
   * [ 2017/10/27 12:00,
   *   2017/10/27 19:00
   *   2017/10/28 13:00,
   *   2017/10/28 18:00,
   *   2017/10/28 20:00 ]
   **/

  toYMD = utils.date.toYMD;
  toHM = utils.date.toHM;
  getDayStringEng = utils.date.getDayStringEng;
  private to0000 = utils.date.toMidnightTimestamp;


  pad2 = (minutes: number) => minutes.toString().padStart(2, '0');

  sinceToday = (date: number): boolean =>
    ( !date ? false : this.to0000(date) >= this.to0000(Date.now()) )

  // aligned to 00:00 and uniqued
  private uniq0000 = (datetimes: number[]): number[] =>
    utils.array.uniq(
        datetimes.map( e => this.to0000(e) ) )
      .sort()

  private getRemovedDates = (datesOld: number[], datesNew: number[]) =>
    datesOld.filter( e => !datesNew.includes(e) )

  private getAddedDates = (datesOld: number[], datesNew: number[]) =>
    datesNew.filter( e => !datesOld.includes(e) )

  private removeDates = (removed: number[]) => {
    this.selectedDatetimes
      = this.selectedDatetimes.filter( e => !removed.includes( this.to0000(e) ) );
  }

  private addDates = (added: number[]) => {
    this.selectedDatetimes.push(
      ...added.map( e => {
          const date = new Date(e);
          date.setHours( this.defaultHour );
          date.setMinutes( this.defaultMinutes );
          return date.getTime();
        })
    );
    this.selectedDatetimes.sort();
  }


  constructor(
    public dialog: MatDialog,
  ) {
  }

  ngOnInit() {
  }


  selectedDatesOnChange( datetimes: number[] ) {
    const datesOld = this.uniq0000( this.selectedDatetimes );
    const datesNew = this.uniq0000( datetimes );
    const removed = this.getRemovedDates( datesOld, datesNew );
    const added = this.getAddedDates( datesOld, datesNew );
    this.removeDates( removed );
    this.addDates( added );
    this.selectedDatetimesChange.emit( this.selectedDatetimes );
  }


  changeAllTime() {
    const dialogRef = this.dialog.open( SetTimeDialogComponent, { disableClose: true } );

    // input
    dialogRef.componentInstance.hoursInit = this.defaultHour;
    dialogRef.componentInstance.minutesInit = this.defaultMinutes;

    dialogRef.afterClosed().subscribe( value => {
      if ( value.clicked !== 'ok' ) return;
      /* default */
      this.defaultHour = value.hours;
      this.defaultMinutes = value.minutes;

      /* reset all datetimes */
      this.selectedDatetimes.forEach( (val, idx, arr) => {
        const date = new Date( val );
        date.setHours( this.defaultHour );
        date.setMinutes( this.defaultMinutes );
        arr[idx] = date.getTime();
      });

      this.selectedDatetimesChange.emit( this.selectedDatetimes );
    });
  }


  changeTime( target: number ) {
    const dialogRef = this.dialog.open( SetTimeDialogComponent, { disableClose: true } );

    // dialog input
    dialogRef.componentInstance.hoursInit = new Date( target ).getHours();
    dialogRef.componentInstance.minutesInit = new Date( target ).getMinutes();

    dialogRef.afterClosed().subscribe( value => {
      if ( value.clicked !== 'ok' ) return;

      utils.array.removeValue( this.selectedDatetimes, target );
      const date = new Date( target );
      date.setHours( value.hours );
      date.setMinutes( value.minutes );
      this.selectedDatetimes.push( date.getTime() );
      this.selectedDatetimes.sort();

      this.selectedDatetimesChange.emit( this.selectedDatetimes );
    });
  }

  copy( datetime: number ) {
    const date = new Date( datetime );
    date.setHours( date.getHours() + 1 );
    this.selectedDatetimes.push( date.getTime() );
    this.selectedDatetimes.sort();
    this.selectedDatetimesChange.emit( this.selectedDatetimes );
  }

  remove( datetime: number ) {
    this.selectedDatetimes
      = this.selectedDatetimes.filter( e => e !== datetime );
    this.selectedDatetimesChange.emit( this.selectedDatetimes );
  }

}
