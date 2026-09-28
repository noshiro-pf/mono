// A dynamic import's specifier is judged under a type wrapper, and written as
// a template literal with no substitutions, as it is written as a string.
// @sumi-expect-error modules/no-internal-module-import
const wrapped = await import('../valid/helper.mjs' satisfies string);

// @sumi-expect-error modules/no-internal-module-import
const template = await import(`../valid/helper.mjs`);

export const values = [wrapped.sibling, template.sibling] as const;
