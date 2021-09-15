import { assertType } from '../test-type';

export type LookUp<
  R extends { kind: string },
  Kind extends R['kind']
> = R extends unknown ? (R['kind'] extends Kind ? R : never) : never;

type LookUp2<R extends { kind: string }, Kind extends R['kind']> = {
  [K in Kind]: R extends { kind: Kind } ? R : never;
}[Kind];

type Cat = {
  kind: 'cat';
  breeds: 'Abyssinian' | 'Bengal' | 'Curl' | 'Shorthair';
};

type Dog = {
  kind: 'dog';
  breeds: 'Boxer' | 'Brittany' | 'Bulldog' | 'Hound';
  color: 'black' | 'brown' | 'white';
};

assertType<TypeEq<LookUp<Cat | Dog, 'cat' | 'dog'>, Cat | Dog>>();
assertType<TypeEq<LookUp<Cat | Dog, 'dog'>, Dog>>();
assertType<TypeEq<LookUp<Cat | Dog, 'cat'>, Cat>>();

assertType<TypeEq<LookUp2<Cat | Dog, 'cat' | 'dog'>, Cat | Dog>>();
assertType<TypeEq<LookUp2<Cat | Dog, 'dog'>, Dog>>();
assertType<TypeEq<LookUp2<Cat | Dog, 'cat'>, Cat>>();
