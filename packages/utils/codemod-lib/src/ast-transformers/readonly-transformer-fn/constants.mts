import { ISet } from '@noshiro/ts-type-utils';

export const invalidDeepReadonlyTypeName = ISet.new([
  'Readonly',
  'readonly',
  'ReadonlyArray',
  'Array',
  'Set',
  'Map',
  'ReadonlySet',
  'ReadonlyMap',
]);
