import { type MonoTypeFunction } from 'ts-type-forge';
import { replaceWithNoMatchCheck } from '../functions/utils/node-utils.mjs';

/**
 * Types the trailing arguments of a replacement callback — the one passed to
 * `String.prototype.replace` / `replaceAll` and to the `[Symbol.replace]` they
 * dispatch to — as `readonly (string | undefined)[]` rather than the
 * `readonly unknown[]` the blanket `any` → `unknown` conversion leaves behind.
 *
 * Upstream writes `...args: any[]` there, which says nothing at all. `unknown`
 * is the honest reading of that position — a capture group that did not take
 * part is `undefined`, and after the captures come the offset (a `number`), the
 * whole subject string, and, for a pattern with named groups, the groups
 * object. But it is honest at a price nobody was paying willingly: every
 * caller had to narrow with `isString` before using a group that a glance at
 * the pattern shows can never be absent, and the narrowing never failed. Two
 * packages here had that boilerplate, and in both the branch it guards is
 * unreachable (#1841).
 *
 * `string | undefined` is the type of a capture group, which is what a caller
 * names. It buys back contextual typing — an unannotated `(_m, digits) => …`
 * gives `digits: string | undefined`, so `?? ''` or a `!== undefined` check is
 * enough where `isString` used to be needed.
 *
 * **What it gives up**: a callback may now declare a parameter past the last
 * capture group as `string | undefined` and be handed the offset (a `number`)
 * or the groups object instead. That is unsound, and knowingly so — the
 * alternative is reading the participating-group count off a regular
 * expression literal, which is not a thing the type system can do. It is still
 * narrower than the `any[]` upstream ships, and the positions it mistypes are
 * ones a caller reaches only by counting arguments.
 *
 * All five declarations have to move together. `String.prototype.replace`'s
 * `searchValue` parameter names the `[Symbol.replace]` signature structurally,
 * so a `RegExp` stops being assignable to it the moment the two disagree.
 */
export const convertStringReplacerArgs: MonoTypeFunction<string> =
  replaceWithNoMatchCheck(
    'replacer: (substring: string, ...args: readonly unknown[]) => string',
    'replacer: (substring: string, ...args: readonly (string | undefined)[]) => string',
  );
