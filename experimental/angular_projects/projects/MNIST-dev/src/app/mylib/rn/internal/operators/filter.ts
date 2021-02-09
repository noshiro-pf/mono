import { RN } from '../mod';
import { Operator } from '../types/Operator';



export const filter = <T>(
  initialValue: T,
  predicate: (e: T) => boolean,
): Operator<T, T> =>
    (( src: RN<T> ) => new FilterRN<T>( src, initialValue, predicate ));


class FilterRN<T> extends RN<T> {
  private predicate: (e: T) => boolean;

  constructor(
    src: RN<T>,
    initialValue: T,
    predicate: (e: T) => boolean,
  ) {
    super( initialValue, [src] );
    this.predicate = predicate;
  }

  protected fire() {
    const nextVal = this.parents[0].value;
    if ( this.predicate( nextVal ) ) {
      this.fireWith( nextVal );
    }
  }
}
