import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { assertSamplePackagesDeclared } from './embed-examples-packages.mjs';

/** A repository root holding `files`, removed once `fn` settles. */
const withRepository = async (
  files: ReadonlyRecord<string, string>,
  fn: (root: string) => Promise<void>,
): Promise<void> => {
  const repositoryRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), 'embed-packages-'),
  );

  try {
    for (const [file, content] of Object.entries({
      'pnpm-workspace.yaml': "packages: ['libs/*', 'apps/*']\n",
      'package.json': '{ "name": "root" }',
      ...files,
    })) {
      const filePath = path.join(repositoryRoot, file);

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.mkdirSync(path.dirname(filePath), { recursive: true });

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.writeFileSync(filePath, content);
    }

    await fn(repositoryRoot);
  } finally {
    fs.rmSync(repositoryRoot, { recursive: true, force: true });
  }
};

const fixture = {
  'libs/lib/package.json': '{ "name": "lib" }',
  'libs/lib/samples/a.mts': '',
  'libs/peer/package.json': '{ "name": "peer" }',
  'libs/peer/samples/a.mts': '',
  'apps/docs/package.json': JSON.stringify({
    name: 'docs',
    devDependencies: { lib: 'workspace:*' },
    peerDependencies: { peer: '^1.0.0' },
  }),
  'apps/docs/README.md': '',
  'apps/docs/samples/own.mts': '',
  'apps/other/package.json': JSON.stringify({
    name: 'other',
    peerDependencies: { peer: 'workspace:*' },
  }),
  'apps/other/README.md': '',
  'tools/loose.mts': '',
} as const;

describe('assertSamplePackagesDeclared', () => {
  test('passes a sample from the package itself or one it declares, in any dependency field', async () => {
    await withRepository(fixture, async (root) => {
      const result = await assertSamplePackagesDeclared([
        {
          documentPath: path.join(root, 'apps/docs/README.md'),
          samplePath: path.join(root, 'apps/docs/samples/own.mts'),
        },
        {
          documentPath: path.join(root, 'apps/docs/README.md'),
          samplePath: path.join(root, 'libs/lib/samples/a.mts'),
        },
        {
          documentPath: path.join(root, 'apps/other/README.md'),
          samplePath: path.join(root, 'libs/peer/samples/a.mts'),
        },
      ]);

      assert.isTrue(Result.isOk(result));
    });
  });

  test('refuses a sample from a package declared without a workspace: range, naming both', async () => {
    await withRepository(fixture, async (root) => {
      const result = await assertSamplePackagesDeclared([
        {
          documentPath: path.join(root, 'apps/docs/README.md'),
          samplePath: path.join(root, 'libs/peer/samples/a.mts'),
        },
      ]);

      assert.isTrue(Result.isErr(result));

      assert.match(result.value, /docs embeds .+ from peer/u);
    });
  });

  test('refuses a sample in no workspace package', async () => {
    await withRepository(fixture, async (root) => {
      const result = await assertSamplePackagesDeclared([
        {
          documentPath: path.join(root, 'apps/docs/README.md'),
          samplePath: path.join(root, 'tools/loose.mts'),
        },
      ]);

      assert.isTrue(Result.isErr(result));

      assert.match(result.value, /are in no workspace package/u);
    });
  });
});
