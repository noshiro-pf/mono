import * as assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { sh } from 'pr-merge-queue';

// Executables: anything past `--help` would need GitHub credentials and a
// repository, so this checks that each command loads and reports its usage.
// Every one the installed package declares, so that a new command is
// checked without being listed here.
const commands = Object.keys(
  JSON.parse(
    fs.readFileSync(
      path.resolve(
        import.meta.dirname,
        'node_modules',
        'pr-merge-queue',
        'package.json',
      ),
      'utf8',
    ),
  ).bin,
);

// And the ones it is known to have, so that one dropped from `bin` fails
// rather than shrinking the list.
for (const command of [
  'claim-pr',
  'open-pr',
  'pr-report',
  'push-fixed-pr',
  'report-unowned-prs',
  'run-unblock-prs-skill',
  'start-issue',
  'unblock-prs',
]) {
  assert.ok(commands.includes(command), `pr-merge-queue has no ${command}`);
}

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
