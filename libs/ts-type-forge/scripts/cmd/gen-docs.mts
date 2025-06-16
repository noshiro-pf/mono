import { genTypeDefinitions } from '../functions/get-type-definitions.mjs';
import { projectRootPath } from '../project-root-path.mjs';

await $(
  `typedoc --options ${path.resolve(projectRootPath, './configs/typedoc.config.mjs')}`,
);
await genTypeDefinitions();
await $(`npm run fmt:full`);
