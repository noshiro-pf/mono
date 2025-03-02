import { execSync } from 'node:child_process';
import 'zx/globals';
import { paths } from './constants.mjs';
import { clearDir } from './utils/clear-dir.mjs';
import { formatFiles } from './utils/format.mjs';
import { getTypeScriptVersion } from './utils/get-typescript-version.mjs';

/** Fetch lib files from TypeScript repo and save them to `source/temp/copied` */
export const fetchLibFiles = async (): Promise<'ok' | 'err'> => {
  const copiedDir = paths.strictTsLib.source.temp.copied.$;

  const tsVersion = await getTypeScriptVersion();

  echo(`TypeScript version: ${tsVersion}.\n`);

  const result = execSync(
    `gh api --method GET --jq '.[].name' /repos/microsoft/TypeScript/contents/lib -F ref=v${tsVersion}`,
    { encoding: 'utf8' },
  );

  const files = result
    .split('\n')
    .filter((filename) => /^lib.*\.d\.ts/u.test(filename));

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
