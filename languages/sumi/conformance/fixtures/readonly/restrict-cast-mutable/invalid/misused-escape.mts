import { castMutable } from 'ts-data-forge';
import { joinReadonly } from '../outside-api.mjs';

// Kept in a binding, the mutable view lives on in this code: a value that is
// to be mutated is copied instead.
export const appended = (parts: readonly string[]): number => {
  // @sumi-expect-error readonly/restrict-cast-mutable
  const mut_parts = castMutable(parts);

  mut_parts.push('');

  return mut_parts.length;
};

// A parameter that already takes the readonly value needs no cast.
export const joined = (parts: readonly string[]): string =>
  // @sumi-expect-error readonly/restrict-cast-mutable
  joinReadonly(castMutable(parts));
