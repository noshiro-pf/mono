import { idfn } from '../others';
import { mapEach } from './map-each';
import { PromiseState } from './promise-result-type';

export const mapS = <S, SR = S, P = never, E = never>(
  mapFn: (value: S) => SR
): ((target: PromiseState<P, E, S>) => PromiseState<P, E, SR>) =>
  mapEach<P, E, S, P, E, SR>(idfn, idfn, mapFn);
