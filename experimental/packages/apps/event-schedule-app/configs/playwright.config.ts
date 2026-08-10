import { definePlaywrightConfig } from '@noshiro/mono-configs/define-playwright-config';
import path from 'node:path';

const thisDir = import.meta.dirname;

export default definePlaywrightConfig({
  baseURL: 'http://localhost:5180',
  testDir: path.resolve(thisDir, '..', 'e2e'),
  webServer: [
    {
      url: 'http://localhost:5180',
      command: 'pnpm run start:dev-server',
    },
    {
      url: 'http://localhost:5002',
      command: 'pnpm exec firebase emulators:start --only firestore,functions',
    },
  ],
});
