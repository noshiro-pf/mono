import { makeEmptyDir } from 'ts-repo-utils';

// Reset ./tmp/build before writing artifacts
await makeEmptyDir('./tmp/build');
