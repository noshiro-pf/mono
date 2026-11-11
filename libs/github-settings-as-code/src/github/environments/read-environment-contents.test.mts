import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { readEnvironmentFilesIn } from './read-environment-contents.mjs';

// This repository's own declarations, as a known-valid fixture.
const environmentsDir = path.resolve(
  import.meta.dirname,
  '../../../../../repo-settings/environments',
);

describe(readEnvironmentFilesIn, () => {
  test('reads the declarations and ignores a README beside them', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'read-environments-'));

    const declarations = await fs
      .readdir(environmentsDir)
      .then((names) => names.filter((n) => n.endsWith('.json')));

    for (const name of declarations) {
      await fs.copyFile(path.join(environmentsDir, name), path.join(dir, name));
    }

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(path.join(dir, 'README.md'), '# notes');

    const values = await readEnvironmentFilesIn(dir);

    expect(values).toHaveLength(declarations.length);
  });

  test('reads a directory that does not exist as no declarations', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'absent-'));

    assert.deepStrictEqual(
      await readEnvironmentFilesIn(path.join(dir, 'absent')),
      [],
    );
  });
});
