import * as assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import * as path from 'node:path';
import { sh } from 'pr-merge-queue';

// Executables: anything past `--help` would need GitHub credentials and a
// repository, so this checks that each command loads and reports its usage.
const commands = [
  'claim-pr',
  'open-pr',
  'pr-report',
  'push-fixed-pr',
  'report-unowned-prs',
  'unblock-prs',
];

for (const command of commands) {
  const bin = path.resolve(
    import.meta.dirname,
    'node_modules',
    '.bin',
    command,
  );

  const help = execFileSync(bin, ['--help'], { encoding: 'utf8' });

  assert.match(help, new RegExp(`Usage: ${command}`, 'u'));
}

// And the library entry point.
assert.equal(sh("it's"), String.raw`'it'\''s'`);

console.info('pr-merge-queue ok');
