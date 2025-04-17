import {
  appendAsConstTransformer,
  astTransformerToStringTransformer,
  convertToReadonlyTypeTransformer,
  replaceAnyWithUnknownTransformer,
} from 'ts-codemod-lib';
import 'zx/globals';
import { paths } from '../constants.mjs';
import { getSrcFileList } from '../convert-dts/index.mjs';
import { type TsVersion } from '../typescript-versions.mjs';
import { clearDir, forAllTsVersions } from './utils/index.mjs';

/**
 * Read files in `output/{tsVersion}/{numberType}/temp/copied` and generate
 * files in `output/{tsVersion}/{numberType}/temp/transformed`
 */
export const genTransformed = async (
  tsVersion: TsVersion | 'all',
): Promise<'ok' | 'err'> => forAllTsVersions(tsVersion, genTransformedImpl);

/**
 * Read files in `output/{tsVersion}/{numberType}/temp/copied` and generate
 * files in `output/{tsVersion}/{numberType}/temp/transformed`
 */
const genTransformedImpl = async (
  tsVersion: TsVersion,
): Promise<'ok' | 'err'> => {
  const { copied, transformed } = paths.strictTsLib.output(tsVersion).temp;

  {
    const res = await clearDir(transformed);
    if (res === 'err') return 'err';
  }

  {
    const res = await $`cp -r ${copied}/lib*.d.ts ${transformed}`;
    if (res.exitCode !== 0) {
      console.error(res.stderr);
      return 'err';
    }
  }

  const srcFileList = await getSrcFileList(transformed);

  await Promise.all(
    srcFileList.map(async (filename) => {
      const inputFile = path.resolve(copied, filename);
      const outputFile = path.resolve(transformed, filename);

      const content = await fs.readFile(inputFile, { encoding: 'utf8' });

      await fs.writeFile(
        outputFile,
        filename.includes('dom') || filename.includes('webworker')
          ? transformerMutable(content)
          : transformerReadonly(content),
      );

      console.log(`${outputFile} generated.`);
    }),
  );

  return 'ok';
};

const transformerReadonly = astTransformerToStringTransformer([
  appendAsConstTransformer,
  replaceAnyWithUnknownTransformer,
  convertToReadonlyTypeTransformer(),
]);

const transformerMutable = astTransformerToStringTransformer([
  appendAsConstTransformer,
  replaceAnyWithUnknownTransformer,
]);
