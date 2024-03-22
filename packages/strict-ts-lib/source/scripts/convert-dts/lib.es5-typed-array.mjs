import { pipe } from '@noshiro/mono-scripts/ts-utils/pipe.mjs';
import { replaceWithNoMatchCheck } from '@noshiro/mono-scripts/ts-utils/replace-with-no-match-check.mjs';
import { indexType } from './common.mjs';
import { convertTypedArrayCommon } from './lib.typed-array-common.mjs';

/**
 * @typedef {'Int8'
 *   | 'Uint8'
 *   | 'Uint8Clamped'
 *   | 'Int16'
 *   | 'Uint16'
 *   | 'Int32'
 *   | 'Uint32'
 *   | 'Float32'
 *   | 'Float64'} ElemType
 */

/** @param {ElemType} elemType */
const marker = (elemType) => {
  const markerArray = `interface ${elemType}Array {`;
  const markerArrayConstructor = `interface ${elemType}ArrayConstructor {`;
  const markerDeclareConstArray = `declare const ${elemType}Array: ${elemType}ArrayConstructor`;

  return {
    Array: {
      start: markerArray,
      end: markerArrayConstructor,
    },
    ArrayConstructor: {
      start: markerArrayConstructor,
      end: markerDeclareConstArray,
    },
  };
};

/**
 * @param {string} from
 * @returns {string}
 */
export const convertLibEs5_TypedArray = (from) => {
  let mut_ret = from;

  /** @type {readonly ElemType[]} */
  const elemTypes = [
    'Int8',
    'Uint8',
    'Uint8Clamped',
    'Int16',
    'Uint16',
    'Int32',
    'Uint32',
    'Float32',
    'Float64',
  ];

  for (const elemType of elemTypes) {
    {
      const slice = mut_ret.slice(
        mut_ret.indexOf(marker(elemType).Array.start),
        mut_ret.indexOf(marker(elemType).Array.end),
      );
      mut_ret = pipe(mut_ret).chain(
        replaceWithNoMatchCheck(
          slice,
          convertInterfaceTypedArray(slice, elemType),
        ),
      ).value;
    }
    {
      const slice = mut_ret.slice(
        mut_ret.indexOf(marker(elemType).ArrayConstructor.start),
        mut_ret.indexOf(marker(elemType).ArrayConstructor.end),
      );
      mut_ret = pipe(mut_ret).chain(
        replaceWithNoMatchCheck(
          slice,
          convertInterfaceTypedArrayConstructor(slice, elemType),
        ),
      ).value;
    }
  }

  mut_ret = pipe(mut_ret).chain(
    replaceWithNoMatchCheck(
      [
        '   * @param compareFn Function used to determine the order of the elements. It',
        '   *   is expected to return a negative value if first argument is less than',
        "   *   second argument, zero if they're equal and a positive value otherwise.",
        '   *   If omitted, the elements are sorted in ascending order.',
      ].join('\n'),
      [
        '   * @param compareFn Function used to determine the order of the elements. It',
        '   *   is expected to return a negative value if the first argument is less than',
        "   *   the second argument, zero if they're equal, and a positive value otherwise.",
        '   *   If omitted, the elements are sorted in ascending order.',
      ].join('\n'),
    ),
  ).value;

  // DataView
  const markers = {
    ArrayBuffer: {
      start: 'interface ArrayBuffer {',
      end: 'interface ArrayBufferTypes {',
    },
    DataView: {
      start: 'interface DataView {',
      end: 'interface DataViewConstructor {',
    },
  };

  {
    const slice = mut_ret.slice(
      mut_ret.indexOf(markers.ArrayBuffer.start),
      mut_ret.indexOf(markers.ArrayBuffer.end),
    );

    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(
        slice,
        pipe(slice).chain(
          replaceWithNoMatchCheck(
            `slice(begin: number, end?: number)`,
            `slice(begin: ${indexType.arg}, end?: ${indexType.arg})`,
          ),
        ).value,
      ),
    ).value;
  }
  {
    const slice = mut_ret.slice(
      mut_ret.indexOf(markers.DataView.start),
      mut_ret.indexOf(markers.DataView.end),
    );

    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(slice, convertDataView(slice)),
    ).value;
  }

  return mut_ret;
};

/**
 * @param {string} from
 * @param {ElemType} elementTypeArg
 * @returns {string}
 */
const convertInterfaceTypedArray = (from, elementTypeArg) => {
  let mut_ret = from;

  const arrayType = `${elementTypeArg}Array`;

  const elementType =
    elementTypeArg === 'Uint8Clamped' ? 'Uint8' : elementTypeArg;

  mut_ret = convertTypedArrayCommon(mut_ret);

  mut_ret = pipe(mut_ret)
    .chain(
      replaceWithNoMatchCheck(
        `readonly BYTES_PER_ELEMENT: number;`,
        `readonly BYTES_PER_ELEMENT: ${BYTES_PER_ELEMENT(elementType)};`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        `readonly [index: number]: number;`,
        `readonly [index: number]: ${elementType};`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'compareFn?: (a: number, b: number) => number',
        `compareFn?: (a: ${elementType}, b: ${elementType}) => number`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'set(array: ArrayLike<number>',
        `set(array: ArrayLike<${elementType}>`,
      ),
    ).value;

  // Note: Uint8Clamped のみ型名が長いことにより改行位置が異なるメソッドがあるため、それらについて検索文字列を変えている。
  if (elementTypeArg === 'Uint8Clamped') {
    mut_ret = pipe(mut_ret)
      .chain(
        replaceWithNoMatchCheck(
          [
            '  findIndex(',
            '    predicate: (',
            '      value: number,',
            '      index: number,',
            '      obj: Uint8ClampedArray,',
            '    ) => boolean,',
            '    thisArg?: unknown,',
            '  ): number;',
          ].join('\n'),
          [
            '  findIndex(',
            '    predicate: (',
            '      value: Uint8,',
            `      index: ${indexType.callbackArg},`,
            '      obj: Uint8ClampedArray,',
            '    ) => boolean,',
            '    thisArg?: unknown,',
            `  ): ${indexType.searchResult};`,
          ].join('\n'),
        ),
      )
      .chain(
        replaceWithNoMatchCheck(
          [
            '  find(',
            '    predicate: (',
            '      value: number,',
            '      index: number,',
            '      obj: Uint8ClampedArray,',
            '    ) => boolean,',
            '    thisArg?: unknown,',
            '  ): number | undefined;',
          ].join('\n'),
          [
            '  find(',
            '    predicate: (',
            '      value: Uint8,',
            `      index: ${indexType.callbackArg},`,
            '      obj: Uint8ClampedArray,',
            '    ) => boolean,',
            '    thisArg?: unknown,',
            '  ): Uint8 | undefined;',
          ].join('\n'),
        ),
      )
      .chain(
        replaceWithNoMatchCheck(
          [
            '  forEach(',
            '    callbackfn: (',
            '      value: number,',
            '      index: number,',
            '      array: Uint8ClampedArray,',
            '    ) => void,',
            '    thisArg?: unknown,',
            '  ): void;',
          ].join('\n'),
          [
            '  forEach(',
            '    callbackfn: (',
            '      value: Uint8,',
            `      index: ${indexType.callbackArg},`,
            '      array: Uint8ClampedArray,',
            '    ) => void,',
            '    thisArg?: unknown,',
            '  ): void;',
          ].join('\n'),
        ),
      )
      .chain(
        replaceWithNoMatchCheck(
          [
            '  map(',
            '    callbackfn: (',
            '      value: number,',
            '      index: number,',
            '      array: Uint8ClampedArray,',
            '    ) => number,',
            '    thisArg?: unknown,',
            '  ): Uint8ClampedArray;',
          ].join('\n'),
          [
            '  map(',
            '    callbackfn: (',
            '      value: Uint8,',
            `      index: ${indexType.callbackArg},`,
            '      array: Uint8ClampedArray,',
            '    ) => Uint8,',
            '    thisArg?: unknown,',
            '  ): Uint8ClampedArray;',
          ].join('\n'),
        ),
      )
      .chain(
        replaceWithNoMatchCheck(
          [
            '    predicate: (',
            '      value: number,',
            '      index: number,',
            '      array: Uint8ClampedArray,',
            '    ) => unknown,',
          ].join('\n'),
          [
            '    predicate: (',
            '      value: Uint8,',
            `      index: ${indexType.callbackArg},`,
            '      array: Uint8ClampedArray,',
            '    ) => boolean,',
          ].join('\n'),
        ),
      ).value;
  } else {
    mut_ret = pipe(mut_ret)
      .chain(
        replaceWithNoMatchCheck(
          `callbackfn: (value: number, index: number, array: ${arrayType}) => number`,
          `callbackfn: (value: ${elementType}, index: ${indexType.callbackArg}, array: ${arrayType}) => ${elementType}`,
        ),
      )
      .chain(
        replaceWithNoMatchCheck(
          [
            '  find(',
            `    predicate: (value: number, index: number, obj: ${arrayType}) => boolean,`,
            '    thisArg?: unknown,',
            '  ): number | undefined;',
          ].join('\n'),
          [
            '  find(',
            `    predicate: (value: ${elementType}, index: ${indexType.callbackArg}, obj: ${arrayType}) => boolean,`,
            '    thisArg?: unknown,',
            `  ): ${elementType} | undefined;`,
          ].join('\n'),
        ),
      )
      .chain(
        replaceWithNoMatchCheck(
          [
            '  findIndex(',
            `    predicate: (value: number, index: number, obj: ${arrayType}) => boolean,`,
            '    thisArg?: unknown,',
            '  ): number;',
          ].join('\n'),
          [
            '  findIndex(',
            `    predicate: (value: ${elementType}, index: ${indexType.callbackArg}, obj: ${arrayType}) => boolean,`,
            '    thisArg?: unknown,',
            `  ): ${indexType.searchResult};`,
          ].join('\n'),
        ),
      )
      .chain(
        replaceWithNoMatchCheck(
          `predicate: (value: number, index: number, array: ${arrayType}) => unknown`,
          `predicate: (value: ${elementType}, index: ${indexType.callbackArg}, array: ${arrayType}) => boolean`,
        ),
      )
      .chain(
        replaceWithNoMatchCheck(
          `callbackfn: (value: number, index: number, array: ${arrayType}) => void`,
          `callbackfn: (value: ${elementType}, index: ${indexType.callbackArg}, array: ${arrayType}) => void`,
        ),
      ).value;
  }

  mut_ret = pipe(mut_ret)
    .chain(
      replaceWithNoMatchCheck(
        [
          // reduce / reduceRight
          '    callbackfn: (',
          '      previousValue: number,',
          '      currentValue: number,',
          `      currentIndex: ${indexType.callbackArg},`,
          `      array: ${arrayType},`,
          '    ) => number,',
          '  ): number;',
        ].join('\n'),
        [
          '    callbackfn: (',
          `      previousValue: ${elementType},`,
          `      currentValue: ${elementType},`,
          `      currentIndex: ${indexType.callbackArg},`,
          `      array: ${arrayType},`,
          `    ) => ${elementType}`,
          `  ): ${elementType};`,
        ].join('\n'),
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        [
          // reduce / reduceRight
          '    callbackfn: (',
          '      previousValue: number,',
          '      currentValue: number,',
          `      currentIndex: ${indexType.callbackArg},`,
          `      array: ${arrayType},`,
          '    ) => number,',
          '    initialValue: number,',
          '  ): number;',
        ].join('\n'),
        [
          '    callbackfn: (',
          `      previousValue: ${elementType},`,
          `      currentValue: ${elementType},`,
          `      currentIndex: ${indexType.callbackArg},`,
          `      array: ${arrayType},`,
          `    ) => ${elementType},`,
          `    initialValue: ${elementType},`,
          `  ): ${elementType};`,
        ].join('\n'),
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        'currentValue: number',
        `currentValue: ${elementType}`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        `fill(value: number, start?: number, end?: number)`,
        `fill(value: ${elementType}, start?: ${indexType.arg}, end?: ${indexType.arg})`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        `searchElement: number`,
        `searchElement: ${elementType}`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        `fromIndex?: ${indexType.arg}): number;`,
        `fromIndex?: ${indexType.arg}): ${indexType.searchResult};`,
      ),
    )
    .chain(replaceWithNoMatchCheck('/**', '\n\n/**')).value;

  return mut_ret;
};

/**
 * @param {string} from
 * @param {ElemType} elementTypeArg
 * @returns {string}
 */
const convertInterfaceTypedArrayConstructor = (from, elementTypeArg) => {
  const elementType =
    elementTypeArg === 'Uint8Clamped' ? 'Uint8' : elementTypeArg;

  return pipe(from)
    .chain(
      replaceWithNoMatchCheck(
        `readonly BYTES_PER_ELEMENT: number;`,
        `readonly BYTES_PER_ELEMENT: ${BYTES_PER_ELEMENT(elementType)};`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(
        `new (array: ArrayLike<number>`,
        `new (array: ArrayLike<${elementType}>`,
      ),
    )
    .chain(
      replaceWithNoMatchCheck(`length?: number`, `length?: ${indexType.size}`),
    )
    .chain(
      replaceWithNoMatchCheck(
        `mapfn: (v: T, k: number) => number,`,
        `mapfn: (v: T, k: ${indexType.callbackArg}) => ${elementType},`,
      ),
    )
    .chain(replaceWithNoMatchCheck('number', elementType)).value;
};

/**
 * @param {Exclude<ElemType, 'Uint8Clamped'>} elementType
 * @returns {1 | 2 | 4 | 8}
 */
const BYTES_PER_ELEMENT = (elementType) => {
  switch (elementType) {
    case 'Int8':
      return 1;
    case 'Int16':
      return 2;
    case 'Int32':
      return 4;
    case 'Uint8':
      return 1;
    case 'Uint16':
      return 2;
    case 'Uint32':
      return 4;
    case 'Float32':
      return 4;
    case 'Float64':
      return 8;
  }
};

/**
 * @param {string} from
 * @returns {string}
 */
const convertDataView = (from) => {
  let mut_ret = from;

  for (const [fn, valueType] of [
    ['getInt8', 'Int8'],
    ['getUint8', 'Uint8'],
  ]) {
    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(
        `${fn}(byteOffset: SafeUint): number;`,
        `${fn}(byteOffset: SafeUint): ${valueType};`,
      ),
    ).value;
  }

  for (const [fn, valueType] of [
    ['getInt16', 'Int16'],
    ['getUint16', 'Uint16'],
    ['getInt32', 'Int32'],
    ['getUint32', 'Uint32'],
    ['getFloat32', 'Float32'],
    ['getFloat64', 'Float64'],
  ]) {
    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(
        `${fn}(byteOffset: SafeUint, littleEndian?: boolean): number;`,
        `${fn}(byteOffset: SafeUint, littleEndian?: boolean): ${valueType};`,
      ),
    ).value;
  }

  for (const [fn, valueType] of [
    ['setInt8', 'Int8'],
    ['setUint8', 'Uint8'],
  ]) {
    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(
        `${fn}(byteOffset: SafeUint, value: number): void;`,
        `${fn}(byteOffset: SafeUint, value: ${valueType}): void;`,
      ),
    ).value;
  }

  for (const [fn, valueType] of [
    ['setInt16', 'Int16'],
    ['setUint16', 'Uint16'],
    ['setInt32', 'Int32'],
    ['setUint32', 'Uint32'],
    ['setFloat32', 'Float32'],
    ['setFloat64', 'Float64'],
  ]) {
    mut_ret = pipe(mut_ret).chain(
      replaceWithNoMatchCheck(
        `${fn}(byteOffset: SafeUint, value: number, littleEndian?: boolean): void;`,
        `${fn}(byteOffset: SafeUint, value: ${valueType}, littleEndian?: boolean): void;`,
      ),
    ).value;
  }

  return mut_ret;
};
