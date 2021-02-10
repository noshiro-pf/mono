import { RN } from '../mod';
import { Operator } from '../types/Operator';
import { Subscription } from '../types/Subscription';



export const switchMap = <T, U>( fn: (e: T) => RN<U> ): Operator<T, U> =>
    (( src: RN<T> ) => new SwitchMapRN<T, U>( src, fn ));


class SwitchMapRN<T, U> extends RN<U> {
  private latestRN: RN<U>;
  private subscription: Subscription;
  private fn: (e: T) => RN<U>;

  constructor( src: RN<T>, fn: (e: T) => RN<U> ) {
    super( fn( src.value ).value, [src] );
    this.latestRN = fn( src.value );
    this.fn = fn;
    this.subscription = this.latestRN.subscribe( e => this.fireWith( e ) );
  }

  protected fire() {  // switch latestRN here
    this.subscription.unsubscribe();
    this.latestRN = this.fn( this.parents[0].value );
    this.subscription = this.latestRN.subscribe( e => this.fireWith( e ) );
  }

  complete() {
    super.complete();
    this.subscription.unsubscribe();
  }
}
