import * as assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

/**
 * Runs `file`, its output going to this process's (or nowhere, with
 * `stdio: 'ignore'`), and fails unless it exits 0.
 */
const run = (file, args, stdio = 'inherit') =>
  new Promise((resolve, reject) => {
    const child = spawn(file, args, { stdio });

    child.once('error', reject);

    child.once('close', (status) => {
      if (status === 0) {
        resolve();
      } else {
        reject(new Error(`${file} ${args.join(' ')} exited with ${status}`));
      }
    });
  });

// This package is executables only, so the check runs one the way a consumer
// would — through the bin symlink npm creates.
const bin = (name) =>
  path.resolve(import.meta.dirname, 'node_modules', '.bin', name);

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ts-codemod-cli-'));

const file = path.join(dir, 'target.mts');

// Two transformers in one run: `convert-to-readonly` on the annotation and
// `append-as-const` on the literal. The single command taking a `--transformer`
// per transformer is what replaced the one-command-per-transformer bins.
fs.writeFileSync(
  file,
  'export const xs: string[] = [];\nexport const o = { a: 1 };\n',
);

await run(bin('ts-codemod'), [
  '--transformer',
  'append-as-const',
  '--transformer',
  'convert-to-readonly',
  file,
]);

const transformed = fs.readFileSync(file, 'utf8');

assert.match(transformed, /readonly\s+string\[\]/u);
assert.match(transformed, /as const/u);

await run(bin('ts-codemod'), ['--help'], 'ignore');

fs.rmSync(dir, { recursive: true, force: true });

console.info('ts-codemod-cli ok');
