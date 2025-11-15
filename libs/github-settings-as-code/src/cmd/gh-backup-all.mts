#!/usr/bin/env node

import 'dotenv/config';
import { backupRepositorySettings, backupRulesets } from '../github/index.mjs';

const runBackupAll = async (): Promise<void> => {
  await backupRulesets();

  await backupRepositorySettings();
};

await runBackupAll();
