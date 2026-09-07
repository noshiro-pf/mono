// @sumi-expect banned-syntax/no-eval
export const viaEval = eval('1 + 1');

// @sumi-expect banned-syntax/no-eval
export const viaFunction = new Function('return 1');

// @sumi-expect banned-syntax/no-eval
setTimeout('run()', 1);
