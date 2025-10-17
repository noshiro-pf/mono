import { type UpdateRepositoryRequest } from 'octokit-safe-types';
import { Obj } from 'ts-data-forge';
import { validationErrorsToMessages } from 'ts-fortress';
import 'ts-repo-utils';
import {
  repositorySettingsDir,
  repositorySettingsJsonName,
} from '../constants.mjs';
import { getRepositorySettings, updateRepository } from './api/index.mjs';
import { backupRepositorySettings } from './backup.mjs';
import {
  type RepositoryKeysToPick,
  repositoryKeysToPick,
  RepositoryPicked,
} from './constants.mjs';

const readSettings = async (): Promise<RepositoryPicked> => {
  const settingsText = await fs.readFile(
    path.resolve(repositorySettingsDir, repositorySettingsJsonName),
    {
      encoding: 'utf8',
    },
  );

  const validationResult = RepositoryPicked.validate(JSON.parse(settingsText));

  if (Result.isErr(validationResult)) {
    throw new Error(
      validationErrorsToMessages(validationResult.value).join('\n'),
    );
  }

  return validationResult.value;
};

await backupRepositorySettings(false);

const settings = await readSettings();

await updateRepository({
  payload: {
    // name: settings.name,
    // description: settings.description ?? undefined,
    // homepage: settings.homepage ?? undefined,
    // private: settings.private,
    // visibility: settings.visibility === 'public' ? 'public' : 'private',
    security_and_analysis: settings.security_and_analysis,
    has_issues: settings.has_issues,
    has_projects: settings.has_projects,
    has_wiki: settings.has_wiki,
    // is_template: settings.is_template,
    // default_branch: settings.default_branch,
    allow_squash_merge: settings.allow_squash_merge,
    allow_merge_commit: settings.allow_merge_commit,
    allow_rebase_merge: settings.allow_rebase_merge,
    allow_auto_merge: settings.allow_auto_merge,
    delete_branch_on_merge: settings.delete_branch_on_merge,
    allow_update_branch: settings.allow_update_branch,
    use_squash_pr_title_as_default: settings.use_squash_pr_title_as_default,
    squash_merge_commit_title: settings.squash_merge_commit_title,
    squash_merge_commit_message: settings.squash_merge_commit_message,
    merge_commit_title: settings.merge_commit_title,
    merge_commit_message: settings.merge_commit_message,
    // archived: settings.archived,
    // NOTE: "RequestError [HttpError]: Allow forks can only be changed on org-owned repositories"
    // allow_forking: settings.allow_forking,
    web_commit_signoff_required: settings.web_commit_signoff_required,
  } satisfies Pick<UpdateRepositoryRequest, RepositoryKeysToPick>,
});

// update local setting file
{
  const repositorySettings = await getRepositorySettings();

  const str = JSON.stringify(
    Obj.pick(repositorySettings, repositoryKeysToPick),
    undefined,
    2,
  );

  await fs.writeFile(
    path.resolve(repositorySettingsDir, repositorySettingsJsonName),
    str,
  );

  await fs.writeFile(
    path.resolve(repositorySettingsDir, 'bk', repositorySettingsJsonName),
    str,
  );

  await $('pnpm run fmt');
}
