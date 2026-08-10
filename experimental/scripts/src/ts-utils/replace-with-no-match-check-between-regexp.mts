import { replaceWithNoMatchCheck } from './replace-with-no-match-check.mjs';
import { sliceByMatch } from './slice-by-match.mjs';

/**
 * Replace all instances of a substring within a specified region of a string,
 * using a regular expression or search string. The region is defined by start
 * and end regular expressions.
 *
 * @example
 *   ```ts
 *   const replaceBetween = replaceWithNoMatchCheckBetweenRegexp({
 *   startRegexp: /<p>/,
 *   endRegexp: /<\/p>/,
 *   mapFn: (slice) => slice.replace(/apple/g, 'orange'),
 *   });
 *
 *   const result = replaceBetween('<p>I have an apple.</p><div>Another apple.</div>');
 *   // '<p>I have an orange.</p><div>Another apple.</div>'
 *   ```;
 *
 * @param startRegexp A regular expression or string that marks the start of the
 *   region.
 * @param endRegexp An optional regular expression or string that marks the end
 *   of the region. If undefined, the replacement occurs from the start match to
 *   the end of the string.
 * @param mapFn A function that takes a substring within the matched region and
 *   returns the replacement string.
 * @param options Options controlling behavior when no matches or no changes
 *   occur.
 * @param options.onNotFound Specifies the action to take when the start or end
 *   regexp is not found.
 *
 *   - 'off': No action; returns the original string.
 *   - 'warn': Logs a warning message; returns the original string.
 *   - 'throw': Throws an error; this is the default behavior.
 *
 * @param options.onNoChange Specifies the action to take when replacement has
 *   no effect.
 *
 *   - If `onNotFound` is 'off', this option will have no effect. replacement will
 *       be skipped if `startRegexp` or `endRegexp` is not found, regardless of
 *       `onNoChange` setting.
 *   - 'off': No action; returns the original string.
 *   - 'warn': Logs a warning message; returns the original string.
 *   - 'throw': Throws an error; this is the default behavior except when
 *       `onNotFound` is 'off'.
 *
 * @returns A function that takes a string and returns the string with
 *   replacements applied within the specified region.
 * @throws {Error} If no match is found and `options.onNotFound` is 'throw' (or
 *   omitted).
 * @throws {Error} If replacement has no effect and `options.onNoChange` is
 *   'throw' (or omitted, except when `options.onNotFound` is 'off').
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
          onNotFound: 'warn';
          onNoChange: 'off' | 'warn';
        }
      | {
          onNotFound: 'throw';
          onNoChange: 'off' | 'throw' | 'warn';
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
