import '../node-global.mjs';
import { genTypeDefinitions } from './get-type-definitions.mjs';

export const genDocs = async (): Promise<void> => {
  await $(
    `typedoc --options ${path.resolve(projectRootPath, './configs/typedoc.config.mjs')}`,
  );
  await genTypeDefinitions();
  await $(`npm run fmt`);
};
