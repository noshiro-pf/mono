import { Maybe } from '@noshiro/ts-utils';
import { RootObservableClass } from '../class/index.mjs';
import { type OfObservable } from '../types/index.mjs';

export const of = <A,>(
  value: A,
  startManually: boolean = false,
): OfObservable<A> => new OfObservableClass<A>(value, startManually);

class OfObservableClass<A>
  extends RootObservableClass<A>
  implements OfObservable<A>
{
  readonly #value: A;

  constructor(value: A, startManually: boolean = false) {
    super({ initialValue: Maybe.none });
    this.#value = value;
    if (!startManually) {
      setTimeout(() => {
        this.emit();
      }, 0);
    }
  }

  emit(): this {
    if (this.isCompleted) return this;
    this.startUpdate(this.#value);
    this.complete();
    return this;
  }
}
