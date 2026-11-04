#!/usr/bin/env tsx

import { runInHarnesses } from '../run-in-harnesses.mjs';

await runInHarnesses({ cmd: 'gen:with-codemod-fixed', defaultConcurrency: 1 });
