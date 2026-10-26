import * as assert from 'node:assert/strict';
import {
  findMergeAfterCycles,
  MERGE_QUEUED_LABEL,
  parseMergeAfter,
} from 'pr-report-core';

// The package is pure decisions over what a reader fetched, so the smoke
// test needs no network: read a trailer, find a cycle, name a label.
assert.deepEqual(parseMergeAfter('Merge-After: #12, #14'), [12, 14]);

assert.deepEqual(
  findMergeAfterCycles(
    new Map([
      [12, [14]],
      [14, [12]],
    ]),
  ),
  [[12, 14]],
);

assert.equal(MERGE_QUEUED_LABEL, 'merge-queued');

console.info('pr-report-core ok');
