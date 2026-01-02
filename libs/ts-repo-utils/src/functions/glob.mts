import type * as fsWalk from '@nodelib/fs.walk';
import fastGlob from 'fast-glob';
import { castDeepMutable, castMutable } from 'ts-data-forge';

type EntryInternal = DeepReadonly<fsWalk.Entry>;

type PatternInternal = string;

type OptionsInternal = DeepReadonly<fastGlob.Options>;

type EntryObjectModePredicate = Readonly<{
  [TKey in keyof Pick<OptionsInternal, 'objectMode'>]-?: true;
}>;

type EntryStatsPredicate = Readonly<{
  [TKey in keyof Pick<OptionsInternal, 'stats'>]-?: true;
}>;

type EntryObjectPredicate = EntryObjectModePredicate | EntryStatsPredicate;

export async function glob(
  source: PatternInternal | readonly PatternInternal[],
  options: OptionsInternal & EntryObjectPredicate,
): Promise<Result<readonly EntryInternal[], unknown>>;

export async function glob(
  source: PatternInternal | readonly PatternInternal[],
  options?: OptionsInternal,
): Promise<Result<readonly string[], unknown>>;

export async function glob(
  source: PatternInternal | readonly PatternInternal[],
  options?: OptionsInternal,
): Promise<Result<readonly string[] | readonly EntryInternal[], unknown>> {
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
