/**
 * Asserts that the strict standard library is actually in effect here.
 *
 * `libReplacement` fails silently: if the `paths` entry goes missing, or a
 * config that `extends` another replaces `paths` without repeating it, or the
 * bundle stops being installed, TypeScript quietly falls back to its own
 * declarations. Nothing errors — the package just stops being type-checked
 * against the strict library, which is the whole point of opting in.
 *
 * `Number.isFinite` takes a `number` in the strict library and an `unknown` in
 * the stock one, so `@ts-expect-error` here is an assertion in the other
 * direction: this file stops compiling the moment the replacement stops
 * happening.
 */

// @ts-expect-error A string is not a `number`, which is what the strict
// standard library narrows this parameter to.
export const probeIsFinite: boolean = Number.isFinite('1');
