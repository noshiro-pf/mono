import * as path from 'node:path';
import { resolveTargetRepo } from './resolve-target-repo.mjs';

const targetRepo = await resolveTargetRepo();

export const OWNER: string = targetRepo.owner;

export const REPO: string = targetRepo.repo;

const githubDir = path.resolve(process.cwd(), './github');

export const settingsJsonName = 'settings.json';

export const repositorySettingsDir = path.resolve(
  githubDir,
  './repository-settings',
);

export const actionsSettingsDir = path.resolve(githubDir, './actions-settings');

export const pagesSettingsDir = path.resolve(githubDir, './pages');

export const rulesetsDir = path.resolve(githubDir, './rulesets');

export const octokitHeaders = {
  'X-GitHub-Api-Version': '2022-11-28',
} as const;
