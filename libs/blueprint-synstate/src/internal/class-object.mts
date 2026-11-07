import { constant, type Bindable, type ClassObject } from 'synstate-dom';
import { Arr, Obj } from 'ts-data-forge';

/**
 * A `class` object for synstate-dom, which takes either a string or one
 * `Bindable<boolean>` per class name, never both: the classes that are always
 * on — a string of several split at spaces, `false` and `undefined` dropped —
 * and those that come and go, as `[name, on]` pairs, those with no `on`
 * dropped.
 */
export const classObject = (
  always: readonly (string | false | undefined)[],
  toggled: readonly (readonly [string, Bindable<boolean> | undefined])[] = [],
): ClassObject =>
  Obj.fromEntries([
    ...always
      .flatMap((names) =>
        names === false || names === undefined ? [] : names.split(' '),
      )
      .filter((name) => name !== '')
      .map((name) => [name, constant(true)] as const),
    ...Arr.generate(function* () {
      for (const [name, on] of toggled) {
        if (on !== undefined) {
          yield [name, on] as const;
        }
      }
    }),
  ]);
