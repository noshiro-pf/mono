// The strict standard library ships types only, so this is a compile rather
// than a run — and what it compiles is the replacement itself.
//
// The generated project follows whichever recipe the package's own README
// gives, because the two TypeScript versions resolve a lib replacement in
// exclusive ways: TypeScript 7 reads `paths`, and TypeScript 6 and earlier
// resolve `@typescript/lib-*` by name, from the symlinks the package's own
// `link-libs.mjs` creates. Either way, a layout that is not what TypeScript
// asks for makes the replacement silently not happen — there is no error for
// it — and this file stops erroring where it is told to expect an error.

// @ts-expect-error A string is not a `number`, which is what the strict
// standard library narrows this parameter to. Under the stock library the
// parameter is `unknown` and this line is fine — which is the failure this
// check exists to catch.
export const probeIsFinite: boolean = Number.isFinite('1');

// Plain uses, to catch a replacement that resolved but broke everything else.
export const rounded: number = Math.round(1.5);

export const joined: string = ['a', 'b'].join('-');
