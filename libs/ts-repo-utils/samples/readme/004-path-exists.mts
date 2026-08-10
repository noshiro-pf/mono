import { pathExists } from 'ts-repo-utils';

const exists = await pathExists('./src/index.ts');

console.log(exists satisfies boolean); // true or false
