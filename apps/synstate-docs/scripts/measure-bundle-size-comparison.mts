import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { measureBundleSizeComparison } from './bundle-size-comparison.mjs';
import { workspaceRootPath } from './workspace-root-path.mjs';

/**
 * Measures the bundle-size comparison and records it in
 * `src/data/bundle-size-comparison.json`, which `gen:bundle-size` embeds into
 * the Bundle Size pages. Run by `pnpm run bundle-size`, after `ws:build:deps`:
 * synstate and its dependencies are bundled from their `dist/`.
 */
const outputPath = path.resolve(
  workspaceRootPath,
  'src/data/bundle-size-comparison.json',
);

console.info('Measuring the libraries of the benchmark...');

const comparison = await measureBundleSizeComparison();

// eslint-disable-next-line security/detect-non-literal-fs-filename
await fs.writeFile(
  outputPath,
  `${JSON.stringify(comparison, undefined, 2)}\n`,
  'utf8',
);

console.info(`✓ Wrote ${outputPath}`);
