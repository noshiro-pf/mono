import { defineConfig } from 'vite';
import { contentScriptConfig } from './content-script.config.mjs';

/** The content script that runs inside every pane. */
export default defineConfig(
  contentScriptConfig({
    name: 'frame-agent',
    globalName: 'splitViewFrameAgent',
  }),
);
