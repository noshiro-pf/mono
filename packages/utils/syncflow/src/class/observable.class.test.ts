import { expect, test } from '@jest/globals';
import type { TypeEq, TypeExtends } from '@noshiro/ts-utils';
import { assertNotType, assertType, Option } from '@noshiro/ts-utils';
import type {
  AsyncChildObservable,
  ChildObservable,
  Observable,
  ObservableBase,
  RootObservable,
  SyncChildObservable,
} from '../types';
import {
  AsyncChildObservableClass,
  SyncChildObservableClass,
} from './child-observable-class';
import { RootObservableClass } from './root-observable-class';

/**
 * inheritance
 *
 * ObservableBase
 *   |
 *   +- SyncChildObservable    \                       \
 *   |                          +-- ChildObservable     \
 *   +- AsyncChildObservable   X                         +-- Observable
 *   |                          +-- ManagerObservable   /
 *   +- RootObservableType     /                       /
 *
 */

// type tests

assertType<TypeEq<Observable<number>, Observable<number>>>();
assertNotType<TypeEq<Observable<string>, Observable<number>>>();

// inheritance
assertType<TypeExtends<ChildObservable<number>, ObservableBase<number>>>();
assertType<
  TypeExtends<SyncChildObservable<number, 'map'>, ChildObservable<number>>
>();
assertType<
  TypeExtends<
    AsyncChildObservable<number, 'debounceTime'>,
    ChildObservable<number>
  >
>();
assertType<
  TypeExtends<RootObservable<number, 'FromArray'>, ObservableBase<number>>
>();
assertType<
  TypeExtends<SyncChildObservable<number, 'map'>, ChildObservable<number>>
>();
assertType<TypeExtends<Observable<number>, ObservableBase<number>>>();
assertNotType<TypeExtends<ObservableBase<number>, Observable<number>>>();
assertType<TypeExtends<ChildObservable<number>, Observable<number>>>();

// ObservableBase is covariant
assertType<TypeExtends<ObservableBase<1>, ObservableBase<number>>>();
assertNotType<TypeExtends<ObservableBase<number>, ObservableBase<1>>>();
// Observable is covariant
assertType<TypeExtends<Observable<1>, Observable<number>>>();
assertNotType<TypeExtends<Observable<number>, Observable<1>>>();

const root = new RootObservableClass({
  type: 'FromArray',
  currentValueInit: Option.some(0),
});

assertType<TypeExtends<typeof root, RootObservable<number, 'FromArray'>>>();

const syncChild = new SyncChildObservableClass({
  parents: [root],
  type: 'map',
  currentValueInit: Option.some(0),
});
assertType<TypeExtends<typeof syncChild, SyncChildObservable<number, 'map'>>>();

const asyncChild = new AsyncChildObservableClass({
  parents: [root],
  type: 'debounceTime',
  currentValueInit: Option.some(0),
});
assertType<
  TypeExtends<typeof asyncChild, AsyncChildObservable<number, 'debounceTime'>>
>();

test('SyncChildObservableClass', () => {
  expect(syncChild.depth).toBe(1);
});
test('AsyncChildObservableClass', () => {
  expect(asyncChild.depth).toBe(1);
});
