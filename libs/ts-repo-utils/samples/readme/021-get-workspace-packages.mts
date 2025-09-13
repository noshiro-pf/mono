import { getWorkspacePackages } from 'ts-repo-utils';

const packages = await getWorkspacePackages('.');
console.log(packages.map((pkg) => pkg.name));
// ['@myorg/package-a', '@myorg/package-b', ...]
