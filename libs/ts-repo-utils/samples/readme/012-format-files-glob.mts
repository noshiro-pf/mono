import { formatFilesGlob } from 'ts-repo-utils';

// Format all TypeScript files in src
await formatFilesGlob('src/**/*.ts');

// Format specific files
await formatFilesGlob('src/{index,utils}.ts');

// With custom ignore function
await formatFilesGlob('src/**/*.ts', {
  ignore: (filePath) => filePath.includes('generated'),
  ignoreUnknown: false, // Error on files without parser
});
