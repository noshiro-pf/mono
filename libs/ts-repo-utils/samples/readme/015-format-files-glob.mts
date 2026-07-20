import { formatFilesGlob } from 'ts-repo-utils';

// Format all TypeScript files in src
await formatFilesGlob('src/**/*.ts');

// Format specific files
await formatFilesGlob('src/{index,utils}.ts');
