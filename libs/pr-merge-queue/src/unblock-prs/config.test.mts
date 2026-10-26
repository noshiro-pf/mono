import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { planAutoFix } from './auto-fix.mjs';
import {
  CONFIG_PATH,
  ConfigFileSchema,
  configOf,
  readConfig,
  type ConfigFile,
} from './config.mjs';

describe(readConfig, () => {
  test('is undefined for a repository without the file', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'unblock-prs-'));

    const read = await readConfig(root);

    await fs.rm(root, { recursive: true });

    assert.isTrue(Result.isOk(read));

    assert.isUndefined(read.value);
  });

  test("reads this repository's own file", async () => {
    const read = await readConfig();

    assert.isTrue(Result.isOk(read));

    assert.isDefined(read.value?.autoFix);
  });

  test('stops at a file that is there but misspelt', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'unblock-prs-'));

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.mkdir(path.join(root, '.github'));

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(
      path.join(root, CONFIG_PATH),
      JSON.stringify({ autofix: {} }),
    );

    const read = await readConfig(root);

    await fs.rm(root, { recursive: true });

    assert.isTrue(Result.isErr(read));
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

  test('leaves the auto-fix off when the file has none', () => {
    const config = configOf({ $schema: undefined, autoFix: undefined }, 'x');

    assert.isTrue(Result.isOk(config));

    assert.isUndefined(config.value.autoFix);
  });
});

describe('a fixer command', () => {
  test("shell-quotes the context's capture groups", () => {
    const config = configOf(
      autoFixFile({
        fixers: [
          { context: String.raw`^fix \((.+)\)$`, run: 'run $1', stage: 0 },
        ],
      }),
      'test.json',
    );

    assert.isTrue(Result.isOk(config));

    const plan = planAutoFix(
      new Map([["fix (a'; rm -rf /)", 'failed']]),
      config.value.autoFix,
    );

    assert.isTrue(Result.isOk(plan));

    assert.deepStrictEqual(plan.value.commands, [
      String.raw`run 'a'\''; rm -rf /'`,
    ]);
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
