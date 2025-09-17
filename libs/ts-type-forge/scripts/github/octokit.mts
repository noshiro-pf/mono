import { Octokit } from '@octokit/core';

export const octokit = new Octokit({
  auth: process.env['PERSONAL_ACCESS_TOKEN'],
});
