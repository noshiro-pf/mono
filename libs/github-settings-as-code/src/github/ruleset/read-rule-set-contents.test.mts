import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { readRulesetFilesIn } from './read-rule-set-contents.mjs';

// This repository's own declarations, as a known-valid fixture.
const rulesetsDir = path.resolve(
  import.meta.dirname,
  '../../../../../repo-settings/rulesets',
);

describe(readRulesetFilesIn, () => {
  test('reads the declarations and ignores a README beside them', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'read-rulesets-'));

    const declarations = await fs
      .readdir(rulesetsDir)
      .then((names) => names.filter((n) => n.endsWith('.json')));

    for (const name of declarations) {
      await fs.copyFile(path.join(rulesetsDir, name), path.join(dir, name));
    }

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(path.join(dir, 'README.md'), '# notes');

    const values = await readRulesetFilesIn(dir);

    expect(values).toHaveLength(declarations.length);
  });

  test('reads a directory that does not exist as no declarations', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'absent-'));

    assert.deepStrictEqual(
      await readRulesetFilesIn(path.join(dir, 'absent')),
      [],
    );
  });
});
