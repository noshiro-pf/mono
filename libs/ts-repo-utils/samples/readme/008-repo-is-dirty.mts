import { repoIsDirty } from 'ts-repo-utils';

const isDirty = await repoIsDirty();

if (isDirty) {
  console.log('Repository has uncommitted changes');
}
