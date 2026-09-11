import { type EndpointKeys } from 'octokit-safe-types';
import { Arr } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { Result } from 'ts-repo-utils';
import { octokitHeaders, OWNER, REPO } from '../../constants.mjs';
import { octokit } from '../../octokit.mjs';
import { EnvironmentSettings } from '../constants.mjs';

/**
 * Settings > Environments の現在値を、宣言ファイルと同じ形にして返す。
 *
 * 名前順に整える。 GitHub が返す順は作成順で、環境を 1 つ足しただけで
 * `bk/` の中身が並び替わると差分が読めなくなるため。
 */
export const getAllEnvironments = async (): Promise<
  readonly EnvironmentSettings[]
> => {
  // https://docs.github.com/rest/deployments/environments#list-environments
  //
  // per_page の上限。環境は数個しか無く、 2 ページ目が要る状況は
  // 「 GUI で何かが大量に作られた」ときだけなので、ページングは張らない。
  const response = await octokit.request(
    'GET /repos/{owner}/{repo}/environments' satisfies EndpointKeys,
    { owner: OWNER, repo: REPO, headers: octokitHeaders, per_page: 100 },
  );

  const environments = response.data.environments ?? [];

  const settings = await Promise.all(
    environments.map(async (environment) => {
      const policy = environment.deployment_branch_policy ?? undefined;

      return EnvironmentSettings.fill({
        name: environment.name,
        ...parseProtectionRules(environment.protection_rules),
        deployment_branch_policy:
          policy === undefined
            ? null
            : {
                protected_branches: policy.protected_branches,
                custom_branch_policies: policy.custom_branch_policies,
              },
        deployment_branch_policies:
          policy?.custom_branch_policies === true
            ? await getDeploymentBranchPolicyNames(environment.name)
            : [],
      });
    }),
  );

  return settings.toSorted((a, b) => a.name.localeCompare(b.name));
};

/** 宣言ファイルに載る形。 `id` は GitHub 側の都合なので落とす。 */
const getDeploymentBranchPolicyNames = async (
  environmentName: string,
): Promise<readonly Readonly<{ name: string; type: 'branch' | 'tag' }>[]> => {
  const policies = await getDeploymentBranchPolicies(environmentName);

  return policies.map(({ name, type }) => ({ name, type }));
};

/** 「 Selected branches and tags 」に登録されている pattern を列挙する。 */
export const getDeploymentBranchPolicies = async (
  environmentName: string,
): Promise<readonly DeploymentBranchPolicy[]> => {
  // https://docs.github.com/rest/deployments/branch-policies#list-deployment-branch-policies
  const response = await octokit.request(
    'GET /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies' satisfies EndpointKeys,
    {
      owner: OWNER,
      repo: REPO,
      environment_name: environmentName,
      headers: octokitHeaders,
      per_page: 100,
    },
  );

  return response.data.branch_policies.map((policy) => ({
    id: policy.id ?? 0,
    name: policy.name ?? '',
    type: policy.type === 'tag' ? 'tag' : 'branch',
  }));
};

export type DeploymentBranchPolicy = Readonly<{
  id: number;
  name: string;
  type: 'branch' | 'tag';
}>;

/**
 * GET が返す `protection_rules` を PUT の body の形に戻す。
 *
 * GitHub は有効な保護ルールだけを配列で返し、その要素の `type` は openapi の
 * 型定義では素の `string` — つまり判別可能 union になっていないので、絞り込みが
 * 効かない。実データを ts-fortress で読み直すほうが、上流の型に合わせて
 * キャストを書くより素直で、形が変わったときに黙って通り過ぎることもない。
 */
const parseProtectionRules = (
  protectionRules: unknown,
): Readonly<{
  wait_timer: number;
  prevent_self_review: boolean;
  reviewers: readonly { type: 'User' | 'Team'; id: number }[];
}> => {
  const validationResult = ProtectionRules.validate(protectionRules ?? []);

  if (Result.isErr(validationResult)) {
    throw new Error(
      Arr.toUnshifted(
        'GitHub が返した environment の protection_rules を読めませんでした。',
      )(t.validationErrorsToMessages(validationResult.value)).join('\n'),
    );
  }

  const rules = validationResult.value;

  const waitTimer = rules.find((rule) => rule.type === 'wait_timer');

  const requiredReviewers = rules.find(
    (rule) => rule.type === 'required_reviewers',
  );

  return {
    wait_timer: waitTimer?.wait_timer ?? 0,
    prevent_self_review: requiredReviewers?.prevent_self_review ?? false,
    reviewers: (requiredReviewers?.reviewers ?? []).map((entry) => ({
      type: entry.type,
      id: entry.reviewer.id,
    })),
  };
};

const ProtectionRules = t.array(
  t.record({
    type: t.string(''),
    wait_timer: t.optional(t.number(0)),
    prevent_self_review: t.optional(t.boolean(false)),
    reviewers: t.optional(
      t.array(
        t.record({
          type: t.enumType(['User', 'Team'], {
            typeName: 'EnvironmentReviewerType',
            defaultValue: 'User',
          }),
          // `reviewer` は User / Team の完全な表現だが、書き戻しに要るのは id
          // だけ。 record は既定で余剰キーを通すので、残りはそのまま無視される。
          reviewer: t.record({ id: t.number(0) }),
        }),
      ),
    ),
  }),
  { typeName: 'EnvironmentProtectionRules' },
);
