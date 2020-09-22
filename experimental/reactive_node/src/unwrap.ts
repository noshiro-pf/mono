import { RNode } from './RNode';
import { RNodeValueOf } from './types/RNodeValueOf';

export type Unwrap<S> = { [P in keyof S]: RNodeValueOf<S[P]> };

export const unwrapCurr = <T extends RNode<any>[]>(...rns: T): Unwrap<T> =>
  rns.map(e => e.value) as Unwrap<T>;
