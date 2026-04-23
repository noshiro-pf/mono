import { genIndex } from 'ts-repo-utils';

await genIndex({
  targetDirectory: './src',
  exclude: ['*.test.ts', '*.spec.ts'],
});
