import { type components, type paths } from '@octokit/openapi-types';
import { expectType } from 'ts-data-forge';
import type * as t from 'ts-fortress';
import { FullRepository } from './full-repository.mjs';

export const GetRepositoryResponse = FullRepository;

export type GetRepositoryResponse = t.TypeOf<typeof GetRepositoryResponse>;

expectType<
  GetRepositoryResponse,
  DeepReadonly<
    paths['/repos/{owner}/{repo}']['get']['responses']['200']['content']['application/json']
  >
>('=');

expectType<
  components['schemas']['full-repository'],
  paths['/repos/{owner}/{repo}']['get']['responses']['200']['content']['application/json']
>('=');
