import * as assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

// This package is executables only, so the check runs one the way a consumer
// would — through the bin symlink npm creates.
const bin = (name) =>
  path.resolve(import.meta.dirname, 'node_modules', '.bin', name);

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ts-codemod-cli-'));

const file = path.join(dir, 'target.mts');

fs.writeFileSync(file, 'export const xs: string[] = [];\n');

execFileSync(bin('convert-to-readonly'), [file], { stdio: 'inherit' });

assert.match(fs.readFileSync(file, 'utf8'), /readonly\s+string\[\]/u);

for (const name of [
  'append-as-const',
  'convert-interface-to-type',
  'convert-to-readonly',
  'replace-any-with-unknown',
  'replace-record-with-unknown-record',
]) {
  execFileSync(bin(name), ['--help'], { stdio: 'ignore' });
}

fs.rmSync(dir, { recursive: true, force: true });

console.info('ts-codemod-cli ok');
