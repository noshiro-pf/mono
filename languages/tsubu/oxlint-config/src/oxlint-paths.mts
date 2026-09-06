import { createRequire } from 'node:module';
import * as path from 'node:path';

/** Root of this package — the cwd oxlint must run in (jsPlugins / tsgolint resolve from here). */
export const packageRootPath = path.resolve(import.meta.dirname, '..');

/** The Tsubu lint configuration file. */
export const oxlintConfigPath = path.join(packageRootPath, 'oxlintrc.jsonc');

/** The oxlint CLI entry (a Node script) of the pinned oxlint version. */
export const oxlintBinPath = path.join(
  path.dirname(createRequire(import.meta.url).resolve('oxlint/package.json')),
  'bin/oxlint',
);
