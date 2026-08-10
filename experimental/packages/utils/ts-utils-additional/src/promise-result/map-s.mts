import { idfn } from '@noshiro/ts-utils';
import { mapEach } from './map-each.mjs';
import { type PromiseState } from './promise-result-type.mjs';

export const mapS = <S, SR = S, P = never, E = never>(
  mapFn: (value: S) => SR,
): ((target: PromiseState<P, E, S>) => PromiseState<P, E, SR>) =>
  mapEach<P, E, S, P, E, SR>(idfn, idfn, mapFn);
