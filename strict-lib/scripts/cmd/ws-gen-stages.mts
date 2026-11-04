#!/usr/bin/env tsx

import { runInHarnesses } from '../run-in-harnesses.mjs';

// `gen:lib` regenerates `output/` from the converter. The harness script is not
// called `gen`, so that `ws:gen` never reaches it.

await runInHarnesses({ cmd: 'gen:lib', defaultConcurrency: 3 });
