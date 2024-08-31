import { expectType, Maybe } from '@noshiro/ts-utils';
import {
  type AsyncChildObservable,
  type ChildObservable,
  type Observable,
  type ObservableBase,
  type RootObservable,
  type SyncChildObservable,
} from '../types/index.mjs';
import {
  AsyncChildObservableClass,
  SyncChildObservableClass,
} from './child-observable-class.mjs';
import { RootObservableClass } from './root-observable-class.mjs';

/**
 * Inheritance
 *
 * ```txt
 * ObservableBase
 *   |
 *   +- SyncChildObservable    \                       \
 *   |                          +-- ChildObservable     \
 *   +- AsyncChildObservable   X                         +-- Observable
 *   |                          +-- ManagerObservable   /
 *   +- RootObservableType     /                       /
 * ```
 */

// type tests

expectType<Observable<number>, Observable<number>>('=');
expectType<Observable<string>, Observable<number>>('!<=');

// inheritance
expectType<ChildObservable<number>, ObservableBase<number>>('<=');
expectType<SyncChildObservable<number>, ChildObservable<number>>('<=');
expectType<AsyncChildObservable<number>, ChildObservable<number>>('<=');
expectType<RootObservable<number>, ObservableBase<number>>('<=');
expectType<SyncChildObservable<number>, ChildObservable<number>>('<=');
expectType<Observable<number>, ObservableBase<number>>('<=');
expectType<ObservableBase<number>, Observable<number>>('!<=');
expectType<ChildObservable<number>, Observable<number>>('<=');

// ObservableBase is covariant
expectType<ObservableBase<1>, ObservableBase<number>>('<=');
expectType<ObservableBase<number>, ObservableBase<1>>('!<=');
// Observable is covariant
expectType<Observable<1>, Observable<number>>('<=');
expectType<Observable<number>, Observable<1>>('!<=');

const root = new RootObservableClass({
  initialValue: Maybe.some(0),
});

expectType<typeof root, RootObservable<number>>('<=');

const syncChild = new SyncChildObservableClass({
  parents: [root],
  initialValue: Maybe.some(0),
});
expectType<typeof syncChild, SyncChildObservable<number>>('<=');

const asyncChild = new AsyncChildObservableClass({
  parents: [root],
  initialValue: Maybe.some(0),
});
expectType<typeof asyncChild, AsyncChildObservable<number>>('<=');

test('SyncChildObservableClass', () => {
  expect(syncChild.depth).toBe(1);
});
test('AsyncChildObservableClass', () => {
  expect(asyncChild.depth).toBe(1);
});
