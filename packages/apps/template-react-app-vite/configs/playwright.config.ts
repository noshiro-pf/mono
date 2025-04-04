import { toThisDir } from '@noshiro/mono-utils';
import path from 'node:path';
import { definePlaywrightConfig } from '../../../../configs/define-playwright-config.mjs';

const thisDir = toThisDir(import.meta.url);

export default definePlaywrightConfig({
  baseURL: 'http://localhost:5180',
  testDir: path.resolve(thisDir, '..', 'e2e'),
  webServer: [
    {
      url: 'http://localhost:5180',
      command: 'yarn start:dev-server',
    },
  ],
});
