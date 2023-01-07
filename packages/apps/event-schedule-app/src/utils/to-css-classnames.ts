export const toClassName = (flags: Record<string, boolean>): string =>
  Obj.entries(flags)
    .filter(([_k, v]) => v)
    .map(([k, _v]) => k)
    .join(' ');
