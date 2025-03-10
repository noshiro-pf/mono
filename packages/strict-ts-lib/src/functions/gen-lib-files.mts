import { Result } from '@noshiro/mono-utils';
import 'zx/globals';
import {
  type ConverterConfig,
  converterConfigs,
  paths,
} from '../constants.mjs';
import {
  convertWithAst,
  convertWithGrep,
  getSrcFileListWithContent,
} from '../convert-dts/index.mjs';
import { type TsVersion } from '../typescript-versions.mjs';
import { clearDir, forAllTsVersions } from './utils/index.mjs';

/** Generate files to `output/{tsVersion}/{numberType}/lib-files` */
export const genLibFiles = async (
  tsVersion: TsVersion | 'all',
): Promise<'ok' | 'err'> => forAllTsVersions(tsVersion, genLibFilesImpl);

/** Generate files to `output/{tsVersion}/{numberType}/lib-files` */
const genLibFilesImpl = async (tsVersion: TsVersion): Promise<'ok' | 'err'> => {
  for (const { numberType } of converterConfigs) {
    const res = await clearDir(
      paths.strictTsLib.output(tsVersion)[numberType].libFiles,
    );

    if (res === 'err') return 'err';
  }

  await Promise.all(
    converterConfigs.map((cfg) => createDtsFiles(tsVersion, cfg)),
  );

  return 'ok';
};

const createDtsFiles = async (
  tsVersion: TsVersion,
  config: ConverterConfig,
): Promise<void> => {
  const srcFileList = await getSrcFileListWithContent(
    paths.strictTsLib.output(tsVersion).temp.copied,
  );

  const outDir =
    paths.strictTsLib.output(tsVersion)[config.numberType].libFiles;

  const convertedWithAstResults = srcFileList.map(({ content, filename }) =>
    convertWithAst(content, filename, config),
  );

  const { oks, errs } = Result.group(convertedWithAstResults);

  if (errs.length > 0) {
    console.error(errs[0]);
    return;
  }

  const convertedResults = oks.map((content, i) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const filename = srcFileList[i]!.filename;

    return {
      content:
        Math.PI < 0 ? convertWithGrep(content, filename, config) : content,
      filename,
    };
  });

  await Promise.all(
    convertedResults.map(async ({ content, filename }) => {
      const outputFile = path.resolve(outDir, filename);

      await fs.writeFile(outputFile, content);

      console.log(`${outputFile} generated.`);
    }),
  );
};
