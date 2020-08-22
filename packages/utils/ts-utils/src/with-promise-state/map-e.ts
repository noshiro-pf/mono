import { idfn } from '../others';
import { mapEach } from './map-each';
import { WithPromiseState } from './with-promise-state';

export const mapE = <E, ER = E, P = never, S = never>(
  mapFn: <ER>(value: E) => ER
): ((target: WithPromiseState<P, E, S>) => WithPromiseState<P, ER, S>) =>
  mapEach<P, E, S, P, ER, S>(idfn, mapFn, idfn);
