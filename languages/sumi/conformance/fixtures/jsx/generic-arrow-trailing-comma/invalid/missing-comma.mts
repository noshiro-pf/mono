// In a .mts file TypeScript (and oxlint's parser) reserve this spelling
// outright: the file does not parse, so no lint rule can run on it and only
// the compiler diagnostic appears. The rule's own positive cases are `.ts` /
// `.tsx` files, covered by the preset's unit test until the corpus takes
// `.tsx` fixtures.
// @sumi-expect-error compiler/7060
export const identity = <T>(value: T): T => value;
