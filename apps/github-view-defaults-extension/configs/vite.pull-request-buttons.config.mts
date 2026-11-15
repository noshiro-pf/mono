import { defineConfig } from 'vite';
import { scriptConfig } from './script.config.mjs';

/** The content script that puts the buttons on GitHub's pull requests. */
export default defineConfig(
  scriptConfig({
    entry: 'src/pull-request-buttons.mts',
    globalName: 'githubViewDefaultsPullRequestButtons',
    first: false,
  }),
);
