# JSDoc Example Embedding Script

This script embeds sample code from `samples/src` into `@example` blocks within JSDoc comments in source files under `src`.

## Usage

### 1. Prepare JSDoc in Source Files

Add `@example` blocks to the JSDoc comments.

**Before:**

```typescript
/**
 * Function description...
 *
 * @param x Parameter description
 * @returns Return value description
 */
```

**After:**

````typescript
/**
 * Function description...
 *
 * @example
 * ```ts
 * ```
 *
 * @param x Parameter description
 * @returns Return value description
 */
````

### 2. Add Mapping Definition

Add mappings of source files to their sample files in `sourceFileMappings` within `scripts/cmd/embed-examples-in-jsdoc-map.mts`. Sample files must be listed in the order they appear in the source file (from top to bottom).

```typescript
const sourceFileMappings: readonly SourceFileMapping[] = [
    {
        sourcePath: 'src/array/array-utils.mts',
        sampleFiles: [
            'samples/src/array/array-utils/at-example.mts',
            'samples/src/array/array-utils/head-example.mts',
            // ... add more sample files in order
        ],
    },
    // mappings for other source files
];
```

### 3. Run the Script

```bash
npm run doc:embed:jsdoc
```

Or run directly:

```bash
npx tsx scripts/cmd/embed-examples-in-jsdoc.mts
```

## How It Works

### embed-examples-in-jsdoc.mts

1. Reads each source file defined in `sourceFileMappings`
2. For each sample file:
    - Reads the sample file content and excludes parts surrounded by ignore keywords
    - Finds the next ` ```ts ` code block in the source file
    - Replaces the code block content with the sample code (with proper indentation)
3. Formats modified files with Prettier

## Sample Code Format Control

You can control the embedded range within sample files using the following keywords:

- `// embed-sample-code-ignore-above`: Code above this line will not be embedded
- `// embed-sample-code-ignore-below`: Code below this line will not be embedded
- `/* embed-sample-code-ignore-this-line */ ...`: This entire line will be excluded

**Example:**

```typescript
// This comment will not be embedded

// embed-sample-code-ignore-above
import { Arr } from 'ts-data-forge';

const result = Arr.at([1, 2, 3], 1);

/* embed-sample-code-ignore-this-line */ console.log(result); // This line will not be embedded
// embed-sample-code-ignore-below

// This comment will not be embedded
```

## Notes

- The order of sample files must match the order of `@example` blocks in the source file
- An error will occur if the number of code blocks and sample files do not match
- Existing code block content will be completely overwritten
