import * as path from 'node:path';
import { defineConfig } from 'vite';
import { makeBuildId } from '../scripts/build-id.mjs';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';

/**
 * The content script's own build.
 *
 * A content script is evaluated as a classic script, not as a module, so it
 * cannot carry `import` statements — which rules out the code-splitting output
 * of the main build. Library mode with the `iife` format emits one
 * self-contained file, and `emptyOutDir: false` keeps it from wiping what the
 * main build just produced. Run this second; `pnpm run build` does.
 */
export default defineConfig({
  root: workspaceRootPath,

  // Every build gets a name, which the page shows. See `scripts/build-id.mts`.
  define: {
    SPLIT_VIEW_BUILD_ID: JSON.stringify(makeBuildId()),
    SPLIT_VIEW_DIAGNOSTICS: JSON.stringify(false),
  },

  build: {
    outDir: path.resolve(workspaceRootPath, 'dist'),
    emptyOutDir: false,
    copyPublicDir: false,
    sourcemap: true,
    target: 'chrome116',

    lib: {
      entry: path.resolve(workspaceRootPath, 'src/frame-agent.mts'),
      formats: ['iife'],
      name: 'splitViewFrameAgent',
      fileName: (): string => 'frame-agent.js',
    },
  },
});
