import { executeParallel, getWorkspacePackages } from 'ts-repo-utils';

const packages = await getWorkspacePackages('.');

await executeParallel(packages, 'lint', 4);
