import * as assert from 'node:assert/strict';
import { $, Result } from 'ts-repo-utils';

// `$` runs a command and returns its outcome as a value.
const ok = await $('node --version', { silent: true });

assert.equal(Result.isOk(ok), true);
assert.match(Result.isOk(ok) ? ok.value.stdout : '', /^v\d+\./u);

const failed = await $('exit 3', { silent: true });

assert.equal(Result.isErr(failed), true);

console.info('ts-repo-utils ok');
