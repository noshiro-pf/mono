import 'zx/globals';
import {
  getSrcFileList,
  type ConverterConfig,
} from '../convert-dts/common.mjs';
import { convert } from '../convert-dts/convert-main.mjs';
import { configs, paths } from './constants.mjs';
import { clearDir } from './utils/clear-dir.mjs';

/** Generate files to `output/lib-files` */
export const genLibFiles = async (): Promise<'ok' | 'err'> => {
  {
    const res = await clearDir(paths.strictTsLib.output.libFiles.$);
    if (res === 'err') return 'err';
  }

  await Promise.all(configs.map(createDtsFiles));

  return 'ok';
};

const createDtsFiles = async (config: ConverterConfig): Promise<void> => {
  const srcFileList = await getSrcFileList(
    paths.strictTsLib.source.temp.eslintFixed.$,
  );

  const outDir =
    paths.strictTsLib[config.useBrandedNumber ? 'outputBranded' : 'output']
      .libFiles.$;

  await Promise.all(
    srcFileList.map(async ({ content, filename }) => {
      const outputFile = path.resolve(outDir, filename);

      await fs.writeFile(outputFile, convert(filename, config)(content));

      console.log(`${outputFile} generated.`);
    }),
  );
};
