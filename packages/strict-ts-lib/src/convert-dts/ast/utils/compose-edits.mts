import { type Edit, type SgNode } from '@ast-grep/napi';
import { type Kinds, type TypesMap } from '@ast-grep/napi/types/staticTypes';
import { castMutable, isNotUndefined, pipe, Result } from '@noshiro/mono-utils';
import { replaceAstWithNoMatchCheck } from './replace-ast-with-no-match-check.mjs';

export const composeReplaceOperations = (
  astNode: DeepReadonly<SgNode<TypesMap, Kinds<TypesMap>>>,
  operations: DeepReadonly<
    (
      | [
          before: string,
          after: string,
          options?: Readonly<{
            onNotFound: 'off' | 'error';
          }>,
        ]
      | undefined
    )[]
  >,
): Result<string, string> =>
  pipe(
    composeEdits(
      operations
        .filter(isNotUndefined)
        .map(([before, after, options]) =>
          replaceAstWithNoMatchCheck(astNode, before, after, options),
        ),
    ),
  ).chain((result) =>
    Result.isErr(result)
      ? result
      : Result.ok(astNode.commitEdits(castMutable(result.value))),
  ).value;

const composeEdits = (
  replaceResults: readonly Result<DeepReadonly<Edit> | undefined, string>[],
): Readonly<Result<readonly Edit[], string>> =>
  replaceResults.every(Result.isOk)
    ? Result.ok(replaceResults.map((r) => r.value).filter(isNotUndefined))
    : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      replaceResults.find(Result.isErr)!;
