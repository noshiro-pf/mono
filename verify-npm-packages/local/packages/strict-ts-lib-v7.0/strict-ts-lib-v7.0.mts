// The strict standard library ships types only, so this is a compile rather
// than a run — and what it compiles is the replacement itself.
//
// The generated `tsconfig.json` sets `libReplacement` and points `paths` at
// `./node_modules/<package>/libs/*`, which is what the package README tells a
// consumer to write. If the tarball's layout is not what TypeScript asks for,
// the replacement silently does not happen — there is no error for it — and
// this file stops erroring where it is told to expect an error.

// @ts-expect-error A string is not a `number`, which is what the strict
// standard library narrows this parameter to. Under the stock library the
// parameter is `unknown` and this line is fine — which is the failure this
// check exists to catch.
export const probeIsFinite: boolean = Number.isFinite('1');

// Plain uses, to catch a replacement that resolved but broke everything else.
export const rounded: number = Math.round(1.5);

export const joined: string = ['a', 'b'].join('-');
