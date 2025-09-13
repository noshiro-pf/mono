import { formatFilesGlob, genIndex } from 'ts-repo-utils';

// Generate barrel exports
await genIndex({ targetDirectory: './src' });

// Type check
await $('tsc --noEmit');

// Build
await $('rollup -c');

// Format output
await formatFilesGlob('dist/**/*.js');
