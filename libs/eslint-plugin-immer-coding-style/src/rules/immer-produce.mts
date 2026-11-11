import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import {
  buildCalleeResolver,
  getImportDeclarations,
  isShadowedCallee,
} from 'eslint-rule-forge';
import { Arr, castDeepMutable } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';

/** Which of immer's recipe-taking functions a callee calls. */
export type ImmerProduce = 'produce' | 'produceWithPatches';

/**
 * For one file, a function that says which of immer's `produce` and
 * `produceWithPatches` a callee calls, or `undefined` when it calls neither.
 *
 * The callee is immer's when it is a named, aliased, default or namespace
 * import from `immer` (immer 9 and earlier export `produce` as the default too)
 * that nothing nearer shadows — a parameter, a local, an import from another
 * module ({@link isShadowedCallee}). The callee and a namespace object are read
 * through type wrappers.
 */
export const buildImmerProduceResolver = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
): ((
  callee: DeepReadonly<TSESTree.Expression>,
) => ImmerProduce | undefined) => {
  const immerImports = getImportDeclarations(sourceCode.ast, immerModule);

  if (Arr.isEmpty(immerImports)) {
    return () => undefined;
  }

  const resolveCallee = buildCalleeResolver(immerImports);

  return (callee) => {
    const resolved = resolveCallee(castDeepMutable(callee));

    if (
      resolved === undefined ||
      isShadowedCallee(sourceCode, resolved, immerModule)
    ) {
      return undefined;
    }

    switch (resolved.canonicalName) {
      case 'default':
      case 'produce':
        return 'produce';

      case 'produceWithPatches':
        return 'produceWithPatches';

      default:
        return undefined;
    }
  };
};

const immerModule = 'immer';
