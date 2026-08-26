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

// Two transformers in one run: `convert-to-readonly` on the annotation and
// `append-as-const` on the literal. The single command taking a `--transformer`
// per transformer is what replaced the one-command-per-transformer bins.
fs.writeFileSync(
  file,
  'export const xs: string[] = [];\nexport const o = { a: 1 };\n',
);

execFileSync(
  bin('ts-codemod'),
  [
    '--transformer',
    'append-as-const',
    '--transformer',
    'convert-to-readonly',
    file,
  ],
  { stdio: 'inherit' },
);

const transformed = fs.readFileSync(file, 'utf8');

assert.match(transformed, /readonly\s+string\[\]/u);
assert.match(transformed, /as const/u);

execFileSync(bin('ts-codemod'), ['--help'], { stdio: 'ignore' });

fs.rmSync(dir, { recursive: true, force: true });

console.info('ts-codemod-cli ok');
