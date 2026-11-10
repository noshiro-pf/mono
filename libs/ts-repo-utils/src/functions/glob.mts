import type * as fsWalk from '@nodelib/fs.walk';
import fastGlob from 'fast-glob';
import { castDeepMutable, castMutable, Result } from 'ts-data-forge';
import type { DeepReadonly, StrictPick } from 'ts-type-forge';

/** An entry `glob` gives with `objectMode` or `stats`. */
export type GlobEntry = DeepReadonly<fsWalk.Entry>;

/** The options of `glob`: fast-glob's. */
export type GlobOptions = DeepReadonly<fastGlob.Options>;

/** The options that make `glob` give entries instead of paths. */
export type GlobEntryOptions = Readonly<
  | { [TKey in keyof StrictPick<GlobOptions, 'objectMode'>]-?: true }
  | { [TKey in keyof StrictPick<GlobOptions, 'stats'>]-?: true }
>;

export async function glob(
  source: string | readonly string[],
  options: GlobOptions & GlobEntryOptions,
): Promise<Result<readonly GlobEntry[], unknown>>;

export async function glob(
  source: string | readonly string[],
  options?: GlobOptions,
): Promise<Result<readonly string[], unknown>>;

export async function glob(
  source: string | readonly string[],
  options?: GlobOptions,
): Promise<Result<readonly string[] | readonly GlobEntry[], unknown>> {
  try {
    const result = await fastGlob(
      castMutable(source),
      castDeepMutable(options),
    );

    return Result.ok(result);
  } catch (error) {
    return Result.err(error);
  }
}
