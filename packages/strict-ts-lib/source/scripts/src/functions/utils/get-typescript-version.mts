import 'zx/globals';
import { paths } from '../constants.mjs';

export const getTypeScriptVersion = async (): Promise<
  `${number}.${number}.${number}` | undefined
> =>
  fs
    .readFile(
      path.resolve(
        paths.strictTsLib.source.scripts.$,
        'typescript-version.txt',
      ),
      { encoding: 'utf8' },
    )
    .then(
      (s) =>
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        /\d\.\d\.\d/u.exec(s)?.[0] as
          | `${number}.${number}.${number}`
          | undefined,
    );
