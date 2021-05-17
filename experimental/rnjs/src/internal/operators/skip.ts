import { RN } from '../mod';
import { Operator } from '../types/Operator';

export const skip =
  <T>(initialValue: T, skipNum: number, name: string = ''): Operator<T, T> =>
  (src: RN<T>) =>
    new SkipWhileRN<T>(
      src,
      initialValue,
      (_srcValue, srcIndex, _index) => srcIndex < skipNum,
      name
    );

export const skipWhile =
  <T>(
    initialValue: T,
    predicate: (srcValue: T, srcIndex: number, index: number) => boolean,
    name: string = ''
  ): Operator<T, T> =>
  (src: RN<T>) =>
    new SkipWhileRN<T>(src, initialValue, predicate, name);

class SkipWhileRN<T> extends RN<T> {
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

  protected fire(): void {
    const src = this.parents[0] as RN<any>;
    // note: 'this.index' is not updated yet (will be updated in this.fireWith())
    if (!this.predicate(src.value, src.index, this.index + 1)) {
      this.fireWith(src.value);
    }
  }
}
