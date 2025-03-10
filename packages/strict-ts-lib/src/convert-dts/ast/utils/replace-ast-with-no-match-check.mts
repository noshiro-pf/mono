import { type Edit, type SgNode } from '@ast-grep/napi';
import { type Kinds, type TypesMap } from '@ast-grep/napi/types/staticTypes';
import { pipe, Result, toSafeUint } from '@noshiro/mono-utils';

/**
 * Replaces all instances of a substring in a string using a search pattern
 * defined with ast-grep.
 *
 * @param astNode The ast-grep node to search within.
 * @param searchPattern A string to search for using ast-grep pattern syntax.
 * @param replaceValue A string containing the text to replace for every
 *   successful match of searchPattern in the astNode.
 * @param options An optional object containing configuration options.
 * @param options.onNotFound Specifies how to handle cases where the
 *   searchPattern is not found.
 *
 *   - 'off': Returns an 'ok' result with an undefined edit.
 *   - 'error': Returns an 'err' result with a 'not-found' message.
 *
 * @returns An object indicating the result of the replacement.
 *
 *   - If the searchPattern is found, returns an 'ok' result with the Edit object
 *       containing the replacement.
 *   - If the searchPattern is not found and options.onNotFound is 'off', returns an
 *       'ok' result with undefined edit.
 *   - If the searchPattern is not found and options.onNotFound is 'error' (or
 *       omitted), returns an 'err' result with a 'not-found' message and the
 *       searchPattern.
 */
export const replaceAstWithNoMatchCheck = (
  astNode: DeepReadonly<SgNode<TypesMap, Kinds<TypesMap>>>,
  searchPattern: string,
  replaceValue: string,
  options?: Readonly<{
    onNotFound: 'off' | 'error';
  }>,
): Result<Edit | undefined, string> =>
  pipe(astNode.find(searchPattern)).chain((foundNode) =>
    foundNode === null
      ? options?.onNotFound !== 'off'
        ? Result.err(`No match found for "${chopIfLong(searchPattern)}".`)
        : Result.ok(undefined)
      : Result.ok(foundNode.replace(replaceValue)),
  ).value;

const sliceMaxLength = toSafeUint(100);

const chopIfLong = (str: string): string =>
  str.length > sliceMaxLength
    ? `${str.slice(0, sliceMaxLength)} ...(and more)`
    : str;
