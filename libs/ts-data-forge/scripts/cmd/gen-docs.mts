import { assertPathExists } from 'ts-repo-utils';
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
    if (typedocResult.type === 'error') {
      throw new Error(
        `TypeDoc generation failed: ${typedocResult.exception.message}`,
      );
    }
    echo('✓ TypeDoc generation completed\n');

    // Step 2: Format generated files
    echo('2. Formatting generated files...');
    const fmtResult = await $('prettier --write ./docs');
    if (fmtResult.type === 'error') {
      throw new Error(`Formatting failed: ${fmtResult.exception.message}`);
    }
    echo('✓ Formatting completed\n');

    // Step 3: Lint markdown files
    echo('3. Linting markdown files...');
    const mdResult = await $('npm run md');
    if (mdResult.type === 'error') {
      throw new Error(`Markdown linting failed: ${mdResult.exception.message}`);
    }
    echo('✓ Markdown linting completed\n');

    echo('✅ Documentation generation completed successfully!\n');
  } catch (error) {
    echo(`❌ Documentation generation failed: ${String(error)}\n`);
    process.exit(1);
  }
};

await genDocs();
