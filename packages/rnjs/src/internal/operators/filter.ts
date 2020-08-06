import { RN } from '../mod';
import { Operator } from '../types/Operator';

export const filter = <T>(
  initialValue: T,
  predicate: (srcValue: T, srcIndex: number, index: number) => boolean,
  name: string = ''
): Operator<T, T> => (src: RN<T>) =>
  new FilterRN<T>(src, initialValue, predicate, name);

class FilterRN<T> extends RN<T> {
  private readonly predicate: (
    srcValue: T,
    srcIndex: number,
    index: number
  ) => boolean;

  constructor(
    src: RN<T>,
    initialValue: T,
    predicate: (srcValue: T, srcIndex: number, index: number) => boolean,
    name: string
  ) {
    super(initialValue, [src], name);
    this.predicate = predicate;
  }

  protected fire() {
    const src = this.parents[0];
    // note: 'this.index' is not updated yet (will be updated in this.fireWith())
    if (this.predicate(src.value, src.index, this.index + 1)) {
      this.fireWith(src.value);
    }
  }
}
