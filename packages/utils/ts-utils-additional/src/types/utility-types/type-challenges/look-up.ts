import { expectType } from '@noshiro/ts-utils';

export type LookUp<
  R extends { kind: string },
  Kind extends R['kind']
> = R extends R ? (R['kind'] extends Kind ? R : never) : never;

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

expectType<LookUp<Cat | Dog, 'cat' | 'dog'>, Cat | Dog>('=');
expectType<LookUp<Cat | Dog, 'dog'>, Dog>('=');
expectType<LookUp<Cat | Dog, 'cat'>, Cat>('=');

expectType<LookUp2<Cat | Dog, 'cat' | 'dog'>, Cat | Dog>('=');
expectType<LookUp2<Cat | Dog, 'dog'>, Dog>('=');
expectType<LookUp2<Cat | Dog, 'cat'>, Cat>('=');
