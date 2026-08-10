import { Maybe } from '@noshiro/ts-utils';
import { AsyncChildObservableClass } from '../class/index.mjs';
import {
  type AuditTimeOperatorObservable,
  type KeepInitialValueOperator,
  type Observable,
  type UpdaterSymbol,
} from '../types/index.mjs';

export const auditTime = <A,>(
  milliSeconds: number,
): KeepInitialValueOperator<A, A> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  ((parentObservable) =>
    new AuditTimeObservableClass(
      parentObservable,
      milliSeconds,
    )) as KeepInitialValueOperator<A, A>;

class AuditTimeObservableClass<A>
  extends AsyncChildObservableClass<A, readonly [A]>
  implements AuditTimeOperatorObservable<A>
{
  readonly #milliSeconds: number;
  #timerId: TimerId | undefined;
  #isSkipping: boolean;

  constructor(parentObservable: Observable<A>, milliSeconds: number) {
    super({
      parents: [parentObservable],
      initialValue: parentObservable.getSnapshot(),
    });
    this.#isSkipping = false;
    this.#timerId = undefined;
    this.#milliSeconds = milliSeconds;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (
      par.updaterSymbol !== updaterSymbol ||
      Maybe.isNone(par.getSnapshot()) ||
      this.#isSkipping
    ) {
      return; // skip update
    }

    // set timer
    this.#isSkipping = true;
    this.#timerId = setTimeout(() => {
      const sn = par.getSnapshot();
      if (Maybe.isNone(sn)) return;
      this.startUpdate(sn.value);
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
