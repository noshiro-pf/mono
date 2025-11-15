#!/usr/bin/env node

import 'dotenv/config';
import {
  applyRepositorySettings,
  applyRulesets,
  applyVariables,
} from '../github/index.mjs';

const runApplyAll = async (): Promise<void> => {
  await applyVariables();

  await applyRulesets();

  await applyRepositorySettings();
};

await runApplyAll();
