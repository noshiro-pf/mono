/* eslint-disable import/no-internal-modules */
import autoImport from 'unplugin-auto-import/esbuild';

// // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
// import { autoImportDef } from '@noshiro/global-ts-utils';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const autoImportsDef = autoImport({
  include: [/\.[jt]sx?$/u],
  /* options */
  dts: false,
  imports: [
    {
      '@noshiro/ts-utils': [
        'Arr',
        'ArrayUtils',
        'assertNotUndefined',
        'castWritable',
        'createQueue',
        'createTinyObservable',
        'DateUtils',
        'expectType',
        'hasKey',
        'hasKeyValue',
        'idfn',
        'ifThen',
        'IMap',
        'IMapMapped',
        'isBoolean',
        'ISet',
        'ISetMapped',
        'isNonNullObject',
        'isNotBoolean',
        'isNotNull',
        'isNotNumber',
        'isNotString',
        'isNotSymbol',
        'isNotUndefined',
        'isNull',
        'isNumber',
        'isPrimitive',
        'isRecord',
        'isString',
        'isSymbol',
        'isUndefined',
        'Json',
        'mapOptional',
        'mapOptionalC',
        'match',
        'Maybe',
        'memoizeFunction',
        // ['MutableMap', '_MutableMap'],
        // ['MutableSet', '_MutableSet'],
        'noop',
        'Num',
        'Obj',
        'pipe',
        // ['range', '_range'],
        'RecordUtils',
        'Result',
        'Str',
        'toBoolean',
        'tp',
      ],
    },
  ],
});
