import { converterConfigs } from '../functions/constants.mjs';
import { publishPackages } from '../functions/publish-packages.mjs';
import { typescriptVersions } from '../functions/typescript-versions.mjs';

for (const config of converterConfigs) {
  await publishPackages(typescriptVersions[0], config.numberType);
}
