// `undefined` is how Sumi says "no value"; the boundary normalizes with
// `?? undefined` so no declaration ever carries `null`.
export type MaybeName = string | undefined;

export const find = (
  names: readonly string[],
  wanted: string,
): string | undefined => names.find((name) => name === wanted);

export type Box = Readonly<{ value: number | undefined }>;
