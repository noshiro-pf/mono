import { idfn } from '@noshiro/ts-utils';
import { mapEach } from './map-each.mjs';
import { type PromiseState } from './promise-result-type.mjs';

export const mapP = <P, PR = P, E = never, S = never>(
  mapFn: (value: P) => PR,
): ((target: PromiseState<P, E, S>) => PromiseState<PR, E, S>) =>
  mapEach<P, E, S, PR>(mapFn, idfn, idfn);
