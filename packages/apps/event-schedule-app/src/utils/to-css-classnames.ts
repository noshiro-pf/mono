export const toClassName = (flags: ReadonlyRecord<string, boolean>): string =>
  Obj.entries(flags)
    .filter(([_k, v]) => v)
    .map(([k, _v]) => k)
    .join(' ');
