import { defineConfig } from 'vite';
import { scriptConfig } from './script.config.mjs';

/** The service worker. */
export default defineConfig(
  scriptConfig({
    entry: 'src/background.mts',
    globalName: 'githubViewDefaultsBackground',
    first: false,
  }),
);
