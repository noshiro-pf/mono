import { idfn } from '../others';
import { mapEach } from './map-each';
import { PromiseState } from './promise-result-type';

export const mapE = <E, ER = E, P = never, S = never>(
  mapFn: <ER>(value: E) => ER
): ((target: PromiseState<P, E, S>) => PromiseState<P, ER, S>) =>
  mapEach<P, E, S, P, ER>(idfn, mapFn, idfn);
