import {
  FullRepository,
  type UpdateRepositoryRequest,
} from 'octokit-safe-types';
import { expectType } from 'ts-data-forge';
import * as t from 'ts-fortress';

const keysToPickBase = [
  'allow_auto_merge',
  'allow_forking',
  'allow_merge_commit',
  'allow_rebase_merge',
  'allow_squash_merge',
  'allow_update_branch',
  'archived',
  'default_branch',
  'delete_branch_on_merge',
  'description',
  'has_issues',
  'has_projects',
  'has_wiki',
  'homepage',
  'is_template',
  'merge_commit_message',
  'merge_commit_title',
  'name',
  'private',
  'security_and_analysis',
  'squash_merge_commit_message',
  'squash_merge_commit_title',
  'use_squash_pr_title_as_default',
  'visibility',
  'web_commit_signoff_required',
] as const satisfies readonly (keyof FullRepository)[];

const keysToDropList = [
  'name',
  'private',
  'description',
  'homepage',
  'default_branch',
  'is_template',
  'archived',
  'visibility',

  // NOTE: "RequestError [HttpError]: Allow forks can only be changed on org-owned repositories"
  'allow_forking',
] as const;

const keysToDrop: ReadonlySet<(typeof keysToPickBase)[number]> = new Set(
  keysToDropList satisfies readonly (typeof keysToPickBase)[number][],
);

export const repositoryKeysToPick = keysToPickBase.filter(
  (k) => !keysToDrop.has(k),
);

export type RepositoryKeysToPick = StrictExclude<
  (typeof keysToPickBase)[number],
  (typeof keysToDropList)[number]
>;

expectType<keyof UpdateRepositoryRequest, RepositoryKeysToPick>('>=');

export const RepositoryPicked = t.pick(FullRepository, repositoryKeysToPick);
export type RepositoryPicked = t.TypeOf<typeof RepositoryPicked>;
