import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { writeRouteEntryPages } from './vite-app-config.mjs';

/** A build output directory holding `index.html`, removed once `fn` returns. */
const withBuild = (fn: (outDir: string) => void): void => {
  const buildDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vite-app-config-'));

  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(path.join(buildDir, 'index.html'), '<!doctype html>');

    fn(buildDir);
  } finally {
    fs.rmSync(buildDir, { recursive: true, force: true });
  }
};

describe(writeRouteEntryPages, () => {
  test('writes the page at each route, nested ones included', () => {
    withBuild((outDir) => {
      writeRouteEntryPages(outDir, ['/create/', '/plan/edit/']);

      for (const route of ['create', 'plan/edit']) {
        assert.strictEqual(
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          fs.readFileSync(path.join(outDir, route, 'index.html'), 'utf8'),
          '<!doctype html>',
        );
      }
    });
  });

  test('rejects a route that is not a directory below the root', () => {
    withBuild((outDir) => {
      for (const route of ['/', '/create', 'create/', '/../up/']) {
        assert.throws(() => {
          writeRouteEntryPages(outDir, [route]);
        }, /route/u);
      }
    });
  });

  test('fails when the build wrote no index.html', () => {
    withBuild((outDir) => {
      fs.rmSync(path.join(outDir, 'index.html'));

      assert.throws(() => {
        writeRouteEntryPages(outDir, ['/create/']);
      });
    });
  });
});
