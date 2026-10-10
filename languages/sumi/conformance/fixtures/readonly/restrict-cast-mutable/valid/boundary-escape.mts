import { castMutable } from 'ts-data-forge';
import { joinAll } from '../outside-api.mjs';

// `joinAll` declares its parameters mutable and never mutates them. The
// result of the escape goes straight to the call — as an argument, or inside
// the literal the call receives.
export const joined = (
  parts: readonly string[],
  separators: readonly string[],
): string => joinAll(castMutable(parts), { separators: castMutable(separators) });
