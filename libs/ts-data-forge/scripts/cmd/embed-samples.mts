import 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Maps sample file names to their corresponding README code block identifiers
 */
const SAMPLE_MAPPINGS = {
  'expect-type.mts': {
    start: '### 1. Compile-Time Type Assertions with `expectType`',
    codeBlockStart: '```typescript',
    codeBlockEnd: '```',
  },
  'functional-programming.mts': {
    start:
      '### 2. Functional Programming with `Optional`, `Result`, `pipe`, and `match`',
    codeBlockStart: '```typescript',
    codeBlockEnd: '```',
  },
  'number-utilities.mts': {
    start: '### 3. Number Utilities with `Num` and Branded Number Types',
    codeBlockStart: '```typescript',
    codeBlockEnd: '```',
  },
  'branded-number-types.mts': {
    start: '#### Branded Number Types for Enhanced Type Safety',
    codeBlockStart: '```typescript',
    codeBlockEnd: '```',
  },
  'array-utilities.mts': {
    start: '### 4. Array Utilities with `Arr`',
    codeBlockStart: '```typescript',
    codeBlockEnd: '```',
  },
  'immutable-collections.mts': {
    start: '### 5. Immutable Collections: `IMap` and `ISet`',
    codeBlockStart: '```typescript',
    codeBlockEnd: '```',
  },
  'type-guards.mts': {
    start: '### 6. Type Guards',
    codeBlockStart: '```typescript',
    codeBlockEnd: '```',
  },
  'iteration-range.mts': {
    start: '### 7. Iteration with `range`',
    codeBlockStart: '```typescript',
    codeBlockEnd: '```',
  },
  'mutability-utilities.tsx': {
    start: '### 8. Mutability Utilities with `castMutable`',
    codeBlockStart: '```tsx',
    codeBlockEnd: '```',
  },
} as const;

/**
 * Embeds sample code from ./samples directory into README.md
 */
const embedSamples = async (): Promise<void> => {
  console.log('Embedding sample code into README...\n');

  const readmePath = path.resolve(projectRootPath, 'README.md');
  const samplesDir = path.resolve(projectRootPath, 'samples');

  try {
    // Read current README
    let readmeContent = await fs.readFile(readmePath, 'utf-8');

    // Process each sample file
    for (const [sampleFile, mapping] of Object.entries(SAMPLE_MAPPINGS)) {
      const samplePath = path.resolve(samplesDir, sampleFile);

      try {
        // Read sample file content
        // eslint-disable-next-line no-await-in-loop
        const sampleContent = await fs.readFile(samplePath, 'utf-8');

        // Find the section in README
        const sectionStartIndex = readmeContent.indexOf(mapping.start);
        if (sectionStartIndex === -1) {
          console.warn(
            `⚠️  Section not found for ${sampleFile}: ${mapping.start}`,
          );
          continue;
        }

        // Find the code block within that section
        const searchStart = sectionStartIndex;
        const codeBlockStartIndex = readmeContent.indexOf(
          mapping.codeBlockStart,
          searchStart,
        );
        if (codeBlockStartIndex === -1) {
          console.warn(`⚠️  Code block start not found for ${sampleFile}`);
          continue;
        }

        // Find the end of the code block
        const codeBlockEndIndex = readmeContent.indexOf(
          mapping.codeBlockEnd,
          codeBlockStartIndex + mapping.codeBlockStart.length,
        );
        if (codeBlockEndIndex === -1) {
          console.warn(`⚠️  Code block end not found for ${sampleFile}`);
          continue;
        }

        // Replace the code block content
        const beforeBlock = readmeContent.substring(
          0,
          codeBlockStartIndex + mapping.codeBlockStart.length,
        );
        const afterBlock = readmeContent.substring(codeBlockEndIndex);

        readmeContent = `${beforeBlock}\n${sampleContent}\n${afterBlock}`;

        console.log(`✓ Updated code block for ${sampleFile}`);
      } catch (error) {
        console.error(
          `⚠️  Could not read sample file ${sampleFile}: ${String(error)}`,
        );
        process.exit(1);
      }
    }

    // Write updated README
    await fs.writeFile(readmePath, readmeContent, 'utf-8');
    console.log('\n✅ Successfully embedded all sample code into README.md!');
  } catch (error) {
    console.error(`❌ Failed to embed samples: ${String(error)}`);
    process.exit(1);
  }
};

await embedSamples();
