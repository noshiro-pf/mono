import { RN } from '../RN';


export const interval = (
    milliSec: number,
    startImmediately: boolean = false
  ) => new IntervalRN( milliSec, startImmediately );



class IntervalRN extends RN<number> {
  private timerId: any;
  private counter: number;
  private milliSec: number;
  private started: boolean = false;

  constructor( milliSec: number, startImmediately: boolean = false ) {
    super( 0, [] );
    this.milliSec = milliSec;
    this.counter = 0;
    if ( startImmediately ) this.start();
  }

  start() {
    if ( this.started ) return;
    this.started = true;

    this.fireWith( this.counter );  // emit first
    this.timerId = setInterval( () => {
          this.counter += 1;
          this.fireWith( this.counter );
        }, this.milliSec );
  }

  stop() { this.complete(); }  // alias
  
  complete() {
    super.complete();
    clearInterval( this.timerId );
  }
}
