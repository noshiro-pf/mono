import { ISet } from 'ts-data-forge';

export const invalidDeepReadonlyTypeName = ISet.create([
  'Readonly',
  'readonly',
  'ReadonlyArray',
  'Array',
  'Set',
  'Map',
  'ReadonlySet',
  'ReadonlyMap',
]);
