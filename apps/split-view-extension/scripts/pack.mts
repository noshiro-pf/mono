import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { packPath, stageForStore, stagingPath } from './store-package.mjs';

/**
 * Packs `dist/` into the zip the Chrome Web Store takes.
 *
 * See `store-package.mts` for what comes off on the way, and why the package
 * is a copy of the build rather than the build itself. `pack-crx.mts` is the
 * same thing signed, which is what the store wants once verified CRX upload
 * is turned on for the item.
 */
const main = (): void => {
  const { version } = stageForStore();

  const zipName = `split-view-extension-${version}.zip` as const;

  // `zip` adds to an archive that is already there rather than replacing it.

  fs.rmSync(path.resolve(packPath, zipName), { force: true });

  // The store wants the files at the root of the archive, not a directory
  // holding them, so this zips `.` from inside the staging copy. `-X` leaves
  // out the extra file attributes, which are noise in a package.
  execFileSync(
    'zip',
    ['-r', '-X', '-q', path.resolve(packPath, zipName), '.'],
    { cwd: stagingPath },
  );

  const zipPath = path.resolve(packPath, zipName);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const { size } = fs.statSync(zipPath);

  console.log(`${zipPath}  (${String(Math.round(size / 1024))} kB)`);

  console.log('  manifest `key` removed, source maps left out');
};

main();
