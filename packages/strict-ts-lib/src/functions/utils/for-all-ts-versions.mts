import {
  type TsVersion,
  typescriptVersions,
} from '../../typescript-versions.mjs';

export const forAllTsVersions = async (
  tsVersion: TsVersion | 'all',
  fn: (v: TsVersion) => Promise<'ok' | 'err'>,
): Promise<'ok' | 'err'> => {
  if (tsVersion === 'all') {
    for (const v of typescriptVersions) {
      echo(`TypeScript version: ${v}.\n`);

      const res = await fn(v);
      if (res === 'err') return 'err';
    }
  } else {
    echo(`TypeScript version: ${tsVersion}.\n`);

    const res = await fn(tsVersion);
    if (res === 'err') return 'err';
  }

  return 'ok';
};
