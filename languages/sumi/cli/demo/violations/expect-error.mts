// `@sumi-expect-error` suppresses the diagnostic it names on the next line…
// @sumi-expect-error banned-syntax/no-var
export var suppressed = 1;

// …and is itself reported when nothing on that line answers it.
// @sumi-expect-error banned-syntax/no-var
export const unused = 1;
