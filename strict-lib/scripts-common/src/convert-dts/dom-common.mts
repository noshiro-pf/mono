import { pipe } from 'ts-data-forge';
import { type MonoTypeFunction } from 'ts-type-forge';
import {
  composeMonoTypeFns,
  replaceWithNoMatchCheck,
  replaceWithinInterface,
} from '../functions/utils/node-utils.mjs';
import { idFn, type ConverterOptions } from './common.mjs';

export const convertLibDomCommon =
  ({ config: { returnType } }: ConverterOptions): MonoTypeFunction<string> =>
  (src) =>
    pipe(src).map(
      composeMonoTypeFns(
        replaceWithNoMatchCheck(
          'json(): Promise<unknown>;',
          `json(): Promise<${returnType === 'readonly' ? 'JsonValue' : 'MutableJsonValue'}>;`,
        ),
        // 引数を readonly array 型にする（lib.dom には eslint fix を用いないためここで replace が必要）
        replaceWithNoMatchCheck(
          // eslint-disable-next-line no-useless-escape
          /([_\$a-zA-Z][_\$a-zA-Z0-9]*)\[\]/gu,
          // /([_\$a-zA-Z\\xA0-\\uFFFF][_\$a-zA-Z0-9\\xA0-\\uFFFF]*)\[\]/gu,
          'readonly $1[]',
        ),
        replaceWithNoMatchCheck(
          'type HeadersInit = [string, string][]',
          'type HeadersInit = readonly (readonly [string, string])[]',
        ),
        replaceWithNoMatchCheck(
          'readonly string[][]',
          'readonly (readonly string[])[]',
        ),
        replaceWithNoMatchCheck(
          //
          'readonly any[]',
          'readonly unknown[]',
        ),
        replaceWithinInterface({
          name: 'Request',
          mapFn: replaceWithNoMatchCheck(
            'readonly method: string;',
            'readonly method: HTTPRequestMethod;',
          ),
        }), // https://developer.mozilla.org/ja/docs/Web/HTML/Element/form#method
        replaceWithinInterface({
          name: 'XMLHttpRequest',
          mapFn: replaceWithNoMatchCheck(
            'method: string',
            "method: 'post' | 'get' | 'dialog'",
          ),
        }),

        // use mutable array in return value (undo of batch replacement results)
        returnType === 'readonly'
          ? idFn
          : replaceWithinInterface({
              name: 'FileSystemDirectoryHandle',
              mapFn: replaceWithNoMatchCheck(
                '): Promise<readonly string[] | null>',
                '): Promise<string[] | null>',
              ),
            }),
        returnType === 'readonly'
          ? idFn
          : replaceWithinInterface({
              name: 'IDBIndex',
              mapFn: replaceWithNoMatchCheck(
                /\): IDBRequest<readonly ([_$a-zA-Z][_$a-zA-Z0-9]*)\[\]>/gu,
                '): IDBRequest<$1[]>',
              ),
            }),
        returnType === 'readonly'
          ? idFn
          : replaceWithinInterface({
              name: 'IDBObjectStore',
              mapFn: replaceWithNoMatchCheck(
                /\): IDBRequest<readonly ([_$a-zA-Z][_$a-zA-Z0-9]*)\[\]>/gu,
                '): IDBRequest<$1[]>',
              ),
            }),
      ),
    ).value;
