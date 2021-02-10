import { RN } from '../mod';
import { Operator } from '../types/Operator';



export const withLatest = <T, U>( src2: RN<U> ): Operator<T, [T, U]> =>
    (( src: RN<T> ) => new WithLatestRN<T, U>( src, src2 ));


class WithLatestRN<T, U> extends RN<[T, U]> {
  private src2: RN<U>;

  constructor( src: RN<T>, src2: RN<U> ) {
    super( [src.value, src2.value], [src] );
    this.src2 = src2;
  }

  protected fire() {
    this.fireWith( [this.parents[0].value, this.src2.value] );
  }
}
