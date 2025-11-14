import 'ts-repo-utils';
import {
  createRepoVariable,
  listRepoVariables,
  updateRepoVariable,
} from './api/index.mjs';

const variables = [
  {
    name: 'DEPENDABOT_AUTO_MERGE_BOT_APP_ID',
    value: '1442916',
  },
  {
    name: 'SEMANTIC_RELEASE_GIT_PERMISSION_BOT_APP_ID',
    value: '1442563',
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
