import { converterConfigs } from '../constants.mjs';
import { publishPackages } from '../functions/index.mjs';
import { typescriptVersions } from '../typescript-versions.mjs';

for (const config of converterConfigs) {
  await publishPackages(typescriptVersions[0], config.numberType);
}
