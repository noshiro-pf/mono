import { toThisDir } from '@noshiro/mono-utils';
import 'zx/globals';
import { getSrcFileList, type ConverterConfig } from './convert-dts/common.mjs';
import { configs } from './convert-dts/constants.mjs';
import { convert } from './convert-dts/convert-main.mjs';

const thisDir = toThisDir(import.meta.url);
const strictTsLibDir = path.resolve(thisDir, '../../..');

const srcDir = path.resolve(strictTsLibDir, 'source/temp/eslint-fixed');

const main = async (): Promise<void> => {
  const configs2 = configs.map((c) => ({ ...c, forNpmPackage: false }));
  await Promise.all(configs2.map(createDtsFiles));
};

const createDtsFiles = async (config: ConverterConfig): Promise<void> => {
  const srcFileList = await getSrcFileList(srcDir);

  const outDir = path.resolve(
    strictTsLibDir,
    `output${config.useBrandedNumber ? '-branded' : ''}/lib-files`,
  );

  const results = srcFileList.map(
    ({ content, filename }) =>
      [convert(filename, config)(content), filename] as const,
  );

  await Promise.all(
    results.map(async ([result, filename]) => {
      const outputFile = `${outDir}/${filename}`;

      await fs.writeFile(outputFile, result);

      console.log(`${outputFile} generated.`);
    }),
  );
};

await main();
