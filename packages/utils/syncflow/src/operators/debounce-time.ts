import { Option, TimerId } from '@noshiro/ts-utils';
import { AsyncChildObservableClass } from '../class';
import {
  DebounceTimeOperatorObservable,
  InitializedToInitializedOperator,
  Observable,
  ToBaseOperator,
  Token,
} from '../types';

export const debounceTime = <A>(millisec: number): ToBaseOperator<A, A> => (
  parent: Observable<A>
) => new DebounceTimeObservableClass(parent, millisec);

export const debounceTimeI = <A>(
  millisec: number
): InitializedToInitializedOperator<A, A> =>
  debounceTime(millisec) as InitializedToInitializedOperator<A, A>;

class DebounceTimeObservableClass<A>
  extends AsyncChildObservableClass<A, 'debounceTime', [A]>
  implements DebounceTimeOperatorObservable<A> {
  private readonly _millisec: number;
  private _timerId: TimerId | undefined;

  constructor(parent: Observable<A>, millisec: number) {
    super({
      parents: [parent],
      type: 'debounceTime',
      currentValueInit: parent.currentValue,
    });
    this._timerId = undefined;
    this._millisec = millisec;
  }

  tryUpdate(token: Token): void {
    const parent = this.parents[0];
    if (parent.token !== token) return; // skip update
    if (Option.isNone(parent.currentValue)) return; // skip update

    this.resetTimer();
    // set timer
    this._timerId = setTimeout(() => {
      if (Option.isNone(parent.currentValue)) return;
      this.startUpdate(parent.currentValue.value);
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
