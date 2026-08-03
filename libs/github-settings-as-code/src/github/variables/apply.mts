#!/usr/bin/env node
import 'dotenv/config';
import { isDirectlyExecuted } from 'ts-repo-utils';
import {
  createRepoVariable,
  listRepoVariables,
  updateRepoVariable,
} from './api/index.mjs';

export const applyVariables = async (): Promise<void> => {
  const variables = [
    {
      // noshiro-dependabot-auto-merge-bot (App ID: 1442916)
      name: 'DEPENDABOT_AUTO_MERGE_BOT_CLIENT_ID',
      value: 'Iv23liQSNiSTcy3Dt99I',
    },
    {
      // noshiro-semantic-release-bot (App ID: 1442563)
      name: 'SEMANTIC_RELEASE_GIT_PERMISSION_BOT_CLIENT_ID',
      value: 'Iv23liAmv2bgTYTkv2pt',
    },
    {
      // noshiro-changesets-release-bot (App ID: 1576218)
      name: 'CHANGESETS_BOT_CLIENT_ID',
      value: 'Iv23limuZKrTEcXmN0lp',
    },
    {
      // noshiro-repo-settings-bot (App ID: 4476573)
      name: 'REPO_SETTINGS_BOT_CLIENT_ID',
      value: 'Iv23ctr4Lq9H3wOYRQrD',
    },
  ] as const;

  const variableListSaved = await listRepoVariables();

  const variablesSaved: ReadonlySet<string> = new Set(
    variableListSaved.map((v) => v.name),
  );

  for (const variable of variables) {
    const found = variablesSaved.has(variable.name);

    await (found ? updateRepoVariable(variable) : createRepoVariable(variable));
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  await applyVariables();
}
