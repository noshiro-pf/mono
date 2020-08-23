import { idfn } from '../others';
import { mapEach } from './map-each';
import { WithPromiseState } from './with-promise-state';

export const mapS = <S, SR = S, P = never, E = never>(
  mapFn: <SR>(value: S) => SR
): ((target: WithPromiseState<P, E, S>) => WithPromiseState<P, E, SR>) =>
  mapEach<P, E, S, P, E, SR>(idfn, idfn, mapFn);
