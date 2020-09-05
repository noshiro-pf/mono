import { pathResolverMaker } from './path_resolver_maker';

// assuming this script is in mono/scripts
export const monoRootAbsolutePath = pathResolverMaker(__dirname)('../');
export const absolutePathFromMonoRoot = pathResolverMaker(monoRootAbsolutePath);
