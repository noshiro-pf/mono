// `@sumi-expect-error-file` answers for the whole file, so it goes above the
// first code line and covers every line below…
// @sumi-expect-error-file banned-syntax/no-var
// …and is reported on its own line when nothing in the file answers it.
// @sumi-expect-error-file banned-syntax/no-class

export var first = 1;

export var second = 2;

// Below code it would read as covering only what follows it, so it is reported
// as invalid and suppresses nothing.
// @sumi-expect-error-file null/no-null-literal
export const third = null;
