import { idfn } from '../others';
import { mapEach } from './map-each';
import { PromiseResult } from './promise-result-type';

export const mapE = <E, ER = E, P = never, S = never>(
  mapFn: <ER>(value: E) => ER
): ((target: PromiseResult<P, E, S>) => PromiseResult<P, ER, S>) =>
  mapEach<P, E, S, P, ER, S>(idfn, mapFn, idfn);
