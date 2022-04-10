import { Maybe } from '@noshiro/ts-utils';
import { AsyncChildObservableClass } from '../class';
import type {
  AuditTimeOperatorObservable,
  InitializedToInitializedOperator,
  Observable,
  ToBaseOperator,
  Token,
} from '../types';

export const auditTime =
  <A>(milliSeconds: number): ToBaseOperator<A, A> =>
  (parentObservable: Observable<A>) =>
    new AuditTimeObservableClass(parentObservable, milliSeconds);

export const auditTimeI = <A>(
  milliSeconds: number
): InitializedToInitializedOperator<A, A> =>
  auditTime(milliSeconds) as InitializedToInitializedOperator<A, A>;

class AuditTimeObservableClass<A>
  extends AsyncChildObservableClass<A, 'auditTime', readonly [A]>
  implements AuditTimeOperatorObservable<A>
{
  readonly #milliSeconds: number;
  #timerId: TimerId | undefined;
  #isSkipping: boolean;

  constructor(parentObservable: Observable<A>, milliSeconds: number) {
    super({
      parents: [parentObservable],
      type: 'auditTime',
      currentValueInit: parentObservable.currentValue,
    });
    this.#isSkipping = false;
    this.#timerId = undefined;
    this.#milliSeconds = milliSeconds;
  }

  override tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Maybe.isNone(par.currentValue)) return; // skip update
    if (this.#isSkipping) return; // skip update

    // set timer
    this.#isSkipping = true;
    this.#timerId = setTimeout(() => {
      if (Maybe.isNone(par.currentValue)) return;
      this.startUpdate(par.currentValue.value);
      this.#isSkipping = false;
    }, this.#milliSeconds);
  }

  #resetTimer(): void {
    if (this.#timerId !== undefined) {
      clearTimeout(this.#timerId);
    }
  }

  override complete(): void {
    this.#resetTimer();
    super.complete();
  }
}
