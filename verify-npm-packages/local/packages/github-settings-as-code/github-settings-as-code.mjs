import * as assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import * as path from 'node:path';
import * as util from 'node:util';

const execFileAsync = util.promisify(execFile);

// Executables only. Anything past `--help` would need GitHub credentials, so
// this checks that the command loads and reports its usage.
const bin = path.resolve(
  import.meta.dirname,
  'node_modules',
  '.bin',
  'repo-settings',
);

const running = execFileAsync(bin, ['--help'], { encoding: 'utf8' });

// The promisified `execFile` leaves stdin an open pipe; nothing is written to it.
running.child.stdin.end();

const { stdout: help } = await running;

assert.match(help, /Usage: repo-settings/u);
assert.match(help, /backup/u);

console.info('github-settings-as-code ok');
