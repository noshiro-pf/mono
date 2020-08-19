import { idfn } from '../others';
import { mapEach } from './map-each';
import { WithPromiseState } from './with-promise-state';

export const mapP = <P, PR = P, E = never, S = never>(
  mapFn: (value: P) => PR
): ((target: WithPromiseState<P, E, S>) => WithPromiseState<PR, E, S>) =>
  mapEach<P, E, S, PR, E, S>(mapFn, idfn, idfn);
