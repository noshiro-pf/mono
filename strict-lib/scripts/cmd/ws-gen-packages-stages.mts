#!/usr/bin/env tsx

import { runInHarnesses } from '../run-in-harnesses.mjs';

// `gen:packages` runs only the package-generation slice (`genPackages` onward),
// which reads the committed `output*/lib-files` and re-stamps the
// per-version `-source` version onto every generated package. It does NOT
// touch `temp/` (the gitignored codemod intermediates), so it works on a cold
// CI checkout and is much faster than a full `gen:lib`. This is what the
// release flow needs: propagate the changeset-bumped version, nothing else.

await runInHarnesses({ cmd: 'gen:packages', defaultConcurrency: 3 });
