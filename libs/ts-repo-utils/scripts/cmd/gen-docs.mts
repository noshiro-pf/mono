import { Result } from 'ts-data-forge';
import { assertPathExists } from '../../src/index.mjs';
import '../../src/node-global.mjs';
import { projectRootPath } from '../project-root-path.mjs';

const TYPEDOC_CONFIG = path.resolve(
  projectRootPath,
  './configs/typedoc.config.mjs',
);

/**
 * Generates documentation using TypeDoc and formats the output.
 * @throws Error if any step fails.
 */
const genDocs = async (): Promise<void> => {
  echo('Starting documentation generation...\n');

  try {
    // Verify TypeDoc config exists
    await assertPathExists(TYPEDOC_CONFIG, 'TypeDoc config');

    // Step 1: Generate docs with TypeDoc
    echo('1. Generating documentation with TypeDoc...');
    const typedocResult = await $(`typedoc --options "${TYPEDOC_CONFIG}"`);
    if (Result.isErr(typedocResult)) {
      throw new Error(
        `TypeDoc generation failed: ${typedocResult.value.message}`,
      );
    }
    echo('✓ TypeDoc generation completed\n');

    // Step 2: Format generated files
    echo('2. Formatting generated files...');
    const fmtResult = await $('prettier --write ./docs');
    if (Result.isErr(fmtResult)) {
      throw new Error(`Formatting failed: ${fmtResult.value.message}`);
    }
    echo('✓ Formatting completed\n');

    // Step 3: Lint markdown files
    echo('3. Linting markdown files...');
    const mdResult = await $('npm run md');
    if (Result.isErr(mdResult)) {
      throw new Error(`Markdown linting failed: ${mdResult.value.message}`);
    }
    echo('✓ Markdown linting completed\n');

    echo('✅ Documentation generation completed successfully!\n');
  } catch (error) {
    echo(`❌ Documentation generation failed: ${String(error)}\n`);
    process.exit(1);
  }
};

await genDocs();
