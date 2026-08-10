import { assertPathExists } from 'ts-repo-utils';

// If the file doesn't exist, this will exit the process with code 1
await assertPathExists('./src/index.ts', 'Entry point file');
