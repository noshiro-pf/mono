import { RN } from '../mod';
import { Operator } from '../types/Operator';
import { Subscription } from '../types/Subscription';



export const flatMap = <T, U>( fn: (e: T) => RN<U> ): Operator<T, U> =>
    (( src: RN<T> ) => new FlatMapRN<T, U>( src, fn ));


class FlatMapRN<T, U> extends RN<U> {
  private latestRN: RN<U>;
  private subscriptions: Subscription[];
  private fn: (e: T) => RN<U>;

  constructor( src: RN<T>, fn: (e: T) => RN<U> ) {
    super( fn( src.value ).value, [src] );
    this.latestRN = fn( src.value );
    this.fn = fn;
    this.subscriptions = [];
    this.subscriptions.push( this.latestRN.subscribe( e => this.fireWith( e ) ) );
  }

  protected fire() {  // switch latestRN here
    this.latestRN = this.fn( this.parents[0].value );
    this.subscriptions.push( this.latestRN.subscribe( e => this.fireWith( e ) ) );
  }

  complete() {
    super.complete();
    this.subscriptions.forEach( s => s.unsubscribe() );
  }
}
