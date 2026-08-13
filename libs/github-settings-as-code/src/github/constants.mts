import * as path from 'node:path';
import { resolveTargetRepo } from './resolve-target-repo.mjs';

const targetRepo = await resolveTargetRepo();

export const OWNER: string = targetRepo.owner;

export const REPO: string = targetRepo.repo;

// Named `repo-settings` rather than `github`, which read as a sibling of
// `.github` and invited the guess that workflows lived here too.
const settingsDir = path.resolve(process.cwd(), './repo-settings');

export const settingsJsonName = 'settings.json';

export const repositorySettingsDir = path.resolve(
  settingsDir,
  './repository-settings',
);

export const actionsSettingsDir = path.resolve(
  settingsDir,
  './actions-settings',
);

export const pagesSettingsDir = path.resolve(settingsDir, './pages');

export const rulesetsDir = path.resolve(settingsDir, './rulesets');

export const octokitHeaders = {
  'X-GitHub-Api-Version': '2022-11-28',
} as const;
