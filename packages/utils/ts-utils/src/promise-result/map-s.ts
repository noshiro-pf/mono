import { idfn } from '../others';
import { mapEach } from './map-each';
import { PromiseResult } from './promise-result-type';

export const mapS = <S, SR = S, P = never, E = never>(
  mapFn: <SR>(value: S) => SR
): ((target: PromiseResult<P, E, S>) => PromiseResult<P, E, SR>) =>
  mapEach<P, E, S, P, E, SR>(idfn, idfn, mapFn);
