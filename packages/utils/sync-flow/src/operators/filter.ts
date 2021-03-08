import { Option } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import {
  FilterOperatorObservable,
  Observable,
  Operator,
  Token,
} from '../types';

// filter<S extends T>(predicate: (value: T, index: number, array: T[]) => value is S, thisArg?: any): S[];

export function filter<A, B extends A>(
  predicate: (value: A) => value is B
): Operator<A, B>;
export function filter<A>(predicate: (value: A) => boolean): Operator<A, A>;
export function filter<A>(predicate: (value: A) => boolean): Operator<A, A> {
  return (parent: Observable<A>) =>
    new FilterObservableClass(parent, predicate);
}

class FilterObservableClass<A>
  extends SyncChildObservableClass<A, 'filter', [A]>
  implements FilterOperatorObservable<A> {
  private readonly _predicate: (x: A) => boolean;

  constructor(parent: Observable<A>, predicate: (x: A) => boolean) {
    super({
      parents: [parent],
      type: 'filter',
      currentValueInit: Option.none,
    });
    this._predicate = predicate;
  }

  tryUpdate(token: Token): void {
    const parent = this.parents[0];
    if (parent.token !== token) return; // skip update
    if (Option.isNone(parent.currentValue)) return; // skip update

    if (this._predicate(parent.currentValue.value)) {
      this.setNext(parent.currentValue.value, token);
    }
  }
}
