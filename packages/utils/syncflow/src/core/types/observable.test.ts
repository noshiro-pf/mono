import { expectType, Maybe } from '@noshiro/ts-utils';
import { RootObservableClass } from '../class';
import {
  isRootObservable,
  type Observable,
  type ObservableValue,
  type Unwrap,
  type Wrap,
} from './observable';

expectType<number, ObservableValue<Observable<number>>>('<=');
expectType<number, ObservableValue<Observable<string>>>('!<=');

expectType<
  readonly [number, string],
  Unwrap<readonly [Observable<number>, Observable<string>]>
>('<=');
expectType<number, ObservableValue<Observable<string>>>('!<=');

expectType<
  readonly [Observable<number>, Observable<number>],
  Wrap<readonly [number, number]>
>('<=');
expectType<
  readonly [Observable<number>, Observable<string>],
  Wrap<readonly [number, number]>
>('!<=');

test('', () => {
  expect(
    isRootObservable(
      new RootObservableClass({
        initialValue: Maybe.some(0),
        type: 'Of',
      })
    )
  ).toBe(true);
});
