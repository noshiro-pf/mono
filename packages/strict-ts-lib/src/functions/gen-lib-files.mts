import 'zx/globals';
import { getSrcFileList } from '../convert-dts/common.mjs';
import { convert } from '../convert-dts/convert-main.mjs';
import { type ConverterConfig, converterConfigs, paths } from './constants.mjs';
import { type SemVer } from './types.mjs';
import { clearDir } from './utils/clear-dir.mjs';
import { forAllTsVersions } from './utils/for-all-ts-versions.mjs';

/** Generate files to `output/{tsVersion}/{numberType}/lib-files` */
export const genLibFiles = async (
  tsVersion: SemVer | 'all',
): Promise<'ok' | 'err'> => forAllTsVersions(tsVersion, genLibFilesImpl);

/** Generate files to `output/{tsVersion}/{numberType}/lib-files` */
const genLibFilesImpl = async (tsVersion: SemVer): Promise<'ok' | 'err'> => {
  for (const { numberType } of converterConfigs) {
    const res = await clearDir(
      paths.strictTsLib.output(tsVersion)[numberType].libFiles.$,
    );

    if (res === 'err') return 'err';
  }

  await Promise.all(
    converterConfigs.map((cfg) => createDtsFiles(tsVersion, cfg)),
  );

  return 'ok';
};

const createDtsFiles = async (
  tsVersion: SemVer,
  config: ConverterConfig,
): Promise<void> => {
  const srcFileList = await getSrcFileList(
    paths.strictTsLib.output(tsVersion).temp.eslintFixed.$,
  );

  const outDir =
    paths.strictTsLib.output(tsVersion)[config.numberType].libFiles.$;

  await Promise.all(
    srcFileList.map(async ({ content, filename }) => {
      const outputFile = path.resolve(outDir, filename);

      await fs.writeFile(outputFile, convert(filename, config)(content));

      console.log(`${outputFile} generated.`);
    }),
  );
};
