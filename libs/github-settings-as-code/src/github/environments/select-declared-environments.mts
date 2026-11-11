import { Arr } from 'ts-data-forge';
import type { Declaration } from '../list-json-files.mjs';

/**
 * The live environments `apply` may write back, each with the file the
 * declaration that names it was read from. One that exists only on GitHub (made
 * in the UI, or created by GitHub when a workflow names it) is left to the
 * drift check rather than adopted as a declaration.
 *
 * Names are compared without case, as GitHub compares them: a declaration of
 * `Production` sets the environment GitHub spells `production`, and its file is
 * the one rewritten, rather than a second file under GitHub's spelling.
 */
export const selectDeclaredEnvironments = <
  const E extends Readonly<{ name: string }>,
>(
  live: readonly E[],
  declared: readonly Declaration<Readonly<{ name: string }>>[],
): readonly Readonly<{ file: string; environment: E }>[] => {
  const fileOf: ReadonlyMap<string, string> = new Map(
    declared.map(({ file, value }) => [value.name.toLowerCase(), file]),
  );

  return Arr.generate(function* () {
    for (const environment of live) {
      const file = fileOf.get(environment.name.toLowerCase());

      if (file !== undefined) {
        yield { file, environment };
      }
    }
  });
};
