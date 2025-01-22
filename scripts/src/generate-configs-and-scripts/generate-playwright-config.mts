import path from 'node:path';
import { playwrightConfigName, workspaceConfigsDirName } from './constants.mjs';
import { workspaceConfig } from './workspace-config.mjs';
import { writeDirAndFileAndPrintDone } from './write-dir-and-file-and-print-done.mjs';

export const generatePlaywrightConfig = async (
  workspaceLocation: string,
  packageName: string,
): Promise<void> => {
  const cfg = workspaceConfig[packageName];

  if (cfg === undefined) {
    throw new Error(`workspaceConfig for package "${packageName}" not found.`);
  }

  if (cfg.utilOrApp !== 'app') return;

  const depth = workspaceLocation.split('/').length + 1;

  const pathPrefixToRoot = Array.from({ length: depth }, () => '..').join('/');

  const content = [
    "import { toThisDir } from '@noshiro/mono-utils';",
    "import path from 'node:path';",
    `import { definePlaywrightConfig } from '${pathPrefixToRoot}/configs/define-playwright-config.mjs';`,
    '',
    'const thisDir = toThisDir(import.meta.url);',
    '',
    'export default definePlaywrightConfig({',
    "  baseURL: 'http://localhost:5180',",
    "  testDir: path.resolve(thisDir, '..', 'e2e'),",
    '  webServer: [',
    '    {',
    "      url: 'http://localhost:5180',",
    "      command: 'yarn start:dev-server',",
    '    },',
    '  ],',
    '});',
  ].join('\n');

  await writeDirAndFileAndPrintDone(
    path.resolve(workspaceLocation, workspaceConfigsDirName),
    playwrightConfigName,
    content,
    packageName,
  );
};
