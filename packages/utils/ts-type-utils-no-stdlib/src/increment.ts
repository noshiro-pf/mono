import { type ListType } from './list';
import { type MakeTuple } from './make-tuple';

export type Increment<N extends number> = (readonly [
  0,
  ...MakeTuple<0, N>
])['length'];

export type Decrement<N extends number> = ListType.Tail<
  MakeTuple<0, N>
>['length'];
