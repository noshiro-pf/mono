import * as assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import * as path from 'node:path';

// Executables only. Anything past `--help` would need GitHub credentials, so
// this checks that the command loads and reports its usage.
const bin = path.resolve(
  import.meta.dirname,
  'node_modules',
  '.bin',
  'repo-settings',
);

const help = execFileSync(bin, ['--help'], { encoding: 'utf8' });

assert.match(help, /Usage: repo-settings/u);
assert.match(help, /backup/u);

console.info('github-settings-as-code ok');
