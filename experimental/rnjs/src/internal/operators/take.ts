import { RN } from '../mod';
import { Operator } from '../types/Operator';

export const take = <T>(takeNum: number, name: string = ''): Operator<T, T> => (
  src: RN<T>
) =>
  new TakeWhileRN<T>(
    src,
    (_srcValue, srcIndex, _index) => srcIndex < takeNum,
    name
  );

export const takeWhile = <T>(
  predicate: (srcValue: T, srcIndex: number, index: number) => boolean,
  name: string = ''
): Operator<T, T> => (src: RN<T>) => new TakeWhileRN<T>(src, predicate, name);

class TakeWhileRN<T> extends RN<T> {
  private readonly predicate: (
    srcValue: T,
    srcIndex: number,
    index: number
  ) => boolean;

  constructor(
    src: RN<T>,
    predicate: (srcValue: T, srcIndex: number, index: number) => boolean,
    name: string = ''
  ) {
    super(src.value, [src], name);
    this.predicate = predicate;
  }

  protected fire(): void {
    const src = this.parents[0] as RN<any>;

    // note: 'this.index' is not updated yet (will be updated in this.fireWith())
    if (this.predicate(src.value, src.index, this.index + 1)) {
      this.fireWith(src.value);
    } else {
      this.complete();
    }
  }
}
