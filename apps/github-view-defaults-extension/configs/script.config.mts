import * as path from 'node:path';
import type { UserConfig } from 'vite';
import { workspaceRootPath } from '../scripts/workspace-root-path.mjs';

/**
 * The build of one script the manifest names: a content script or the service
 * worker.
 *
 * A content script is evaluated as a classic script, not as a module, so it
 * cannot carry `import` statements. Library mode with the `iife` format emits
 * one self-contained file — and takes one entry per build, so each script has a
 * config of its own made here. The service worker is built the same way and
 * loaded as a classic worker, which the manifest leaves it as by naming no
 * `type`.
 *
 * `vite.config.mts` builds the first of them, and is the one that empties
 * `dist/` and copies `public/` into it; the others keep what it wrote
 * (`emptyOutDir: false`). `pnpm run build` runs them in that order.
 */
export const scriptConfig = ({
  entry,
  globalName,
  first,
}: Readonly<{
  /** The source, relative to the package. */
  entry: string;
  /** The global the IIFE is assigned to, which nothing reads. */
  globalName: string;
  /** Whether this is the build that starts `dist/` afresh. */
  first: boolean;
}>): UserConfig => ({
  root: workspaceRootPath,

  publicDir: first && 'public',

  build: {
    outDir,
    emptyOutDir: first,
    sourcemap: true,

    // Only ever loaded by the Chrome the manifest's `minimum_chrome_version`
    // names, so there is no reason to down-level anything.
    target: 'chrome116',

    lib: {
      entry: path.resolve(workspaceRootPath, entry),
      formats: ['iife'],
      name: globalName,
      fileName: (): string => `${path.basename(entry, '.mts')}.js`,
    },
  },
});

export const outDir = path.resolve(workspaceRootPath, 'dist');
