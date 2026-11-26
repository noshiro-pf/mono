import { Arr, asUint32 } from 'ts-data-forge';
import {
  listDeploymentBranchPoliciesWith,
  type DeploymentBranchPolicy,
} from './list-deployment-branch-policies-with.mjs';

const policyNumbered = (n: number): DeploymentBranchPolicy =>
  ({ id: n, name: `release/${n.toString()}`, type: 'branch' }) as const;

describe(listDeploymentBranchPoliciesWith, () => {
  test('reads every page of 130 policies, 100 a page', async () => {
    const all = Arr.seq(asUint32(130)).map((i) => policyNumbered(i + 1));

    const mut_requested: (readonly [page: number, perPage: number])[] = [];

    const policies = await listDeploymentBranchPoliciesWith((page, perPage) => {
      mut_requested.push([page, perPage]);

      return Promise.resolve(all.slice((page - 1) * perPage, page * perPage));
    });

    assert.deepStrictEqual(policies, all);

    assert.deepStrictEqual(mut_requested, [
      [1, 100],
      [2, 100],
    ]);
  });
});
