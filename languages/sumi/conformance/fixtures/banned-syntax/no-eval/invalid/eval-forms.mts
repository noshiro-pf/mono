// @sumi-expect-error banned-syntax/no-eval
export const viaEval = eval('1 + 1');

// @sumi-expect-error banned-syntax/no-eval
export const viaFunction = new Function('return 1');

// The strict standard library takes only a function here, so the compiler
// rejects the string form as well.
// @sumi-expect-error banned-syntax/no-eval
// @sumi-expect-error compiler/2345
setTimeout('run()', 1);
