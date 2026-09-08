import * as ns from '../helper.mjs';

const use = (module: Readonly<{ helper: number }>): number => module.helper;

// @sumi-expect-error modules/no-namespace-object-use
export const passed = use(ns);

// @sumi-expect-error modules/no-namespace-object-use
export const aliased = ns;

// @sumi-expect-error modules/no-namespace-object-use
export const spread = { ...ns };

// @sumi-expect-error modules/no-namespace-object-use
export const computed = ns['helper'];
