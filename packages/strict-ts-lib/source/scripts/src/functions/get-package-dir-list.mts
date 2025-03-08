import 'zx/globals';
import { getSrcFileList } from '../convert-dts/common.mjs';
import { paths } from './constants.mjs';
import { type SemVer } from './types.mjs';

/** "lib.es2018.asynciterable.d.ts" -> "es2018/asynciterable" */
export const libFilenameToPath = (libFilename: string): string =>
  // eslint-disable-next-line no-restricted-syntax
  libFilename
    .replaceAll('lib.', '')
    .replaceAll('.d.ts', '')
    .replaceAll('.', '/');

export const getPackageDirList = (
  tsVersion: SemVer,
): Promise<
  DeepReadonly<
    {
      filename: string;
      packageRelativePath: string;
    }[]
  >
> =>
  getSrcFileList(paths.strictTsLib.output(tsVersion).temp.eslintFixed.$).then(
    (list) =>
      list
        .map(({ filename }) => filename)
        .filter((filename) => filename !== 'lib.d.ts')
        .map((filename) => ({
          filename,
          packageRelativePath: libFilenameToPath(filename),
        })),
  );
