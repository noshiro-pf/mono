import { assertNotType, assertType, Maybe } from '@noshiro/ts-utils';
import { RootObservableClass } from '../class';
import type { Observable, ObservableValue, Unwrap, Wrap } from './observable';
import { isRootObservable } from './observable';

assertType<TypeExtends<number, ObservableValue<Observable<number>>>>();
assertNotType<TypeExtends<number, ObservableValue<Observable<string>>>>();

assertType<
  TypeExtends<
    readonly [number, string],
    Unwrap<readonly [Observable<number>, Observable<string>]>
  >
>();
assertNotType<TypeExtends<number, ObservableValue<Observable<string>>>>();

assertType<
  TypeExtends<
    readonly [Observable<number>, Observable<number>],
    Wrap<readonly [number, number]>
  >
>();
assertNotType<
  TypeExtends<
    readonly [Observable<number>, Observable<string>],
    Wrap<readonly [number, number]>
  >
>();

test('', () => {
  expect(
    isRootObservable(
      new RootObservableClass({
        currentValueInit: Maybe.some(0),
        type: 'Of',
      })
    )
  ).toBe(true);
});
