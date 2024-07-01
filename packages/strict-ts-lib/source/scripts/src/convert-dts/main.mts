import * as fs from 'node:fs/promises';
import { getSrcFileList, type ConverterConfig } from './common.mjs';
import { convert } from './convert-main.mjs';

const createDtsFiles = async (config: ConverterConfig): Promise<void> => {
  const srcDir = './temp/eslint-fixed';

  const srcFileList = await getSrcFileList(srcDir);

  const distDir = `../${config.useBrandedNumber ? 'branded/final' : 'basic/final'}`;

  await Promise.all(
    srcFileList.map(async ({ content, filename }) => {
      const outputFile = `${distDir}/${filename}`;

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
