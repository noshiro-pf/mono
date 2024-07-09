import { toThisDir } from '@noshiro/mono-scripts';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import { getSrcFileList, type ConverterConfig } from './convert-dts/common.mjs';
import { convert } from './convert-dts/convert-main.mjs';

const thisDir = toThisDir(import.meta.url);
const strictTsLibDir = path.resolve(thisDir, '../../..');

const srcDir = path.resolve(strictTsLibDir, 'source/temp/eslint-fixed');

const createDtsFiles = async (config: ConverterConfig): Promise<void> => {
  const srcFileList = await getSrcFileList(srcDir);

  const outDir = path.resolve(
    strictTsLibDir,
    `output${config.useBrandedNumber ? '-branded' : ''}/lib-files`,
  );

  await Promise.all(
    srcFileList.map(async ({ content, filename }) => {
      const outputFile = `${outDir}/${filename}`;

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(outputFile, convert(filename, config)(content));

      console.log(`${outputFile} generated.`);
    }),
  );
};

await createDtsFiles({
  useBrandedNumber: false,
  commentOutDeprecated: false,
  returnType: 'mutable',
  forNpmPackage: false,
});

await createDtsFiles({
  useBrandedNumber: true,
  commentOutDeprecated: false,
  returnType: 'readonly',
  forNpmPackage: false,
});
