import path from 'node:path';
import { toPositiveSafeInt, zeros } from '../ts-utils/index.mjs';
import { tsconfigTestJsonName, workspaceConfigsDirName } from './constants.mjs';
import { tsConfigExtendString } from './ts-config-extend-string.mjs';
import { workspaceConfig } from './workspace-config.mjs';
import { writeDirAndFileAndPrintDone } from './write-dir-and-file-and-print-done.mjs';

export const generateTsConfigForTest = async (
  workspaceLocation: string,
  packageName: string,
): Promise<void> => {
  const cfg = workspaceConfig[packageName];

  if (cfg === undefined) {
    throw new Error(`workspaceConfig for package "${packageName}" not found.`);
  }

  if (!cfg.gen.test) return;

  const depth = toPositiveSafeInt(workspaceLocation.split('/').length + 1);

  const pathPrefixToRoot = zeros(depth)
    .map(() => '..')
    .join('/');

  const content = [
    `{`,
    ...tsConfigExtendString(
      cfg.tsType,
      pathPrefixToRoot,
      tsconfigTestJsonName,
      cfg.isViteApp,
    ),
    ',',
    `  "include": [${cfg.srcDirs.map((d) => `"../${d}"`).join(', ')}],`,
    `}`,
    '',
  ].join('\n');

  await writeDirAndFileAndPrintDone(
    path.resolve(workspaceLocation, workspaceConfigsDirName),
    tsconfigTestJsonName,
    content,
    packageName,
  );
};
