import { Result } from 'ts-data-forge';
import { checkExt } from 'ts-repo-utils';

const result = await checkExt({
  directories: [
    { path: './src', extension: '.ts' },
    { path: './scripts', extension: '.mjs' },
  ],
});

if (Result.isErr(result)) {
  console.error(result.value.message);

  console.error('Files with wrong extensions:', result.value.files);
}
