import { executeStages, getWorkspacePackages } from 'ts-repo-utils';

const packages = await getWorkspacePackages('.');

await executeStages(packages, 'build', 3);
