/* eslint-disable import-x/first */
import { type Endpoints } from '@octokit/types';

type GetRepositoryEndpoint = Endpoints['GET /repos/{owner}/{repo}'];

declare const octokit: Readonly<{
  request: (
    route: 'GET /repos/{owner}/{repo}',
    params: Readonly<GetRepositoryEndpoint['parameters']>,
  ) => Promise<GetRepositoryEndpoint['response']>;
}>;

const owner = 'noshiro-pf';

const repo = 'mono';

// embed-sample-code-ignore-above
import { GetRepositoryResponse } from 'octokit-safe-types';
import { Result } from 'ts-data-forge';

const res = await octokit.request('GET /repos/{owner}/{repo}', { owner, repo });

const validated = GetRepositoryResponse.validate(res.data);

if (Result.isOk(validated)) {
  const repository: GetRepositoryResponse = validated.value;

  console.log(repository.full_name); // "noshiro-pf/mono"
} else {
  console.error(validated.value);
}
