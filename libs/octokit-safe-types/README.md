# octokit-safe-types

A library of readonly versions of Octokit types and their corresponding validators.

## Installation

```bash
npm add octokit-safe-types
```

## Usage

Each GitHub REST API payload is exported as a [ts-fortress](https://www.npmjs.com/package/ts-fortress) schema together with its readonly TypeScript type of the same name, so a response can be validated and typed in one step.

- Repository: `FullRepository`, `GetRepositoryResponse`, `UpdateRepositoryRequest`
- Rulesets: `RepositoryRuleset`, `RepositoryRule`, `RepositoryRulesetConditions`, `RepositoryRulesetBypassActor`, `GetRulesetResponse`, `GetAllRulesetsResponse`, `CreateRulesetRequest`, `UpdateRulesetRequest`

```ts
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
```
