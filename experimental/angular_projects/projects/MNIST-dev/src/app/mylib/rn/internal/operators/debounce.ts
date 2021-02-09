import { RN } from '../mod';
import { Operator } from '../types/Operator';



export const debounce = <T>( time: number ): Operator<T, T> =>
    (( src: RN<T> ) => new DebounceRN<T>( src, time ));


class DebounceRN<T> extends RN<T> {
  private time: number;
  private timerId: any;

  constructor( src: RN<T>, time: number ) {
    super( src.value, [src] );
    this.time = time;
  }

  protected fire() {
    clearTimeout( this.timerId );

    this.timerId = setTimeout(() => {
      this.fireWith( this.parents[0].value );
    }, this.time );
  }

  complete() {
    super.complete();
    clearTimeout( this.timerId );
  }
}
