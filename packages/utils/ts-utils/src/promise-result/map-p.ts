import { idfn } from '../others';
import { mapEach } from './map-each';
import { PromiseResult } from './promise-result-type';

export const mapP = <P, PR = P, E = never, S = never>(
  mapFn: (value: P) => PR
): ((target: PromiseResult<P, E, S>) => PromiseResult<PR, E, S>) =>
  mapEach<P, E, S, PR, E, S>(mapFn, idfn, idfn);
