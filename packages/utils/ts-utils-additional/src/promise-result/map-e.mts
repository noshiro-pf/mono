import { idfn } from '@noshiro/ts-utils';
import { mapEach } from './map-each.mjs';
import { type PromiseState } from './promise-result-type.mjs';

export const mapE = <E, ER = E, P = never, S = never>(
  mapFn: (value: E) => ER,
): ((target: PromiseState<P, E, S>) => PromiseState<P, ER, S>) =>
  mapEach<P, E, S, P, ER>(idfn, mapFn, idfn);
