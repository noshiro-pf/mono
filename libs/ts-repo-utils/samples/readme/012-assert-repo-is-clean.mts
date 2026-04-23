import { assertRepoIsClean } from 'ts-repo-utils';

// Use in CI/build scripts to ensure clean state
await assertRepoIsClean();
