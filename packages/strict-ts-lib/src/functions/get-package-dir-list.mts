import 'zx/globals';
import { paths } from '../constants.mjs';
import { getSrcFileListWithContent } from '../convert-dts/index.mjs';
import { type TsVersion } from '../typescript-versions.mjs';

/** "lib.es2018.asynciterable.d.ts" -> "es2018/asynciterable" */
export const libFilenameToPath = (libFilename: string): string =>
  // eslint-disable-next-line no-restricted-syntax
  libFilename
    .replaceAll('lib.', '')
    .replaceAll('.d.ts', '')
    .replaceAll('.', '/');

export const getPackageDirList = (
  tsVersion: TsVersion,
): Promise<
  DeepReadonly<
    {
      filename: string;
      packageRelativePath: string;
    }[]
  >
> =>
  getSrcFileListWithContent(
    paths.strictTsLib.output(tsVersion).temp.eslintFixed,
  ).then((list) =>
    list
      .map(({ filename }) => filename)
      .filter((filename) => filename !== 'lib.d.ts')
      .map((filename) => ({
        filename,
        packageRelativePath: libFilenameToPath(filename),
      })),
  );
