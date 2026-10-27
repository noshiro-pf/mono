import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { isRecord } from 'ts-data-forge';
import { formatFiles, Result } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

const manifestPath = path.resolve(
  projectRootPath,
  'claude-plugin/.claude-plugin/plugin.json',
);

/**
 * Stamps the package's version into the Claude Code plugin's manifest, so
 * that the skill a user installs is the one written for the commands of the
 * same version. `changeset version` bumps `package.json` only; Claude Code
 * hands a user a new copy of the plugin only when `version` here changes.
 */
const genPluginVersion = async (): Promise<void> => {
  const packageJson: unknown = JSON.parse(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- fixed paths in this package
    await fs.readFile(path.resolve(projectRootPath, 'package.json'), 'utf8'),
  );

  const manifest: unknown = JSON.parse(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- fixed paths in this package
    await fs.readFile(manifestPath, 'utf8'),
  );

  if (
    !isRecord(packageJson) ||
    typeof packageJson['version'] !== 'string' ||
    !isRecord(manifest)
  ) {
    throw new Error('unexpected package.json or plugin.json');
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- fixed paths in this package
  await fs.writeFile(
    manifestPath,
    JSON.stringify({ ...manifest, version: packageJson['version'] }),
  );

  // Laid out as Prettier would, or every run leaves the tree dirty.
  if (Result.isErr(await formatFiles([manifestPath], { silent: true }))) {
    throw new Error(`failed to format ${manifestPath}`);
  }
};

await genPluginVersion();
