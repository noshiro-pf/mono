import { execSync } from 'node:child_process';
import 'zx/globals';
import { paths } from './constants.mjs';
import { type SemVer } from './types.mjs';
import { clearDir } from './utils/clear-dir.mjs';
import { forAllTsVersions } from './utils/for-all-ts-versions.mjs';
import { formatFiles } from './utils/format.mjs';

/**
 * Fetch lib files from TypeScript repo and save them to
 * `output/{tsVersion}/temp/copied`
 */
export const fetchLibFiles = async (
  tsVersion: SemVer | 'all',
): Promise<'ok' | 'err'> => forAllTsVersions(tsVersion, fetchLibFilesImpl);

/**
 * Fetch lib files from TypeScript repo and save them to
 * `output/{tsVersion}/{numberType}/temp/copied`
 */
const fetchLibFilesImpl = async (tsVersion: SemVer): Promise<'ok' | 'err'> => {
  const copiedDir = paths.strictTsLib.output(tsVersion).temp.copied.$;

  const files = fetchLibFileNameList(tsVersion);

  {
    const res = await clearDir(copiedDir);
    if (res === 'err') return res;
  }

  try {
    for (const file of files) {
      execSync(
        `wget "https://raw.githubusercontent.com/microsoft/TypeScript/v${tsVersion}/lib/${file}" -P "${copiedDir}"`,
        { encoding: 'utf8' },
      );
    }
  } catch (error) {
    console.error(error);
    return 'err';
  }

  {
    const res = await formatFiles(copiedDir);
    if (res === 'err') return res;
  }

  return 'ok';
};

export const fetchLibFileNameList = (tsVersion: SemVer): readonly string[] => {
  const result = execSync(
    `gh api --method GET --jq '.[].name' /repos/microsoft/TypeScript/contents/lib -F ref=v${tsVersion}`,
    { encoding: 'utf8' },
  );

  return result
    .split('\n')
    .filter((filename) => /^lib.*\.d\.ts/u.test(filename));
};
