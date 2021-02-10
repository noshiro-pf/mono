import { RN } from '../mod';
import { Operator } from '../types/Operator';



export const pairwise = <T>( initialPrevValue?: T ): Operator<T, [T, T]> =>
    (( src: RN<T> ) => new PairwiseRN<T>( src, initialPrevValue ));


class PairwiseRN<T> extends RN<[T, T]> {
  private prevVal: T;

  constructor( src: RN<T>, initialPrevValue?: T ) {
    super( [initialPrevValue || src.value, src.value], [src] );
    this.prevVal = initialPrevValue || src.value;
  }

  protected fire() {
    const nextVal = this.parents[0].value;
    this.fireWith( [this.prevVal, nextVal] );
    this.prevVal = nextVal;
  }
}
