// @ts-check
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execAsync } from '../../../scripts/child-process-async.mjs';
import { readFileAsync } from '../../../scripts/read-file-async.mjs';
import { writeFileAsync } from '../../../scripts/write-file-async.mjs';
import { eslintPlugins } from './eslint-plugins.mjs';
import { generateRulesType } from './generate-rules-type.js';
import { replaceRulesType } from './replace.mjs';

const thisDir = dirname(fileURLToPath(import.meta.url));

const rulesTypeDir = `${thisDir}/../eslint-rules/rules-type`;

const main = async () => {
  for (const plugin of Object.values(eslintPlugins)) {
    console.log(`generating ${plugin.outputFileName} ...`);

    const result = await generateRulesType(
      plugin.typeName,
      plugin.pluginName,
      plugin.rulePrefix
    );

    const targetFilePath = `${thisDir}/../eslint-rules/rules-type/${plugin.outputFileName}`;

    await writeFileAsync(targetFilePath, result);
  }

  console.log('running `lint --fix` ... (adding "readonly")');

  await execAsync(
    `eslint --fix --no-eslintrc --config ${thisDir}/.eslintrc.generate-rules-type.js ${rulesTypeDir} --ext .ts`
  );

  console.log('formatting code ...');

  await execAsync(
    `prettier --cache --cache-strategy content --write ${rulesTypeDir}`
  );

  for (const plugin of Object.values(eslintPlugins)) {
    console.log(`modifying ${plugin.outputFileName} ...`);

    const targetFilePath = `${rulesTypeDir}/${plugin.outputFileName}`;

    const content = await readFileAsync(targetFilePath, { encoding: 'utf-8' });

    const result = replaceRulesType(content, plugin.typeName);

    await writeFileAsync(targetFilePath, result);
  }

  console.log('formatting code ...');

  await execAsync(
    `prettier --cache --cache-strategy content --write ${rulesTypeDir}`
  );
};

main();
