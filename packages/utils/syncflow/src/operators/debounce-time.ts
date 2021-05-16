import type { TimerId } from '@noshiro/ts-utils';
import { Option } from '@noshiro/ts-utils';
import { AsyncChildObservableClass } from '../class';
import type {
  DebounceTimeOperatorObservable,
  InitializedToInitializedOperator,
  Observable,
  ToBaseOperator,
  Token,
} from '../types';

export const debounceTime = <A>(millisec: number): ToBaseOperator<A, A> => (
  parentObservable: Observable<A>
) => new DebounceTimeObservableClass(parentObservable, millisec);

export const debounceTimeI = <A>(
  millisec: number
): InitializedToInitializedOperator<A, A> =>
  debounceTime(millisec) as InitializedToInitializedOperator<A, A>;

class DebounceTimeObservableClass<A>
  extends AsyncChildObservableClass<A, 'debounceTime', [A]>
  implements DebounceTimeOperatorObservable<A> {
  private readonly _millisec: number;
  private _timerId: TimerId | undefined;

  constructor(parentObservable: Observable<A>, millisec: number) {
    super({
      parents: [parentObservable],
      type: 'debounceTime',
      currentValueInit: parentObservable.currentValue,
    });
    this._timerId = undefined;
    this._millisec = millisec;
  }

  tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Option.isNone(par.currentValue)) return; // skip update

    this.resetTimer();
    // set timer
    this._timerId = setTimeout(() => {
      if (Option.isNone(par.currentValue)) return;
      this.startUpdate(par.currentValue.value);
    }, this._millisec);
  }

  private resetTimer(): void {
    if (this._timerId !== undefined) {
      clearTimeout(this._timerId);
    }
  }

  // overload
  complete(): void {
    this.resetTimer();
    super.complete();
  }
}
