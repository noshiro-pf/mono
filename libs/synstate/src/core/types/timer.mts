/**
 * Timer handle for Node.js / browser compatibility.
 *
 * Defined by what `clearTimeout` accepts rather than by what `setTimeout`
 * returns. The two are not the same type under the strict standard library:
 * `setTimeout` there returns `{} | null`, which `clearTimeout`'s
 * `number | undefined` parameter rejects. Every use of this type here is a
 * handle on its way to `clearTimeout` / `clearInterval`, so the consumer's
 * side is the one that has to fit.
 */
export type TimerId = NonNullable<Parameters<typeof clearTimeout>[0]>;
