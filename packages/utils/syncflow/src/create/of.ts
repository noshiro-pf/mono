import { Option } from '@noshiro/ts-utils';
import { RootObservableClass } from '../class';
import type { OfObservable } from '../types';

export const of = <A>(
  value: A,
  startManually: boolean = false
): OfObservable<A> => new OfObservableClass<A>(value, startManually);

class OfObservableClass<A>
  extends RootObservableClass<A, 'Of'>
  implements OfObservable<A> {
  private readonly _value: A;

  constructor(value: A, startManually: boolean = false) {
    super({ type: 'Of', currentValueInit: Option.none });
    this._value = value;
    if (!startManually) {
      setTimeout(() => {
        this.emit();
      }, 0);
    }
  }

  emit(): this {
    if (this.isCompleted) return this;
    this.startUpdate(this._value);
    this.complete();
    return this;
  }
}
