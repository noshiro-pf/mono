import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import {
  CONFIG_PATH,
  ConfigFileSchema,
  configOf,
  readConfig,
  type ConfigFile,
} from './config.mjs';

const ROOT = path.resolve(import.meta.dirname, '../../../..');

describe(readConfig, () => {
  test('is undefined for a repository without the file', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'unblock-prs-'));

    const read = await readConfig(root);

    await fs.rm(root, { recursive: true });

    assert.deepStrictEqual(read, Result.ok(undefined));
  });

  test("reads this repository's own file", async () => {
    const read = await readConfig(ROOT);

    assert.isTrue(Result.isOk(read));

    assert.isDefined(read.value?.autoFix);
  });

  test('stops at a file that is there but misspelt, or not JSON', async () => {
    const reads = await Promise.all(
      [JSON.stringify({ autofix: {} }), '{'].map(async (text) => {
        const root = await fs.mkdtemp(path.join(os.tmpdir(), 'unblock-prs-'));

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await fs.mkdir(path.join(root, '.github'));

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await fs.writeFile(path.join(root, CONFIG_PATH), text);

        const read = await readConfig(root);

        await fs.rm(root, { recursive: true });

        return read;
      }),
    );

    for (const read of reads) {
      assert.isTrue(Result.isErr(read));

      expect(read.value).toContain(CONFIG_PATH);
    }
  });
});

describe(configOf, () => {
  test('names every pattern that is not a regular expression', () => {
    const config = configOf(
      autoFixFile({
        ignore: ['('],
        fixers: [{ context: '[', run: 'x', stage: 0 }],
      }),
      'test.json',
    );

    assert.isTrue(Result.isErr(config));

    expect(config.value).toContain('autoFix.ignore[0]');

    expect(config.value).toContain('autoFix.fixers[0].context');
  });

  test('has no generated branches when the file names none', () => {
    const config = configOf({ $schema: undefined, autoFix: undefined }, 'x');

    assert.isTrue(Result.isOk(config));

    assert.deepStrictEqual(config.value.generatedBranches, []);
  });

  test('reads the generated branches', () => {
    const generatedBranches = [
      { branch: 'chore/deps', rebuild: 'run rebuild-deps' },
    ] as const;

    const config = configOf(
      { $schema: undefined, autoFix: undefined, generatedBranches },
      'x',
    );

    assert.isTrue(Result.isOk(config));

    assert.deepStrictEqual(config.value.generatedBranches, generatedBranches);
  });

  test('reads the heading descriptions are translated under', () => {
    const config = configOf(
      {
        $schema: undefined,
        autoFix: undefined,
        translation: { heading: '日本語' },
      },
      'x',
    );

    assert.isTrue(Result.isOk(config));

    assert.strictEqual(config.value.translation, '日本語');
  });

  test('takes descriptions as they are when the file names no heading', () => {
    const config = configOf({ $schema: undefined, autoFix: undefined }, 'x');

    assert.isTrue(Result.isOk(config));

    assert.isUndefined(config.value.translation);
  });

  test('reads the opening heading, and refuses one without a translation or padded', () => {
    const read = withOpening('日本語', 'Background');

    assert.isTrue(Result.isOk(read));

    assert.strictEqual(read.value.openingHeading, 'Background');

    for (const refused of [
      withOpening(undefined, 'Background'),
      withOpening('日本語', ''),
      withOpening('日本語', ' Background'),
    ]) {
      assert.isTrue(Result.isErr(refused));
    }
  });

  test('reads the regenerators, and names a pattern that is not one', () => {
    const config = configOf(
      {
        $schema: undefined,
        autoFix: undefined,
        regenerate: {
          before: ['pnpm install --frozen-lockfile'],
          generators: [
            {
              path: String.raw`^docs/package-dependencies\.md$`,
              run: 'pnpm run gen:deps-graph',
            },
          ],
        },
      },
      'x',
    );

    assert.isTrue(Result.isOk(config));

    assert.deepStrictEqual(config.value.regenerate?.before, [
      'pnpm install --frozen-lockfile',
    ]);

    assert.isTrue(
      config.value.regenerate?.generators[0]?.path.test(
        'docs/package-dependencies.md',
      ) === true,
    );

    const invalid = configOf(
      {
        $schema: undefined,
        autoFix: undefined,
        regenerate: { before: [], generators: [{ path: '(', run: 'x' }] },
      },
      'x',
    );

    assert.isTrue(Result.isErr(invalid));

    expect(invalid.value).toContain('regenerate.generators[0].path');
  });

  test('regenerates nothing when the file names no regenerators', () => {
    const config = configOf({ $schema: undefined, autoFix: undefined }, 'x');

    assert.isTrue(Result.isOk(config));

    assert.isUndefined(config.value.regenerate);
  });

  test('reads the workflows to speculate with, and refuses one not a workflow file named once', () => {
    const config = speculateWith(['code-check.yml', 'style-check.yaml']);

    assert.isTrue(Result.isOk(config));

    assert.deepStrictEqual(config.value.speculate, {
      workflows: ['code-check.yml', 'style-check.yaml'],
      depth: 2,
    });

    for (const workflows of [
      [],
      ['code-check'],
      ['.github/workflows/code-check.yml'],
      ['code-check.yml', 'code-check.yml'],
    ]) {
      assert.isTrue(Result.isErr(speculateWith(workflows)));
    }
  });

  test('leaves the auto-fix off when the file has none', () => {
    const config = configOf({ $schema: undefined, autoFix: undefined }, 'x');

    assert.isTrue(Result.isOk(config));

    assert.isUndefined(config.value.autoFix);
  });
});

describe('config.schema.json', () => {
  test('is what gen:config-schema writes from ConfigFileSchema', async () => {
    const generated = t.toJsonSchema(ConfigFileSchema);

    assert.isTrue(Result.isOk(generated));

    const committed: unknown = JSON.parse(
      await fs.readFile(
        path.join(import.meta.dirname, 'config.schema.json'),
        'utf8',
      ),
    );

    // Run `pnpm run gen:config-schema` in this package when this fails.
    assert.deepStrictEqual(committed, generated.value);
  });

  // The file is v1's: the two packages read one `.github/unblock-prs.json`
  // until the swap, which removes this.
  test("is v1's", async () => {
    const [v1, v2] = await Promise.all(
      [
        path.join(ROOT, 'libs/pr-merge-queue/src/unblock-prs'),
        import.meta.dirname,
      ].map(async (dir) =>
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- fixed paths in this repository
        fs.readFile(path.join(dir, 'config.schema.json'), 'utf8'),
      ),
    );

    assert.strictEqual(v2, v1);
  });
});

const autoFixFile = (
  autoFix: Partial<NonNullable<ConfigFile['autoFix']>>,
): ConfigFile =>
  ({
    $schema: undefined,
    autoFix: {
      ignore: [],
      before: [],
      prepare: [],
      fixers: [],
      after: [],
      ...autoFix,
    },
  }) as const;

const speculateWith = (
  workflows: readonly string[],
): ReturnType<typeof configOf> =>
  configOf(
    {
      $schema: undefined,
      autoFix: undefined,
      speculate: { workflows, depth: 2 },
    },
    'x',
  );

const withOpening = (
  translation: string | undefined,
  openingHeading: string,
): ReturnType<typeof configOf> =>
  configOf(
    {
      $schema: undefined,
      autoFix: undefined,
      translation:
        translation === undefined ? undefined : { heading: translation },
      pullRequestDescription: { openingHeading },
    },
    'x',
  );
