import * as fs from 'node:fs';
import * as path from 'node:path';
import { HELP, TARGETS } from './cli-spec.mjs';

/** The targets the `Targets:` section of the help names, in order. */
const targetsInHelp = (help: string): readonly string[] => {
  const lines = help.split('\n');

  const start = lines.indexOf('Targets:');

  assert.isAbove(start, -1);

  const end = lines.findIndex((line, index) => index > start && line === '');

  return lines
    .slice(start + 1, end === -1 ? undefined : end)
    .flatMap(
      (line) => /^ {2}(?<name>[\w-]+)/u.exec(line)?.groups?.['name'] ?? [],
    );
};

/** The targets the README's target table names, in order. */
const targetsInReadme = (readme: string): readonly string[] => {
  const lines = readme.split(/\r?\n/u);

  const start = lines.findIndex((line) => /^\| Target\s+\|/u.test(line));

  assert.isAbove(start, -1);

  const rows = lines.slice(start + 2);

  const end = rows.findIndex((row) => !row.startsWith('|'));

  return rows
    .slice(0, end === -1 ? undefined : end)
    .flatMap(
      (row) => /^\| `(?<name>[\w-]+)`/u.exec(row)?.groups?.['name'] ?? [],
    );
};

describe('TARGETS', () => {
  test('is what the help text lists under Targets', () => {
    assert.deepStrictEqual(targetsInHelp(HELP), TARGETS);
  });

  test("is what the README's target table lists", () => {
    const readme = fs.readFileSync(
      path.resolve(import.meta.dirname, '../../README.md'),
      'utf8',
    );

    assert.deepStrictEqual(targetsInReadme(readme), TARGETS);
  });
});
