import * as path from 'node:path';
import { type UserConfig } from 'vite';
import { makeBuildId } from '../scripts/build-id.mjs';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';

/**
 * The build of one content script.
 *
 * A content script is evaluated as a classic script, not as a module, so it
 * cannot carry `import` statements — which rules out the code-splitting output
 * of the main build. Library mode with the `iife` format emits one
 * self-contained file, and `emptyOutDir: false` keeps it from wiping what the
 * main build just produced. That format takes one entry per build, so each
 * content script has a config of its own made here. Run them after the main
 * build; `pnpm run build` does.
 */
export const contentScriptConfig = ({
  entry,
  globalName,
}: Readonly<{
  /** The source, relative to the package. */
  entry: string;
  /** The global the IIFE is assigned to, which nothing reads. */
  globalName: string;
}>): UserConfig => ({
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
      entry: path.resolve(workspaceRootPath, entry),
      formats: ['iife'],
      name: globalName,
      fileName: (): string => `${path.basename(entry, '.mts')}.js`,
    },
  },
});
