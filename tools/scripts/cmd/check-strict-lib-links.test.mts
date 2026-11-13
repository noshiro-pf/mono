import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import { checkStrictLibLinks } from './check-strict-lib-links.mjs';

const makeDir = (dir: string): void => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.mkdirSync(dir, { recursive: true });
};

const link = (from: string, to: string): void => {
  makeDir(path.dirname(from));

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.symlinkSync(to, from, 'dir');
};

/**
 * A root whose bundle has the groups `es5` and `dom`, each linked as the linker
 * links it, and a directory `elsewhere` that is not the bundle.
 */
const makeRoot = (): string => {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), 'check-strict-lib-links-test-'),
  );

  for (const group of ['es5', 'dom']) {
    const target = path.join(
      root,
      'node_modules/strict-ts-lib-v7.0/libs',
      group,
    );

    makeDir(target);

    link(path.join(root, `node_modules/@typescript/lib-${group}`), target);
  }

  makeDir(path.join(root, 'elsewhere/lib-dom'));

  return root;
};

const relink = (root: string, group: string, to: string): void => {
  const from = path.join(root, `node_modules/@typescript/lib-${group}`);

  fs.rmSync(from);

  link(from, to);
};

describe('checkStrictLibLinks', () => {
  test('passes when every link resolves to its group in the bundle', async () => {
    const result = await checkStrictLibLinks(makeRoot());

    assert.deepStrictEqual(result, Result.ok(2));
  });

  test('fails on a missing link', async () => {
    const root = makeRoot();

    fs.rmSync(path.join(root, 'node_modules/@typescript/lib-dom'));

    const result = await checkStrictLibLinks(root);

    assert.isTrue(Result.isErr(result));

    assert.include(Result.unwrapErr(result), '@typescript/lib-dom');

    assert.include(Result.unwrapErr(result), 'missing');
  });

  test('fails on a link that resolves outside the bundle (#2907)', async () => {
    const root = makeRoot();

    relink(root, 'dom', path.join(root, 'elsewhere/lib-dom'));

    const result = await checkStrictLibLinks(root);

    assert.isTrue(Result.isErr(result));

    const message = Result.unwrapErr(result);

    assert.include(message, '@typescript/lib-dom');

    assert.include(message, 'elsewhere/lib-dom');

    assert.include(message, 'node_modules/strict-ts-lib-v7.0/libs/dom');

    assert.include(message, 'z:link-strict-lib');

    assert.notInclude(message, 'lib-es5');
  });

  test('fails on a link to another group of the bundle (#2907)', async () => {
    const root = makeRoot();

    relink(
      root,
      'dom',
      path.join(root, 'node_modules/strict-ts-lib-v7.0/libs/es5'),
    );

    const result = await checkStrictLibLinks(root);

    assert.isTrue(Result.isErr(result));

    assert.include(
      Result.unwrapErr(result),
      'node_modules/strict-ts-lib-v7.0/libs/es5',
    );
  });

  test('reports a missing link and a misdirected one together', async () => {
    const root = makeRoot();

    fs.rmSync(path.join(root, 'node_modules/@typescript/lib-es5'));

    relink(root, 'dom', path.join(root, 'elsewhere/lib-dom'));

    const message = Result.unwrapErr(await checkStrictLibLinks(root));

    assert.include(message, '@typescript/lib-es5');

    assert.include(message, 'elsewhere/lib-dom');
  });
});
