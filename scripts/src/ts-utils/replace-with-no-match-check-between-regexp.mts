import { replaceWithNoMatchCheck } from './replace-with-no-match-check.mjs';
import { sliceByMatch } from './slice-by-match.mjs';

/**
 * Replace all instances of a substring in a string, using a regular expression
 * or search string. Replacements are performed only on substrings of target
 * between the start and end positions that match the regular expression.
 *
 * @throws {Error} If no match is found.
 */
export const replaceWithNoMatchCheckBetweenRegexp =
  ({
    startRegexp,
    endRegexp,
    mapFn,
    options,
  }: Readonly<{
    startRegexp: RegExp | string;
    endRegexp: RegExp | string | undefined;
    mapFn: (slice: string) => string;
    options?: Readonly<
      | {
          onNotFound: 'off';
          onNoChange: 'off';
        }
      | {
          onNotFound: 'throw';
          onNoChange: 'off' | 'throw' | 'warn';
        }
      | {
          onNotFound: 'warn';
          onNoChange: 'off' | 'warn';
        }
    >;
  }>) =>
  (target: string): string => {
    const slice = sliceByMatch({
      target,
      startRegexp,
      endRegexp,
    });

    return replaceWithNoMatchCheck(slice, mapFn(slice), options)(target);
  };
