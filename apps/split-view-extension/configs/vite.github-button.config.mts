import { defineConfig } from 'vite';
import { contentScriptConfig } from './content-script.config.mjs';

/** The content script that puts the "Split view" button on GitHub. */
export default defineConfig(
  contentScriptConfig({
    entry: 'src/github-button.mts',
    globalName: 'splitViewGitHubButton',
  }),
);
